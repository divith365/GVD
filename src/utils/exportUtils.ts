import * as XLSX from 'xlsx';
import { VehicleRecord, ServiceCenter, Manager } from '../types';

export interface ExportFilterOptions {
  centerName?: string;
  statusFilter?: string;
}

export function exportVehiclesToExcel(
  vehicles: VehicleRecord[],
  centers: ServiceCenter[],
  managers: Manager[],
  options?: ExportFilterOptions
) {
  // Format rows for Excel
  const rows = vehicles.map((v, index) => {
    const center = centers.find(c => c.id === v.serviceCenterId);
    const isCompleted = v.status === 'checked_out';
    const checkinDate = v.checkinTime ? new Date(v.checkinTime) : null;
    const checkoutDate = v.checkoutTime ? new Date(v.checkoutTime) : null;

    // Calculate duration in minutes / hours
    let durationText = 'In Service (In Progress)';
    if (checkinDate && checkoutDate) {
      const diffMs = checkoutDate.getTime() - checkinDate.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));
      if (diffMins < 60) {
        durationText = `${diffMins} mins`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        durationText = `${hours}h ${mins}m`;
      }
    }

    const checkinPhotosCount = Object.keys(v.checkinPhotos || {}).length;
    const checkoutPhotosCount = Object.keys(v.checkoutPhotos || {}).length;

    return {
      'Sl No': index + 1,
      'Vehicle Number': v.vehicleNumber,
      'Vehicle Type': v.vehicleType ? v.vehicleType.toUpperCase() : 'CAR',
      'Service Type': v.serviceType || 'Standard Inspection & Service',
      'Status': isCompleted ? 'Completed (Checked Out)' : 'In Service (Active)',
      'Service Center': center?.name || 'Unknown Center',
      'Center Location': center?.location || '-',
      'Customer Name': v.customerName || 'Walk-in Customer',
      'Customer Phone': v.customerPhone || '-',
      'Check-in Date': checkinDate ? checkinDate.toLocaleDateString('en-IN') : '-',
      'Check-in Time': checkinDate ? checkinDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
      'Check-in Manager': v.managerName || '-',
      'Check-in Photos Count': checkinPhotosCount,
      'Check-out Date': checkoutDate ? checkoutDate.toLocaleDateString('en-IN') : '-',
      'Check-out Time': checkoutDate ? checkoutDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
      'Check-out Photos Count': checkoutPhotosCount,
      'Total Inspection Photos': checkinPhotosCount + checkoutPhotosCount,
      'Turnaround Duration': durationText,
      'Inspection Notes / Damages': v.notes || 'None noted',
      'Cloudflare R2 Storage': 'Synced (WebP Optimized)'
    };
  });

  // 1. Create a new workbook
  const wb = XLSX.utils.book_new();

  // 2. Convert rows to worksheet
  const ws = XLSX.utils.json_to_sheet(rows);

  // 3. Set custom column widths for clean readability in Excel
  ws['!cols'] = [
    { wch: 6 },  // Sl No
    { wch: 16 }, // Vehicle Number
    { wch: 14 }, // Vehicle Type
    { wch: 26 }, // Service Type
    { wch: 22 }, // Status
    { wch: 28 }, // Service Center
    { wch: 20 }, // Location
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Customer Phone
    { wch: 14 }, // Check-in Date
    { wch: 14 }, // Check-in Time
    { wch: 20 }, // Check-in Manager
    { wch: 20 }, // Check-in Photos
    { wch: 14 }, // Check-out Date
    { wch: 14 }, // Check-out Time
    { wch: 20 }, // Check-out Photos
    { wch: 22 }, // Total Photos
    { wch: 22 }, // Turnaround Duration
    { wch: 30 }, // Notes
    { wch: 26 }, // Storage
  ];

  // 4. Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Inspections');

  // 5. Also add Summary KPI worksheet
  const inServiceCount = vehicles.filter(v => v.status === 'checked_in').length;
  const completedCount = vehicles.filter(v => v.status === 'checked_out').length;
  const carCount = vehicles.filter(v => v.vehicleType === 'car').length;
  const bikeCount = vehicles.filter(v => v.vehicleType === 'bike').length;

  const summaryData = [
    { Metric: 'Report Generated', Value: new Date().toLocaleString('en-IN') },
    { Metric: 'Selected Filter', Value: options?.centerName || 'All Service Centers' },
    { Metric: 'Status Filter', Value: options?.statusFilter || 'All Statuses' },
    { Metric: 'Total Vehicle Records', Value: vehicles.length },
    { Metric: 'Active (In Service)', Value: inServiceCount },
    { Metric: 'Completed Checkouts', Value: completedCount },
    { Metric: 'Car Inspections', Value: carCount },
    { Metric: 'Bike Inspections', Value: bikeCount },
    { Metric: 'Cloudflare D1 SQL Status', Value: 'Connected & Active' },
    { Metric: 'Cloudflare R2 Bucket', Value: 'gvd-inspection-photos' }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Overview');

  // 6. Generate filename and trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanCenter = (options?.centerName || 'All_Centers').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `GVD_AutoWorld_Inspections_${cleanCenter}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Fallback CSV export with UTF-8 BOM for immediate spreadsheet compatibility
 */
export function exportVehiclesToCSV(
  vehicles: VehicleRecord[],
  centers: ServiceCenter[],
  filename = 'GVD_Vehicle_Inspections.csv'
) {
  const headers = [
    'Sl No',
    'Vehicle Number',
    'Type',
    'Service',
    'Status',
    'Center',
    'Customer',
    'Phone',
    'Checkin Time',
    'Checkout Time',
    'Duration',
    'Checkin Photos',
    'Checkout Photos',
    'Notes'
  ];

  const lines = vehicles.map((v, i) => {
    const center = centers.find(c => c.id === v.serviceCenterId);
    const isCompleted = v.status === 'checked_out';
    const checkinStr = v.checkinTime ? new Date(v.checkinTime).toLocaleString('en-IN') : '-';
    const checkoutStr = v.checkoutTime ? new Date(v.checkoutTime).toLocaleString('en-IN') : '-';
    
    let duration = 'In Progress';
    if (v.checkinTime && v.checkoutTime) {
      const diffMins = Math.round((new Date(v.checkoutTime).getTime() - new Date(v.checkinTime).getTime()) / 60000);
      duration = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    }

    return [
      i + 1,
      `"${v.vehicleNumber}"`,
      `"${v.vehicleType}"`,
      `"${v.serviceType || '-'}"`,
      `"${isCompleted ? 'Completed' : 'In Service'}"`,
      `"${center?.name || '-'}"`,
      `"${v.customerName || '-'}"`,
      `"${v.customerPhone || '-'}"`,
      `"${checkinStr}"`,
      `"${checkoutStr}"`,
      `"${duration}"`,
      Object.keys(v.checkinPhotos || {}).length,
      Object.keys(v.checkoutPhotos || {}).length,
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
