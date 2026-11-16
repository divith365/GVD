import { ServiceCenter, Manager, VehicleRecord, ServiceCenterType, BikeServiceType } from '../types';
import { INITIAL_SERVICE_CENTERS, INITIAL_MANAGERS, INITIAL_VEHICLES } from './mockData';

const STORAGE_KEYS = {
  CENTERS: 'gvd_service_centers_v1',
  MANAGERS: 'gvd_managers_v1',
  VEHICLES: 'gvd_vehicles_v1',
  ACTIVE_SESSION: 'gvd_session_v1'
};

export interface SessionUser {
  role: 'admin' | 'manager';
  name: string;
  managerId?: string;
  serviceCenterId?: string;
  serviceCenter?: ServiceCenter;
}

class AppStore {
  private centers: ServiceCenter[] = [];
  private managers: Manager[] = [];
  private vehicles: VehicleRecord[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
    this.syncWithCloudflareD1();
  }

  private init() {
    const storedCenters = localStorage.getItem(STORAGE_KEYS.CENTERS);
    const storedManagers = localStorage.getItem(STORAGE_KEYS.MANAGERS);
    const storedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);

    this.centers = storedCenters ? JSON.parse(storedCenters) : [...INITIAL_SERVICE_CENTERS];
    this.managers = storedManagers ? JSON.parse(storedManagers) : [...INITIAL_MANAGERS];
    this.vehicles = storedVehicles ? JSON.parse(storedVehicles) : [...INITIAL_VEHICLES];

