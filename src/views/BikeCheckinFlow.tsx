import React, { useState } from 'react';
import { ArrowLeft, Bike, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { BIKE_PHOTO_SLOTS, BIKE_SERVICES, BikeServiceType } from '../types';
import { PhotoCaptureSlot } from '../components/PhotoCaptureSlot';
import { appStore, SessionUser } from '../services/store';
import { generateSampleInspectionPhoto } from '../utils/photoUtils';

interface BikeCheckinFlowProps {
  session: SessionUser;
  onBack: () => void;
  onSuccess: (vehicleId: string) => void;
}

export const BikeCheckinFlow: React.FC<BikeCheckinFlowProps> = ({ session, onBack, onSuccess }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [serviceType, setServiceType] = useState<BikeServiceType>('Ceramic Coating');
  const [otherServiceText, setOtherServiceText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const requiredSlots = BIKE_PHOTO_SLOTS;
  const capturedCount = requiredSlots.filter(s => !!photos[s.key]).length;
  const isReadyToSubmit = vehicleNumber.trim().length >= 4 && capturedCount === requiredSlots.length;

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
    const vNum = vehicleNumber.trim() || 'KA 01 TR 9922';
    if (!vehicleNumber.trim()) setVehicleNumber(vNum);

    const filled: Record<string, string> = {};
    BIKE_PHOTO_SLOTS.forEach(slot => {
      filled[slot.key] = generateSampleInspectionPhoto(slot.label, vNum, 'checkin', 'bike');
    });
    setPhotos(filled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setErrorMsg('Please enter two-wheeler vehicle number.');
      return;
    }
    if (capturedCount < requiredSlots.length) {
      setErrorMsg(`Please capture all 4 required inspection photos (${capturedCount}/4 completed).`);
      return;
    }

    const finalServiceType = serviceType === 'Other Service' && otherServiceText.trim()
      ? `Other: ${otherServiceText.trim()}`
      : serviceType;

    const newRecord = appStore.createVehicleCheckin({
      serviceCenterId: session.serviceCenterId || '',
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType: 'bike',
      serviceType: finalServiceType,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      managerId: session.managerId || '',
      managerName: session.name,
      checkinPhotos: photos,
      notes: notes.trim() || undefined
    });

    onSuccess(newRecord.id);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Top Bar */}
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
            title="Auto populate all 4 bike photo slots with simulated photos for fast testing"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fill 4 Sample Photos</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Bike Service Check-In</h2>
              <p className="text-xs text-slate-400">
                {session.serviceCenter?.name} • Service Selection & 4 Photo Inspection
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Vehicle Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bike Registration No. <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. KA 01 TR 5678"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-sm text-amber-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Manoj Gowda"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Customer Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 9812345678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Step 2: Select Service Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Type of Service <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {BIKE_SERVICES.map((type) => {
              const isSelected = serviceType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setServiceType(type)}
                  className={`p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{type}</span>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {type === 'Wash' && 'Foam wash & degreasing'}
                    {type === 'Teflon Coating' && 'Gloss protect film'}
                    {type === 'Ceramic Coating' && '9H Nano glass shield'}
                    {type === 'PPF Coating' && 'Self-healing paint wrap'}
                    {type === 'Other Service' && 'Custom service job'}
                  </p>
                </button>
              );
            })}
          </div>

          {serviceType === 'Other Service' && (
            <div className="mt-2.5">
              <input
                type="text"
                placeholder="Specify other service details (e.g. Engine decarb, Chain service, Wrap)..."
                value={otherServiceText}
                onChange={(e) => setOtherServiceText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Step 3: 4 Photos Capture */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Capture 4 Inspection Photos</span>
                <span className="text-xs font-normal text-emerald-400">
                  ({capturedCount}/4 completed)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Front, Rear, Left Side, and Right Side before service starts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BIKE_PHOTO_SLOTS.map(slot => (
              <PhotoCaptureSlot
                key={slot.key}
                slot={slot}
                photoUrl={photos[slot.key]}
                onPhotoCaptured={handlePhotoCaptured}
                onRemovePhoto={handleRemovePhoto}
                vehicleNumber={vehicleNumber}
                stage="checkin"
                vehicleType="bike"
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Notes / Existing Scratches / Customer Special Requests
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Minor scratch near tank emblem, customer requested mirror buffing..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 active:scale-95'
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
