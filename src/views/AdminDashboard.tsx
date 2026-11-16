import React, { useState } from 'react';
import { 
  Building2, Users, Car, Bike, Plus, Search, ShieldCheck, 
  MapPin, Phone, KeyRound, CheckCircle2, SplitSquareVertical, 
  Cloud, Database, ExternalLink, Eye, EyeOff, Sparkles, Filter
} from 'lucide-react';
import { ServiceCenter, Manager, VehicleRecord, ServiceCenterType } from '../types';
import { appStore, SessionUser } from '../services/store';

interface AdminDashboardProps {
  session: SessionUser;
  vehicles: VehicleRecord[];
  onViewComparison: (vehicle: VehicleRecord) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  vehicles,
  onViewComparison
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'centers' | 'managers' | 'cloudflare'>('vehicles');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Center form state
  const [centerName, setCenterName] = useState('');
  const [centerLocation, setCenterLocation] = useState('');
  const [centerType, setCenterType] = useState<ServiceCenterType>('car');
  const [centerContact, setCenterContact] = useState('');
  const [centerEmail, setCenterEmail] = useState('');
  const [centerAddress, setCenterAddress] = useState('');

  // Manager form state
  const [mgrName, setMgrName] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrCenterId, setMgrCenterId] = useState('');
  const [mgrPin, setMgrPin] = useState('');

  const centers = appStore.getServiceCenters();
  const managers = appStore.getManagers();

  // Filtered vehicles based on selected center dropdown
  const filteredVehicles = vehicles.filter(v => {
    if (selectedCenterId !== 'all' && v.serviceCenterId !== selectedCenterId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.vehicleNumber.toLowerCase().includes(q) ||
        (v.customerName && v.customerName.toLowerCase().includes(q)) ||
        (v.serviceType && v.serviceType.toLowerCase().includes(q));
    }
    return true;
  });

  const selectedCenter = centers.find(c => c.id === selectedCenterId);

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerName || !centerLocation) return;

    appStore.addServiceCenter({
      name: centerName.trim(),
      location: centerLocation.trim(),
      type: centerType,
      contact: centerContact.trim(),
      email: centerEmail.trim() || undefined,
      address: centerAddress.trim()
    });

    // Reset & close
    setCenterName('');
    setCenterLocation('');
    setCenterContact('');
    setCenterEmail('');
    setCenterAddress('');
    setIsAddCenterOpen(false);
  };

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgrName || !mgrCenterId || !mgrPin) return;

    appStore.addManager({
      name: mgrName.trim(),
      phone: mgrPhone.trim(),
      pin: mgrPin.trim(),
      serviceCenterId: mgrCenterId
    });

    setMgrName('');
    setMgrPhone('');
    setMgrCenterId('');
    setMgrPin('');
    setIsAddManagerOpen(false);
  };

  const handleAutoGeneratePin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setMgrPin(randomPin);
  };

  const togglePinReveal = (mgrId: string) => {
    setRevealedPins(prev => ({ ...prev, [mgrId]: !prev[mgrId] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Top Banner & Center Selector Dropdown */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Admin Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-Center Management, Manager PINs, Inspection Records & Side-by-Side Photo Comparison
            </p>
          </div>

          {/* Service Center Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
            <Filter className="w-4 h-4 text-brand-400 ml-1" />
            <label className="text-xs font-semibold text-slate-400">Service Center:</label>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Service Centers ({centers.length})</option>
              <optgroup label="Car Service Centers">
                {centers.filter(c => c.type === 'car').map(c => (
                  <option key={c.id} value={c.id}>🚗 {c.name} ({c.location})</option>
                ))}
              </optgroup>
              <optgroup label="Bike Service Centers">
                {centers.filter(c => c.type === 'bike').map(c => (
                  <option key={c.id} value={c.id}>🏍️ {c.name} ({c.location})</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Selected Center Details if specific center selected */}
        {selectedCenter && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
            <div className="flex items-center gap-4">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                {selectedCenter.type === 'car' ? <Car className="w-4 h-4 text-blue-400" /> : <Bike className="w-4 h-4 text-emerald-400" />}
                {selectedCenter.name}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {selectedCenter.address || selectedCenter.location}
              </span>
              {selectedCenter.contact && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedCenter.contact}
                </span>
              )}
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold uppercase">
              {selectedCenter.type} Service Center
            </span>
          </div>
        )}

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Total Centers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{centers.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">({centers.filter(c => c.type === 'car').length} Car / {centers.filter(c => c.type === 'bike').length} Bike)</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium block">Active Managers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{managers.length}</span>
              <span className="text-[10px] text-emerald-400 font-medium">PIN Enabled</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-sky-400 font-medium block">In Service (Active)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {vehicles.filter(v => (selectedCenterId === 'all' || v.serviceCenterId === selectedCenterId) && v.status === 'checked_in').length}
              </span>
              <span className="text-[10px] text-slate-500">Vehicles</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-emerald-400 font-medium block">Completed Checkouts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {vehicles.filter(v => (selectedCenterId === 'all' || v.serviceCenterId === selectedCenterId) && v.status === 'checked_out').length}
              </span>
              <span className="text-[10px] text-emerald-400">Ready to Compare</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              activeTab === 'vehicles'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4 text-sky-300" />
            <span>Vehicles & Inspections ({filteredVehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              activeTab === 'centers'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>Service Centers ({centers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('managers')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              activeTab === 'managers'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-300" />
            <span>Managers & PINs ({managers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
              activeTab === 'cloudflare'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-orange-400" />
            <span>Cloudflare D1 & R2</span>
          </button>
        </div>

        {/* Quick action button depending on tab */}
        {activeTab === 'centers' && (
          <button
            onClick={() => setIsAddCenterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Center</span>
          </button>
        )}
        {activeTab === 'managers' && (
          <button
            onClick={() => setIsAddManagerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manager & PIN</span>
          </button>
        )}
      </div>

      {/* TAB 1: VEHICLES & COMPARISON */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by registration number, customer, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing {filteredVehicles.length} vehicles
            </span>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <Car className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No vehicle records found for selected filter</p>
              <p className="text-xs text-slate-500 mt-1">Switch filter to "All Service Centers" or add new check-ins via Manager view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.map(v => {
                const centerOfVehicle = centers.find(c => c.id === v.serviceCenterId);
                const isCheckedOut = v.status === 'checked_out';
                const checkinPhotosCount = Object.keys(v.checkinPhotos).length;
                const checkoutPhotosCount = Object.keys(v.checkoutPhotos).length;

                return (
                  <div
                    key={v.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 transition flex flex-col justify-between space-y-3.5 group shadow-lg"
                  >
                    <div>
                      {/* Number Plate + Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-base text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                          {v.vehicleNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isCheckedOut
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {isCheckedOut ? 'Completed' : 'In Service'}
                        </span>
                      </div>

                      {/* Center & Service Type */}
                      <div className="mt-2.5 space-y-0.5">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {v.vehicleType === 'car' ? <Car className="w-3.5 h-3.5 text-blue-400" /> : <Bike className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{v.serviceType || 'Standard Inspection'}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Center: {centerOfVehicle?.name}
                        </p>
                      </div>

                      {/* Customer info */}
                      {v.customerName && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          Customer: {v.customerName} {v.customerPhone && `• ${v.customerPhone}`}
                        </p>
                      )}
                    </div>

                    {/* Inspection Photo Summary */}
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
                      <span className="text-sky-300">
                        Check-in: <strong>{checkinPhotosCount}</strong> photos
                      </span>
                      <span className={isCheckedOut ? 'text-emerald-300' : 'text-slate-500'}>
                        Check-out: <strong>{checkoutPhotosCount}</strong> photos
                      </span>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => onViewComparison(v)}
                      className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow shadow-brand-500/20 active:scale-98"
                    >
                      <SplitSquareVertical className="w-3.5 h-3.5" />
                      <span>{isCheckedOut ? 'Side-by-Side Before/After Compare' : 'Inspect Check-in Photos'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SERVICE CENTERS */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centers.map(c => {
              const centerMgrs = managers.filter(m => m.serviceCenterId === c.id);
              const centerVehs = vehicles.filter(v => v.serviceCenterId === c.id);

              return (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${
                        c.type === 'car'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {c.type === 'car' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{c.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {c.location}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      c.type === 'car'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {c.type} Center
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {c.address}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Contact: <strong className="text-slate-200">{c.contact}</strong></span>
                    <span>Managers: <strong className="text-purple-300">{centerMgrs.length}</strong></span>
                    <span>Total Jobs: <strong className="text-sky-300">{centerVehs.length}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGERS & PINs */}
      {activeTab === 'managers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers.map(mgr => {
              const assignedCenter = centers.find(c => c.id === mgr.serviceCenterId);
              const isRevealed = !!revealedPins[mgr.id];

              return (
                <div
                  key={mgr.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                        {mgr.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{mgr.name}</h4>
                        <p className="text-[11px] text-slate-400">{mgr.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  {/* Assigned Center */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Assigned Service Center</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium mt-0.5">
                      {assignedCenter?.type === 'car' ? <Car className="w-3.5 h-3.5 text-blue-400" /> : <Bike className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="truncate">{assignedCenter?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* PIN Display & Toggle */}
                  <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-400">Login PIN:</span>
                      <span className="font-mono font-bold text-sm text-amber-300">
                        {isRevealed ? mgr.pin : '••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePinReveal(mgr.id)}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title={isRevealed ? 'Hide PIN' : 'Reveal PIN'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CLOUDFLARE CONFIGURATION & READINESS */}
      {activeTab === 'cloudflare' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cloudflare R2 (Storage) & D1 (Database) Architecture</h3>
              <p className="text-xs text-slate-400">
                Ready for production binding as soon as you provide Cloudflare details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* R2 Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-orange-400" /> Cloudflare R2 Bucket
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Awaiting Credentials
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Used to store full-resolution car & bike inspection photos (Check-in & Check-out) with zero egress fees and instant CDN delivery.
              </p>
              <div className="font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                <div>Bucket Name: <span className="text-orange-400">gvd-inspection-photos</span></div>
                <div>Storage Path: <span className="text-slate-400">/photos/[centerId]/[vehicleId]/[stage]_[tag].jpg</span></div>
              </div>
            </div>

            {/* D1 Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" /> Cloudflare D1 Database
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Awaiting Credentials
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Serverless SQL database storing service centers, managers with hashed PINs, vehicle job cards, and photo metadata.
              </p>
              <div className="font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                <div>Database Name: <span className="text-cyan-400">gvd_autocare_db</span></div>
                <div>Tables: <span className="text-slate-400">service_centers, users, service_records, inspection_photos</span></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200">
            <strong>Next Step:</strong> You can share your Cloudflare Account ID and API Token (or R2 Access Keys) whenever ready, and we will connect the live Workers backend API to persist everything straight into Cloudflare D1 and R2!
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE CENTER */}
      {isAddCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-400" /> Add New Service Center
            </h3>

            <form onSubmit={handleCreateCenter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Center Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Auto Detailing Hub"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Bengaluru"
                    value={centerLocation}
                    onChange={(e) => setCenterLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Center Type *</label>
                  <select
                    value={centerType}
                    onChange={(e) => setCenterType(e.target.value as ServiceCenterType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="car">🚗 Car Service Center</option>
                    <option value="bike">🏍️ Bike Service Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={centerContact}
                    onChange={(e) => setCenterContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="center@gvd.com"
                    value={centerEmail}
                    onChange={(e) => setCenterEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Address</label>
                <textarea
                  rows={2}
                  placeholder="Plot No., Road name, Landmark, Pincode..."
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCenterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow"
                >
                  Save Service Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANAGER */}
      {isAddManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Create Manager & Assign Center PIN
            </h3>

            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Manager Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={mgrName}
                  onChange={(e) => setMgrName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 99887 76655"
                  value={mgrPhone}
                  onChange={(e) => setMgrPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Service Center *</label>
                <select
                  value={mgrCenterId}
                  onChange={(e) => setMgrCenterId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">-- Choose Service Center --</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'car' ? '🚗' : '🏍️'} {c.name} ({c.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">4-Digit Login PIN *</label>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePin}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 5566"
                  value={mgrPin}
                  onChange={(e) => setMgrPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-base font-mono font-bold text-amber-300 focus:outline-none focus:border-brand-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Manager will enter this 4-digit PIN on the mobile keypad to log in.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddManagerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
                >
                  Create Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
