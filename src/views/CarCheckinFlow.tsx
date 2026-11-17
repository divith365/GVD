import React, { useState } from 'react';
import { ArrowLeft, Car, CheckCircle2, Sparkles, Send, AlertTriangle, Check, Phone, ShieldCheck } from 'lucide-react';
import { CAR_PHOTO_SLOTS, ServiceCenter } from '../types';
import { PhotoCaptureSlot } from '../components/PhotoCaptureSlot';
import { appStore, SessionUser } from '../services/store';
import { generateSampleInspectionPhoto } from '../utils/photoUtils';
import { validateVehicleNumber, validatePhoneNumber } from '../utils/validationUtils';

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

  // Real-time validations
  const vehValidation = validateVehicleNumber(vehicleNumber);
  const phoneValidation = validatePhoneNumber(customerPhone, false);

  const requiredSlots = CAR_PHOTO_SLOTS.filter(s => s.required);
  const capturedRequiredCount = requiredSlots.filter(s => !!photos[s.key]).length;
  const totalCapturedCount = Object.keys(photos).length;
  const isReadyToSubmit = 
    vehValidation.isValid && 
    (!customerPhone || phoneValidation.isValid) &&
    capturedRequiredCount === requiredSlots.length;

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

  const handleFillAllSamplePhotos = (samplePlate: string = 'KA 05 MN 8899') => {
    const vNum = vehValidation.isValid ? vehValidation.formatted : samplePlate;
    setVehicleNumber(vNum);
    if (!customerName) setCustomerName('Rahul Verma');
    if (!customerPhone) setCustomerPhone('9876543210');

    const filled: Record<string, string> = {};
    CAR_PHOTO_SLOTS.forEach(slot => {
      filled[slot.key] = generateSampleInspectionPhoto(slot.label, vNum, 'checkin', 'car');
    });
    setPhotos(filled);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Strict vehicle number validation
    if (!vehValidation.isValid) {
      setErrorMsg(vehValidation.error || 'Please enter a valid vehicle registration number (e.g. KA 05 MN 1234, MH 12 CD 5678, or 22 BH 1234 AA).');
      return;
    }

    // Strict customer phone validation if entered
    if (customerPhone.trim() && !phoneValidation.isValid) {
      setErrorMsg(phoneValidation.error || 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (capturedRequiredCount < requiredSlots.length) {
      setErrorMsg(`Please capture all required photos (${capturedRequiredCount}/${requiredSlots.length} completed).`);
      return;
    }

    const newRecord = appStore.createVehicleCheckin({
      serviceCenterId: session.serviceCenterId || '',
      vehicleNumber: vehValidation.formatted,
      vehicleType: 'car',
      serviceType: 'Car Detailing & Inspection',
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() ? phoneValidation.cleanDigits : undefined,
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
            onClick={() => handleFillAllSamplePhotos('KA 05 MN 8899')}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Vehicle Reg. No. <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">KA • BH • MH</span>
            </div>
            <input
              type="text"
              placeholder="e.g. KA 05 MN 1234 / 22 BH 1234 AA"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border font-mono font-bold text-sm text-amber-300 placeholder-slate-500 focus:outline-none uppercase transition ${
                vehValidation.isValid
                  ? 'border-emerald-500/80 focus:border-emerald-400'
                  : vehicleNumber.length > 0
                  ? 'border-amber-500/60 focus:border-amber-400'
                  : 'border-slate-700 focus:border-brand-500'
              }`}
              required
            />
            {/* Real-time Vehicle Validation Message */}
            <div className="min-h-[20px] mt-1">
              {vehValidation.isValid ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Valid: {vehValidation.stateName} ({vehValidation.formatted})</span>
                </span>
              ) : vehicleNumber.trim().length > 0 ? (
                <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{vehValidation.error}</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  Enter KA-..., MH-..., or 22 BH... format
                </span>
              )}
            </div>

            {/* Quick Format Fill Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-slate-500">Quick Test:</span>
              <button
                type="button"
                onClick={() => setVehicleNumber('KA 05 MN 8899')}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition"
              >
                KA 05 MN 8899
              </button>
              <button
                type="button"
                onClick={() => setVehicleNumber('22 BH 1234 AA')}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition"
              >
                22 BH 1234 AA
              </button>
              <button
                type="button"
                onClick={() => setVehicleNumber('MH 12 CD 5678')}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
              >
                MH 12 CD 5678
              </button>
            </div>
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
            <p className="text-[10px] text-slate-500 mt-1">Vehicle owner or driver name</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Customer Phone
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {customerPhone.length}/10 digits
              </span>
            </div>
            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g. 9876543210 (10 digits)"
                value={customerPhone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setCustomerPhone(cleaned);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition ${
                  customerPhone.length === 10 && phoneValidation.isValid
                    ? 'border-emerald-500/80 focus:border-emerald-400 text-emerald-300'
                    : customerPhone.length > 0
                    ? 'border-amber-500/60 focus:border-amber-400'
                    : 'border-slate-700 focus:border-brand-500'
                }`}
              />
            </div>
            {/* Real-time Phone Validation Message */}
            <div className="min-h-[20px] mt-1">
              {customerPhone.length === 10 && phoneValidation.isValid ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Valid mobile (+91 {phoneValidation.formatted})</span>
                </span>
              ) : customerPhone.length > 0 ? (
                <span className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{phoneValidation.error}</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  10-digit mobile number starting with 6, 7, 8, or 9
                </span>
              )}
            </div>
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
