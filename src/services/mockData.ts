import { ServiceCenter, Manager, VehicleRecord } from '../types';

export const INITIAL_SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: 'sc-car-1',
    name: 'SpeedCraft Car Studio',
    location: 'Indiranagar, Bengaluru',
    type: 'car',
    contact: '+91 98450 12345',
    email: 'indiranagar@speedcraft.com',
    address: '100ft Road, Near Sony Signal, Indiranagar, Bengaluru - 560038',
    createdAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 'sc-bike-1',
    name: 'MotoShine Bike Hub',
    location: 'Koramangala, Bengaluru',
    type: 'bike',
    contact: '+91 98450 67890',
    email: 'koramangala@motoshine.com',
    address: '5th Block, Jyoti Nivas College Road, Koramangala, Bengaluru - 560095',
    createdAt: '2026-01-12T10:30:00Z'
  },
  {
    id: 'sc-car-2',
    name: 'Apex Auto Detailing',
    location: 'Bandra West, Mumbai',
    type: 'car',
    contact: '+91 98200 44556',
    email: 'bandra@apexauto.in',
    address: 'Linking Road, Bandra West, Mumbai - 400050',
    createdAt: '2026-02-01T11:15:00Z'
  },
  {
    id: 'sc-bike-2',
    name: 'Royal Wheels Two-Wheeler Spa',
    location: 'Andheri East, Mumbai',
    type: 'bike',
    contact: '+91 98200 77889',
    email: 'andheri@royalwheels.in',
    address: 'Saki Naka Junction, Andheri East, Mumbai - 400072',
    createdAt: '2026-02-05T14:20:00Z'
  }
];

export const INITIAL_MANAGERS: Manager[] = [
  {
    id: 'mgr-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 00001',
    pin: '12345678',
    serviceCenterId: 'sc-car-1',
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'mgr-2',
    name: 'Amit Patel',
    phone: '+91 98765 00002',
    pin: '23456789',
    serviceCenterId: 'sc-bike-1',
    status: 'active',
    createdAt: '2026-01-16T11:00:00Z'
  },
  {
    id: 'mgr-3',
    name: 'Vikram Singh',
    phone: '+91 98765 00003',
    pin: '34567890',
    serviceCenterId: 'sc-car-2',
    status: 'active',
    createdAt: '2026-02-02T10:00:00Z'
  },
  {
    id: 'mgr-4',
    name: 'Suresh Kumar',
    phone: '+91 98765 00004',
    pin: '45678901',
    serviceCenterId: 'sc-bike-2',
    status: 'active',
    createdAt: '2026-02-08T12:00:00Z'
  }
];

// High quality mock images for initial inspection demonstration
export const SAMPLE_CAR_BEFORE = {
  front_left_door: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  front_right_door: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
  rear_left_door: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  rear_right_door: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  front: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  rear: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
  dashboard: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  roof: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
  dicky: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  other_1: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  other_2: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  other_3: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
};

export const SAMPLE_CAR_AFTER = {
  front_left_door: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  front_right_door: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
  rear_left_door: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  rear_right_door: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  front: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
  rear: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
  dashboard: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  roof: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
  dicky: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  other_1: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  other_2: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  other_3: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
};

export const SAMPLE_BIKE_BEFORE = {
  bike_front: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  bike_rear: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  bike_left: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  bike_right: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=800&q=80',
};

export const SAMPLE_BIKE_AFTER = {
  bike_front: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  bike_rear: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  bike_left: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  bike_right: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=800&q=80',
};

