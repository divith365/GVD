import React, { useState } from 'react';
import { 
  X, Car, Bike, Clock, CheckCircle2, Phone, MapPin, 
  Trash2, SplitSquareVertical, AlertTriangle, Eye, 
  Calendar, User, FileText, Check, ShieldAlert
} from 'lucide-react';
import { VehicleRecord, ServiceCenter, CAR_PHOTO_SLOTS, BIKE_PHOTO_SLOTS, PhotoSlot } from '../types';

interface VehicleDetailModalProps {
  vehicle: VehicleRecord;
  center?: ServiceCenter;
  onClose: () => void;
  onDelete: (vehicleId: string) => void;
  onOpenComparison: (vehicle: VehicleRecord) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  center,
  onClose,
  onDelete,
  onOpenComparison
}) => {
  const [activePhotoTab, setActivePhotoTab] = useState<'checkin' | 'checkout'>('checkin');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<{ url: string; label: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCheckedOut = vehicle.status === 'checked_out';
  const checkinDate = vehicle.checkinTime ? new Date(vehicle.checkinTime) : null;
  const checkoutDate = vehicle.checkoutTime ? new Date(vehicle.checkoutTime) : null;

  // Calculate Turnaround Duration
  let durationText = 'In Progress (Vehicle In Service)';
  let durationBadge = 'In Progress';
  if (checkinDate && checkoutDate) {
    const diffMs = checkoutDate.getTime() - checkinDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) {
      durationText = `${diffMins} minutes`;
      durationBadge = `${diffMins}m`;
    } else {
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      durationText = `${h} hours ${m} minutes (${diffMins} total mins)`;
      durationBadge = `${h}h ${m}m`;
    }
  }

  const slots: PhotoSlot[] = vehicle.vehicleType === 'car' ? CAR_PHOTO_SLOTS : BIKE_PHOTO_SLOTS;
  const checkinPhotosCount = Object.keys(vehicle.checkinPhotos || {}).length;
  const checkoutPhotosCount = Object.keys(vehicle.checkoutPhotos || {}).length;

  const currentPhotos = activePhotoTab === 'checkin' ? vehicle.checkinPhotos : vehicle.checkoutPhotos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono font-black text-lg sm:text-xl text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30 tracking-wider shrink-0">
              {vehicle.vehicleNumber}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5 truncate">
                  {vehicle.vehicleType === 'car' ? <Car className="w-4 h-4 text-blue-400 shrink-0" /> : <Bike className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {vehicle.serviceType || (vehicle.vehicleType === 'car' ? 'Car Detailing & Inspection' : 'Bike Service')}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                  isCheckedOut 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  {isCheckedOut ? 'Completed' : 'In Service'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Center: <strong className="text-slate-300 font-semibold">{center?.name}</strong> ({center?.location})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Launch Compare Button */}
            <button
              type="button"
              onClick={() => onOpenComparison(vehicle)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition active:scale-95"
              title="View Before & After comparison"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            {/* Delete Entry Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition active:scale-95"
              title="Delete this vehicle entry"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div className="bg-red-500/15 border-b border-red-500/30 p-4 text-xs text-red-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="text-red-300 font-bold block">Confirm Vehicle Deletion:</strong>
                <span>Are you sure you want to permanently delete <strong>{vehicle.vehicleNumber}</strong>? This will remove inspection photos and records from both local cache and Cloudflare D1.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(vehicle.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition"
              >
                Yes, Delete Entry
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Key Metrics / Turnaround Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Check-In Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Check-In Time</span>
              </div>
              <p className="font-mono text-sm text-white font-bold">
                {checkinDate ? (
                  `${checkinDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${checkinDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                ) : '-'}
              </p>
              <p className="text-[11px] text-slate-400">
                Logged by: <strong className="text-slate-300 font-medium">{vehicle.managerName || 'Manager'}</strong>
              </p>
            </div>

            {/* Check-Out Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check-Out Time</span>
              </div>
              <p className="font-mono text-sm text-white font-bold">
                {checkoutDate ? (
                  `${checkoutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${checkoutDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                ) : (
                  <span className="text-sky-400 text-xs">● Active Service in Progress</span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                {isCheckedOut ? 'Checkout inspection verified' : 'Ready for checkout once service finishes'}
              </p>
            </div>

            {/* Turnaround Duration Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Turnaround Duration</span>
              </div>
              <p className="text-base font-black text-amber-300">
                ⏱️ {durationBadge}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {durationText}
              </p>
            </div>
          </div>

          {/* Customer & Center Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-400" /> Customer Information
              </h4>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Client Name:</span>
                  <span className="font-bold text-white">{vehicle.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact Number:</span>
                  {vehicle.customerPhone ? (
                    <a 
                      href={`tel:${vehicle.customerPhone}`}
                      className="font-mono font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {vehicle.customerPhone}
                    </a>
                  ) : (
                    <span className="text-slate-500 font-mono">-</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Category:</span>
                  <span className="font-semibold text-slate-200">{vehicle.serviceType || 'Standard Detailing'}</span>
                </div>
              </div>
            </div>

            {/* Service Center Details */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-400" /> Service Center Details
              </h4>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Branch Name:</span>
                  <span className="font-bold text-white">{center?.name || 'GVD Service Hub'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">City / Location:</span>
                  <span className="text-slate-200">{center?.location || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Branch Contact:</span>
                  <span className="text-slate-300 font-mono">{center?.contact || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes / Special Instructions */}
          {vehicle.notes && (
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Inspection Notes & Damage Observations
              </h4>
              <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                {vehicle.notes}
              </p>
            </div>
          )}

          {/* Photo Gallery with Tabs */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Inspection Photo Gallery
                </h4>
                <span className="text-xs text-slate-400">
                  ({checkinPhotosCount + checkoutPhotosCount} total photos)
                </span>
              </div>

              {/* Photo Stage Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('checkin')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    activePhotoTab === 'checkin'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Check-In Photos ({checkinPhotosCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('checkout')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                    activePhotoTab === 'checkout'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Check-Out Photos ({checkoutPhotosCount})</span>
                </button>
              </div>
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {slots.map((slot) => {
                const photoUrl = currentPhotos[slot.key];
                return (
                  <div
                    key={slot.key}
                    onClick={() => {
                      if (photoUrl) {
                        setPreviewPhotoUrl({ url: photoUrl, label: `${slot.label} (${activePhotoTab.toUpperCase()})` });
                      }
                    }}
                    className={`rounded-2xl p-2 border transition relative group flex flex-col justify-between overflow-hidden ${
                      photoUrl 
                        ? 'bg-slate-950 border-slate-800 hover:border-brand-500 cursor-pointer shadow-md'
                        : 'bg-slate-950/40 border-slate-850 opacity-60'
                    }`}
                  >
                    {/* Image or Placeholder */}
                    <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden relative flex items-center justify-center">
                      {photoUrl ? (
                        <>
                          <img 
                            src={photoUrl} 
                            alt={slot.label} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                          />
                          {/* WebP Badge */}
                          <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-amber-300 font-semibold border border-amber-500/30">
                            WEBP
                          </span>
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-medium">No Photo</span>
                      )}
                    </div>

                    <div className="pt-2 px-1">
                      <p className="text-[11px] font-bold text-white truncate">{slot.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{slot.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Record ID: <strong className="font-mono text-slate-300">{vehicle.id}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Enlarged Photo Preview Lightbox */}
      {previewPhotoUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="max-w-3xl w-full flex flex-col items-center space-y-3">
            <div className="flex items-center justify-between w-full text-white text-sm font-bold">
              <span>{previewPhotoUrl.label} - {vehicle.vehicleNumber}</span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={previewPhotoUrl.url} 
              alt={previewPhotoUrl.label}
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-slate-700 object-contain" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
