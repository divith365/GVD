import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Sparkles, AlertTriangle, Car, Bike, SplitSquareVertical } from 'lucide-react';
import { VehicleRecord, CAR_PHOTO_SLOTS, BIKE_PHOTO_SLOTS, PhotoSlot } from '../types';
import { PhotoCaptureSlot } from '../components/PhotoCaptureSlot';
import { appStore, SessionUser } from '../services/store';
import { generateSampleInspectionPhoto } from '../utils/photoUtils';

interface CheckoutFlowProps {
  vehicle: VehicleRecord;
  session: SessionUser;
  onBack: () => void;
  onSuccess: (vehicleId: string) => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ vehicle, session, onBack, onSuccess }) => {
  const slots: PhotoSlot[] = vehicle.vehicleType === 'car' ? CAR_PHOTO_SLOTS : BIKE_PHOTO_SLOTS;
  
  // We only require checkout photos for slots that had a checkin photo or are required
  const relevantSlots = slots.filter(s => s.required || vehicle.checkinPhotos[s.key]);

  const [checkoutPhotos, setCheckoutPhotos] = useState<Record<string, string>>({
    ...vehicle.checkoutPhotos
  });
  const [checkoutNotes, setCheckoutNotes] = useState<string>(vehicle.notes || '');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const requiredSlots = relevantSlots.filter(s => s.required);
  const capturedRequiredCount = requiredSlots.filter(s => !!checkoutPhotos[s.key]).length;
  const isReadyToSubmit = capturedRequiredCount === requiredSlots.length;

  const handlePhotoCaptured = (slotKey: string, dataUrl: string) => {
    setCheckoutPhotos(prev => ({ ...prev, [slotKey]: dataUrl }));
  };

  const handleRemovePhoto = (slotKey: string) => {
    setCheckoutPhotos(prev => {
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });
  };

  const handleFillAllSamplePhotos = () => {
    const filled: Record<string, string> = {};
    relevantSlots.forEach(slot => {
      filled[slot.key] = generateSampleInspectionPhoto(
        slot.label,
        vehicle.vehicleNumber,
        'checkout',
        vehicle.vehicleType
      );
    });
    setCheckoutPhotos(filled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (capturedRequiredCount < requiredSlots.length) {
      setErrorMsg(`Please capture all required checkout photos (${capturedRequiredCount}/${requiredSlots.length} completed).`);
      return;
    }

    const updated = appStore.submitVehicleCheckout(vehicle.id, checkoutPhotos, checkoutNotes);
    if (updated) {
      onSuccess(updated.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3 mb-6">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            title="Auto populate all checkout photos for testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fill All Checkout Photos</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        
        {/* Header Banner */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {vehicle.vehicleType === 'car' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {vehicle.vehicleNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {vehicle.serviceType || 'Service Completed'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Checked in at {new Date(vehicle.checkinTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • Customer: {vehicle.customerName || 'Walk-in'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Checkout Completion:</span>
            <span className="text-sm font-bold text-emerald-400">
              {capturedRequiredCount} / {requiredSlots.length} Photos Captured
            </span>
          </div>
        </div>

        {/* Guided Notice */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-start gap-3">
          <SplitSquareVertical className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-0.5">
            <p className="font-semibold text-white">Capture Corresponding After-Service Photos</p>
            <p className="text-slate-400 text-[11px]">
              Take post-service photos matching the check-in angles. Both manager and customer will be able to compare them side-by-side to verify service finish, polish, and zero scratches.
            </p>
          </div>
        </div>

        {/* Photo Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relevantSlots.map(slot => (
            <div key={slot.key} className="space-y-1.5">
              {/* Reference Check-in photo thumbnail thumbnail */}
              {vehicle.checkinPhotos[slot.key] && (
                <div className="px-2 py-1 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Reference (Check-in):</span>
                  <a
                    href={vehicle.checkinPhotos[slot.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline"
                  >
                    View Before
                  </a>
                </div>
              )}
              <PhotoCaptureSlot
                slot={slot}
                photoUrl={checkoutPhotos[slot.key]}
                onPhotoCaptured={handlePhotoCaptured}
                onRemovePhoto={handleRemovePhoto}
                vehicleNumber={vehicle.vehicleNumber}
                stage="checkout"
                vehicleType={vehicle.vehicleType}
              />
            </div>
          ))}
        </div>

        {/* Checkout Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Work Done / Checkout Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={checkoutNotes}
            onChange={(e) => setCheckoutNotes(e.target.value)}
            placeholder="e.g. Teflon coating completed with high gloss polish, customer inspected and approved..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
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
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Check-Out & View Comparison</span>
          </button>
        </div>

      </div>
    </div>
  );
};
