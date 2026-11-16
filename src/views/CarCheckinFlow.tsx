import React, { useState } from 'react';
import { ArrowLeft, Car, CheckCircle2, Sparkles, Send, AlertTriangle } from 'lucide-react';
import { CAR_PHOTO_SLOTS, ServiceCenter } from '../types';
import { PhotoCaptureSlot } from '../components/PhotoCaptureSlot';
import { appStore, SessionUser } from '../services/store';
import { generateSampleInspectionPhoto } from '../utils/photoUtils';

interface CarCheckinFlowProps {
  session: SessionUser;
  onBack: () => void;
  onSuccess: (vehicleId: string) => void;
}

export const CarCheckinFlow: React.FC<CarCheckinFlowProps> = ({ session, onBack, onSuccess }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const requiredSlots = CAR_PHOTO_SLOTS.filter(s => s.required);
  const capturedRequiredCount = requiredSlots.filter(s => !!photos[s.key]).length;
  const totalCapturedCount = Object.keys(photos).length;
  const isReadyToSubmit = vehicleNumber.trim().length >= 4 && capturedRequiredCount === requiredSlots.length;

  const handlePhotoCaptured = (slotKey: string, dataUrl: string) => {
    setPhotos(prev => ({ ...prev, [slotKey]: dataUrl }));
  };

  const handleRemovePhoto = (slotKey: string) => {
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });
  };

  const handleFillAllSamplePhotos = () => {
    const vNum = vehicleNumber.trim() || 'KA 05 MN 8899';
    if (!vehicleNumber.trim()) setVehicleNumber(vNum);

    const filled: Record<string, string> = {};
    CAR_PHOTO_SLOTS.forEach(slot => {
      filled[slot.key] = generateSampleInspectionPhoto(slot.label, vNum, 'checkin', 'car');
    });
    setPhotos(filled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setErrorMsg('Please enter vehicle registration number.');
      return;
    }
    if (capturedRequiredCount < requiredSlots.length) {
      setErrorMsg(`Please capture all required photos (${capturedRequiredCount}/${requiredSlots.length} completed).`);
      return;
    }

    const newRecord = appStore.createVehicleCheckin({
      serviceCenterId: session.serviceCenterId || '',
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType: 'car',
      serviceType: 'Car Detailing & Inspection',
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      managerId: session.managerId || '',
      managerName: session.name,
      checkinPhotos: photos,
      notes: notes.trim() || undefined
    });

    onSuccess(newRecord.id);
  };

  const categories = ['All', 'Doors', 'Body', 'Interior', 'Additional'];
  const filteredSlots = selectedCategory === 'All'
    ? CAR_PHOTO_SLOTS
    : CAR_PHOTO_SLOTS.filter(s => s.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto pb-16 w-full max-w-full overflow-x-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillAllSamplePhotos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
            title="Auto populate all car photo slots with simulated photos for fast testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fill All Sample Photos</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Title */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Car Service Check-In</h2>
              <p className="text-xs text-slate-400">
                {session.serviceCenter?.name} • 12 Inspection Points
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Information Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Vehicle Registration No. <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. KA 05 MN 1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-sm text-amber-300 placeholder-slate-500 focus:outline-none focus:border-brand-500 uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Verma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Customer Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Progress Pill Bar */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Check-In Photos Progress: <span className="text-brand-400">{capturedRequiredCount} / {requiredSlots.length} Required</span> ({totalCapturedCount} Total)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Required: 4 Doors, Front, Rear, Dashboard, Roof, Dicky + 3 Optional scratches/custom angles.
            </p>
          </div>
          <div className="w-36 bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.round((capturedRequiredCount / requiredSlots.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Filter:</span>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSlots.map(slot => (
            <PhotoCaptureSlot
              key={slot.key}
              slot={slot}
              photoUrl={photos[slot.key]}
              onPhotoCaptured={handlePhotoCaptured}
              onRemovePhoto={handleRemovePhoto}
              vehicleNumber={vehicleNumber}
              stage="checkin"
              vehicleType="car"
            />
          ))}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Pre-Inspection Notes / Existing Scratches / Customer Requests
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Existing minor stone chip on bonnet, customer requested high gloss ceramic finish..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReadyToSubmit}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
              isReadyToSubmit
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Check-In & Save Job Card</span>
          </button>
        </div>

      </div>
    </div>
  );
};