export const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: 'veh-car-101',
    serviceCenterId: 'sc-car-1',
    vehicleNumber: 'KA 05 MN 4821',
    vehicleType: 'car',
    serviceType: 'Deep Detailing & Ceramic Coat',
    customerName: 'Karthik Rao',
    customerPhone: '+91 99887 11223',
    status: 'checked_out',
    managerId: 'mgr-1',
    managerName: 'Rahul Sharma',
    checkinTime: '2026-11-16T10:15:00Z',
    checkoutTime: '2026-11-16T16:45:00Z',
    checkinPhotos: SAMPLE_CAR_BEFORE,
    checkoutPhotos: SAMPLE_CAR_AFTER,
    notes: 'Customer requested special attention on minor scratch on front-left door.'
  },
  {
    id: 'veh-car-102',
    serviceCenterId: 'sc-car-1',
    vehicleNumber: 'KA 03 JK 9901',
    vehicleType: 'car',
    serviceType: 'Full Body Paint Protection',
    customerName: 'Pooja Hegde',
    customerPhone: '+91 99887 33445',
    status: 'checked_in',
    managerId: 'mgr-1',
    managerName: 'Rahul Sharma',
    checkinTime: '2026-11-16T14:30:00Z',
    checkinPhotos: SAMPLE_CAR_BEFORE,
    checkoutPhotos: {},
    notes: 'Roof wrap inspection and dust cleaning.'
  },
  {
    id: 'veh-bike-201',
    serviceCenterId: 'sc-bike-1',
    vehicleNumber: 'KA 01 TR 7712',
    vehicleType: 'bike',
    serviceType: 'Ceramic Coating',
    customerName: 'Rohan Deshmukh',
    customerPhone: '+91 91234 56789',
    status: 'checked_out',
    managerId: 'mgr-2',
    managerName: 'Amit Patel',
    checkinTime: '2026-11-16T09:45:00Z',
    checkoutTime: '2026-11-16T15:20:00Z',
    checkinPhotos: SAMPLE_BIKE_BEFORE,
    checkoutPhotos: SAMPLE_BIKE_AFTER,
    notes: 'Royal Enfield Hunter 350 - Gloss finish ceramic coat applied.'
  },
  {
    id: 'veh-bike-202',
    serviceCenterId: 'sc-bike-1',
    vehicleNumber: 'KA 04 EQ 3319',
    vehicleType: 'bike',
    serviceType: 'PPF Coating',
    customerName: 'Naveen Kumar',
    customerPhone: '+91 98888 12345',
    status: 'checked_in',
    managerId: 'mgr-2',
    managerName: 'Amit Patel',
    checkinTime: '2026-11-16T16:00:00Z',
    checkinPhotos: SAMPLE_BIKE_BEFORE,
    checkoutPhotos: {},
    notes: 'KTM Duke 390 - Tank and side cowl PPF installation.'
  },
  {
    id: 'veh-car-103',
    serviceCenterId: 'sc-car-2',
    vehicleNumber: 'MH 02 FP 1109',
    vehicleType: 'car',
    serviceType: 'Teflon Coating & Interior Spa',
    customerName: 'Farhan Akhtar',
    customerPhone: '+91 98201 22334',
    status: 'checked_out',
    managerId: 'mgr-3',
    managerName: 'Vikram Singh',
    checkinTime: '2026-11-14T11:00:00Z',
    checkoutTime: '2026-11-14T14:45:00Z',
    checkinPhotos: SAMPLE_CAR_BEFORE,
    checkoutPhotos: SAMPLE_CAR_AFTER,
    notes: 'BMW 3-Series - Leather seat conditioning and nano ceramic top coat.'
  },
  {
    id: 'veh-bike-203',
    serviceCenterId: 'sc-bike-2',
    vehicleNumber: 'MH 03 DZ 6620',
    vehicleType: 'bike',
    serviceType: 'Full Foam Wash & Chain Lube',
    customerName: 'Sanjay Varma',
    customerPhone: '+91 98202 33445',
    status: 'checked_out',
    managerId: 'mgr-4',
    managerName: 'Suresh Nair',
    checkinTime: '2026-11-12T09:30:00Z',
    checkoutTime: '2026-11-12T11:15:00Z',
    checkinPhotos: SAMPLE_BIKE_BEFORE,
    checkoutPhotos: SAMPLE_BIKE_AFTER,
    notes: 'Kawasaki Ninja 650 - Complete steam wash & chain tensioning.'
  },
  {
    id: 'veh-car-104',
    serviceCenterId: 'sc-car-1',
    vehicleNumber: 'KA 51 ME 7788',
    vehicleType: 'car',
    serviceType: 'Full Body Paint Protection',
    customerName: 'Deepa Narayan',
    customerPhone: '+91 99887 55667',
    status: 'checked_out',
    managerId: 'mgr-1',
    managerName: 'Rahul Sharma',
    checkinTime: '2026-11-05T10:00:00Z',
    checkoutTime: '2026-11-05T17:30:00Z',
    checkinPhotos: SAMPLE_CAR_BEFORE,
    checkoutPhotos: SAMPLE_CAR_AFTER,
    notes: 'Hyundai Ioniq 5 - Full body TPU PPF installation.'
  },
  {
    id: 'veh-bike-204',
    serviceCenterId: 'sc-bike-1',
    vehicleNumber: 'KA 05 AB 1234',
    vehicleType: 'bike',
    serviceType: 'Ceramic Coating',
    customerName: 'Arjun Menon',
    customerPhone: '+91 91234 11223',
    status: 'checked_out',
    managerId: 'mgr-2',
    managerName: 'Amit Patel',
    checkinTime: '2026-10-24T12:00:00Z',
    checkoutTime: '2026-10-24T14:45:00Z',
    checkinPhotos: SAMPLE_BIKE_BEFORE,
    checkoutPhotos: SAMPLE_BIKE_AFTER,
    notes: 'Yamaha R15 V4 - 3 year ceramic coat warranty.'
  }
];
