import React, { useState } from 'react';
import { VehicleRecord, CAR_PHOTO_SLOTS, BIKE_PHOTO_SLOTS, PhotoSlot } from '../types';
import { X, SplitSquareVertical, Columns2, ZoomIn, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface ComparisonViewerProps {
  vehicle: VehicleRecord;
  onClose: () => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({ vehicle, onClose }) => {
  const slots: PhotoSlot[] = vehicle.vehicleType === 'car' ? CAR_PHOTO_SLOTS : BIKE_PHOTO_SLOTS;
  
  // Available slots that have at least one photo
  const [selectedSlotKey, setSelectedSlotKey] = useState<string>(slots[0].key);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage for split slider
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const currentSlot = slots.find(s => s.key === selectedSlotKey) || slots[0];
  const beforePhoto = vehicle.checkinPhotos[currentSlot.key];
  const afterPhoto = vehicle.checkoutPhotos[currentSlot.key];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 gap-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold text-lg rounded-lg border border-amber-500/30">
              {vehicle.vehicleNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-base sm:text-lg">
                  {vehicle.serviceType || (vehicle.vehicleType === 'car' ? 'Car Detailing & Inspection' : 'Bike Service')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  vehicle.status === 'checked_out' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  {vehicle.status === 'checked_out' ? 'Completed & Checked Out' : 'Active / In Service'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {vehicle.vehicleType.toUpperCase()} Service • Manager: {vehicle.managerName}
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'side-by-side'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Side by Side</span>
              </button>
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === 'slider'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Split Slider</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timestamps & Info strip */}
        <div className="bg-slate-950/70 px-5 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Check-in: <strong className="text-white font-normal">{new Date(vehicle.checkinTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</strong>
            </span>
            {vehicle.checkoutTime && (
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Check-out: <strong className="text-white font-normal">{new Date(vehicle.checkoutTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</strong>
              </span>
            )}
          </div>
          {vehicle.customerName && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> {vehicle.customerName}
              </span>
              {vehicle.customerPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {vehicle.customerPhone}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Angle Selection Chips (Horizontal Scrollable) */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 overflow-x-auto flex items-center gap-2 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Photo Angle:
          </span>
          {slots.map((slot) => {
            const hasBefore = !!vehicle.checkinPhotos[slot.key];
            const hasAfter = !!vehicle.checkoutPhotos[slot.key];
            const isSelected = slot.key === selectedSlotKey;
            return (
              <button
                key={slot.key}
                onClick={() => setSelectedSlotKey(slot.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{slot.label}</span>
                {hasBefore && hasAfter ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Both Before & After available" />
                ) : hasBefore ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Only Check-in photo available" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-500" title="No photo" />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Comparison Display Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950 flex flex-col items-center justify-center">
          
          {/* Missing photos state */}
          {(!beforePhoto && !afterPhoto) ? (
            <div className="text-center py-16 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No photos uploaded for {currentSlot.label}</p>
              <p className="text-xs text-slate-500 mt-1">This slot was skipped during inspection.</p>
            </div>
          ) : viewMode === 'side-by-side' ? (
            /* SIDE-BY-SIDE NEXT-TO-NEXT VIEW */
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Check-in / Before Column */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
                <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                    CHECK-IN PHOTO (BEFORE)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentSlot.label}
                  </span>
                </div>
                <div className="relative aspect-video bg-black/60 flex items-center justify-center overflow-hidden group">
                  {beforePhoto ? (
                    <img
                      src={beforePhoto}
                      alt={`Before - ${currentSlot.label}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="text-center text-slate-500 p-6">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs">No check-in photo recorded</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-[11px] text-white backdrop-blur-sm">
                    Pre-Service Condition
                  </div>
                </div>
              </div>

              {/* Check-out / After Column */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
                <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    CHECK-OUT PHOTO (AFTER)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentSlot.label}
                  </span>
                </div>
                <div className="relative aspect-video bg-black/60 flex items-center justify-center overflow-hidden group">
                  {afterPhoto ? (
                    <img
                      src={afterPhoto}
                      alt={`After - ${currentSlot.label}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="text-center text-slate-500 p-6">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs">Pending Check-out Photo</p>
                      <span className="text-[10px] text-amber-400/80">Vehicle not yet checked out</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded text-[11px] text-emerald-300 backdrop-blur-sm">
                    Post-Service Condition
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* INTERACTIVE SPLIT SLIDER VIEW */
            <div className="w-full max-w-3xl flex flex-col items-center">
              {beforePhoto && afterPhoto ? (
                <div className="w-full">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-2xl select-none">
                    {/* Background: After photo */}
                    <img
                      src={afterPhoto}
                      alt="After Service"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-emerald-900/80 text-emerald-200 text-xs font-semibold backdrop-blur-sm z-10">
                      AFTER
                    </div>

                    {/* Foreground: Before photo with clip-path */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                    >
                      <img
                        src={beforePhoto}
                        alt="Before Service"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2 py-1 rounded bg-sky-900/80 text-sky-200 text-xs font-semibold backdrop-blur-sm z-10">
                        BEFORE
                      </div>
                    </div>

                    {/* Divider Line & Drag Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize z-20"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg text-xs font-bold">
                        ⬌
                      </div>
                    </div>
                  </div>

                  {/* Range Slider Control */}
                  <div className="mt-4 flex items-center gap-3 w-full max-w-md mx-auto">
                    <span className="text-xs text-sky-400 font-semibold">Before (Check-in)</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="flex-1 accent-brand-500 cursor-pointer"
                    />
                    <span className="text-xs text-emerald-400 font-semibold">After (Check-out)</span>
                  </div>
                  <p className="text-center text-xs text-slate-400 mt-1">
                    Drag slider left/right to compare detailing and finish quality
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">Both Check-in and Check-out photos are required for Split Slider mode.</p>
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className="mt-3 text-xs text-brand-400 underline"
                  >
                    Switch to Side-by-Side View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes section if any */}
          {vehicle.notes && (
            <div className="w-full mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <strong className="text-slate-400 font-semibold block mb-0.5">Manager Notes:</strong>
              {vehicle.notes}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Angle {slots.findIndex(s => s.key === selectedSlotKey) + 1} of {slots.length}: <span className="text-white font-medium">{currentSlot.label}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentIndex = slots.findIndex(s => s.key === selectedSlotKey);
                const prevIndex = (currentIndex - 1 + slots.length) % slots.length;
                setSelectedSlotKey(slots[prevIndex].key);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              ← Previous Angle
            </button>
            <button
              onClick={() => {
                const currentIndex = slots.findIndex(s => s.key === selectedSlotKey);
                const nextIndex = (currentIndex + 1) % slots.length;
                setSelectedSlotKey(slots[nextIndex].key);
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow"
            >
              Next Angle →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