    if (!storedCenters) this.saveCenters();
    if (!storedManagers) this.saveManagers();
    if (!storedVehicles) this.saveVehicles();
  }

  /**
   * Syncs live records from Cloudflare D1 SQL database
   */
  async syncWithCloudflareD1() {
    try {
      const [centersRes, managersRes, vehiclesRes] = await Promise.allSettled([
        fetch('/api/centers'),
        fetch('/api/managers'),
        fetch('/api/vehicles')
      ]);

      if (centersRes.status === 'fulfilled' && centersRes.value.ok) {
        const d1Centers = await centersRes.value.json();
        if (Array.isArray(d1Centers) && d1Centers.length > 0) {
          this.centers = d1Centers;
          this.saveCenters();
        }
      }

      if (managersRes.status === 'fulfilled' && managersRes.value.ok) {
        const d1Managers = await managersRes.value.json();
        if (Array.isArray(d1Managers) && d1Managers.length > 0) {
          this.managers = d1Managers;
          this.saveManagers();
        }
      }

      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.ok) {
        const d1Vehicles = await vehiclesRes.value.json();
        if (Array.isArray(d1Vehicles) && d1Vehicles.length > 0) {
          this.vehicles = d1Vehicles;
          this.saveVehicles();
        }
      }
    } catch (e) {
      // Running offline or in local preview without api
      console.log('Using local offline cache for state');
    }
  }

  private saveCenters() {
    localStorage.setItem(STORAGE_KEYS.CENTERS, JSON.stringify(this.centers));
    this.notify();
  }

  private saveManagers() {
    localStorage.setItem(STORAGE_KEYS.MANAGERS, JSON.stringify(this.managers));
    this.notify();
  }

  private saveVehicles() {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(this.vehicles));
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- SERVICE CENTERS ---
  getServiceCenters(): ServiceCenter[] {
    return [...this.centers];
  }

  getServiceCenterById(id: string): ServiceCenter | undefined {
    return this.centers.find(c => c.id === id);
  }

  addServiceCenter(data: Omit<ServiceCenter, 'id' | 'createdAt'>): ServiceCenter {
    const newCenter: ServiceCenter = {
      ...data,
      id: `sc-${data.type}-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.centers.unshift(newCenter);
    this.saveCenters();

    // Sync to Cloudflare D1 asynchronously
    fetch('/api/centers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.log('D1 center sync error', err));

    return newCenter;
  }

  updateServiceCenter(id: string, updates: Partial<ServiceCenter>) {
    this.centers = this.centers.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveCenters();
  }

  // --- MANAGERS ---
  getManagers(): Manager[] {
    return [...this.managers];
  }

  getManagersByCenter(centerId: string): Manager[] {
    return this.managers.filter(m => m.serviceCenterId === centerId);
  }

  addManager(data: Omit<Manager, 'id' | 'createdAt' | 'status'>): Manager {
    const newMgr: Manager = {
      ...data,
      id: `mgr-${Date.now().toString(36)}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.managers.unshift(newMgr);
    this.saveManagers();

    // Sync to Cloudflare D1
    fetch('/api/managers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.log('D1 manager sync error', err));

    return newMgr;
  }

  updateManager(id: string, updates: Partial<Manager>) {
    this.managers = this.managers.map(m => m.id === id ? { ...m, ...updates } : m);
    this.saveManagers();
  }

  verifyManagerPin(pin: string): { manager: Manager; center: ServiceCenter } | null {
    const manager = this.managers.find(m => m.pin === pin && m.status === 'active');
    if (!manager) return null;
    const center = this.centers.find(c => c.id === manager.serviceCenterId);
    if (!center) return null;
    return { manager, center };
  }

  // --- VEHICLES / INSPECTIONS ---
  getVehicles(serviceCenterId?: string): VehicleRecord[] {
    if (serviceCenterId) {
      return this.vehicles.filter(v => v.serviceCenterId === serviceCenterId);
    }
    return [...this.vehicles];
  }

  getVehicleById(id: string): VehicleRecord | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  createVehicleCheckin(params: {
    serviceCenterId: string;
    vehicleNumber: string;
    vehicleType: ServiceCenterType;
    serviceType?: BikeServiceType | string;
    customerName?: string;
    customerPhone?: string;
    managerId: string;
    managerName: string;
    checkinPhotos: Record<string, string>;
    notes?: string;
  }): VehicleRecord {
    const newRecord: VehicleRecord = {
      id: `veh-${params.vehicleType}-${Date.now().toString(36)}`,
      serviceCenterId: params.serviceCenterId,
      vehicleNumber: params.vehicleNumber.toUpperCase().trim(),
      vehicleType: params.vehicleType,
      serviceType: params.serviceType,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      status: 'checked_in',
      managerId: params.managerId,
      managerName: params.managerName,
      checkinTime: new Date().toISOString(),
      checkinPhotos: params.checkinPhotos,
      checkoutPhotos: {},
      notes: params.notes
    };
    this.vehicles.unshift(newRecord);
    this.saveVehicles();

    // Sync to Cloudflare D1
    fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).catch(err => console.log('D1 vehicle checkin sync error', err));

    return newRecord;
  }

  submitVehicleCheckout(id: string, checkoutPhotos: Record<string, string>, notes?: string): VehicleRecord | null {
    const existing = this.getVehicleById(id);
    if (!existing) return null;

    const updated: VehicleRecord = {
      ...existing,
      status: 'checked_out',
      checkoutTime: new Date().toISOString(),
      checkoutPhotos,
      notes: notes !== undefined ? notes : existing.notes
    };

    this.vehicles = this.vehicles.map(v => v.id === id ? updated : v);
    this.saveVehicles();

    // Sync to Cloudflare D1
    fetch('/api/vehicles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, checkoutPhotos, notes })
    }).catch(err => console.log('D1 vehicle checkout sync error', err));

    return updated;
  }

  resetToDefaults() {
    this.centers = [...INITIAL_SERVICE_CENTERS];
    this.managers = [...INITIAL_MANAGERS];
    this.vehicles = [...INITIAL_VEHICLES];
    this.saveCenters();
    this.saveManagers();
    this.saveVehicles();
  }
}

export const appStore = new AppStore();
