export type ServiceCenterType = 'car' | 'bike';

export interface ServiceCenter {
  id: string;
  name: string;
  location: string;
  type: ServiceCenterType;
  contact: string;
  email?: string;
  address: string;
  createdAt: string;
}

export interface Manager {
  id: string;
  name: string;
  phone: string;
  pin: string; // 4-digit PIN for quick login
  serviceCenterId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type BikeServiceType =
  | 'Wash'
  | 'Teflon Coating'
  | 'Ceramic Coating'
  | 'PPF Coating'
  | 'Other Service';

export type VehicleStatus = 'checked_in' | 'in_progress' | 'checked_out';

export interface PhotoSlot {
  key: string;
  label: string;
  category: string;
  required: boolean;
  description: string;
  iconName?: string;
}

export interface VehicleRecord {
  id: string;
  serviceCenterId: string;
  vehicleNumber: string;
  vehicleType: ServiceCenterType;
  serviceType?: BikeServiceType | string;
  customerName?: string;
  customerPhone?: string;
  status: VehicleStatus;
  managerId: string;
  managerName: string;
  checkinTime: string;
  checkoutTime?: string;
  checkinPhotos: Record<string, string>; // slotKey -> image URL / base64
  checkoutPhotos: Record<string, string>; // slotKey -> image URL / base64
  notes?: string;
}

export const CAR_PHOTO_SLOTS: PhotoSlot[] = [
  { key: 'front_left_door', label: 'Front Left Door', category: 'Doors', required: true, description: 'Driver side front door panel & handle' },
  { key: 'front_right_door', label: 'Front Right Door', category: 'Doors', required: true, description: 'Passenger side front door' },
  { key: 'rear_left_door', label: 'Rear Left Door', category: 'Doors', required: true, description: 'Rear left door & panel' },
  { key: 'rear_right_door', label: 'Rear Right Door', category: 'Doors', required: true, description: 'Rear right door & panel' },
  { key: 'front', label: 'Front View', category: 'Body', required: true, description: 'Full front bonnet, bumper & headlights' },
  { key: 'rear', label: 'Rear View', category: 'Body', required: true, description: 'Full rear bumper, tail lights & number plate' },
  { key: 'dashboard', label: 'Dashboard & Console', category: 'Interior', required: true, description: 'Steering, meter console & infotainment' },
  { key: 'roof', label: 'Roof Top', category: 'Body', required: true, description: 'Car roof surface & sunroof' },
  { key: 'dicky', label: 'Dicky / Boot', category: 'Interior', required: true, description: 'Boot space & spare tire area' },
  { key: 'other_1', label: 'Other Angle 1', category: 'Additional', required: false, description: 'Scratches, wheels or special area 1' },
  { key: 'other_2', label: 'Other Angle 2', category: 'Additional', required: false, description: 'Scratches, wheels or special area 2' },
  { key: 'other_3', label: 'Other Angle 3', category: 'Additional', required: false, description: 'Scratches, wheels or special area 3' },
];

export const BIKE_PHOTO_SLOTS: PhotoSlot[] = [
  { key: 'bike_front', label: 'Front View', category: 'Exterior', required: true, description: 'Headlamp, visor, mudguard & front tire' },
  { key: 'bike_rear', label: 'Rear View', category: 'Exterior', required: true, description: 'Tail lamp, exhaust & rear tire' },
  { key: 'bike_left', label: 'Left Side', category: 'Exterior', required: true, description: 'Fuel tank, engine & left side panels' },
  { key: 'bike_right', label: 'Right Side', category: 'Exterior', required: true, description: 'Exhaust, engine & right side panels' },
];

export const BIKE_SERVICES: BikeServiceType[] = [
  'Wash',
  'Teflon Coating',
  'Ceramic Coating',
  'PPF Coating',
  'Other Service'
];
