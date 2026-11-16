import React, { useRef } from 'react';
import { Camera, Upload, Sparkles, Check, Trash2, Eye } from 'lucide-react';
import { PhotoSlot } from '../types';
import { fileToDataUrl, generateSampleInspectionPhoto } from '../utils/photoUtils';

interface PhotoCaptureSlotProps {
  slot: PhotoSlot;
  photoUrl?: string;
  onPhotoCaptured: (slotKey: string, dataUrl: string) => void;
  onRemovePhoto: (slotKey: string) => void;
  vehicleNumber: string;
  stage: 'checkin' | 'checkout';
  vehicleType: 'car' | 'bike';
}

export const PhotoCaptureSlot: React.FC<PhotoCaptureSlotProps> = ({
  slot,
  photoUrl,
  onPhotoCaptured,
  onRemovePhoto,
  vehicleNumber,
  stage,
  vehicleType
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      onPhotoCaptured(slot.key, dataUrl);
    } catch (err) {
      console.error('Failed to read file', err);
    }
  };

  const handleGenerateSample = () => {
    const sample = generateSampleInspectionPhoto(slot.label, vehicleNumber, stage, vehicleType);
    onPhotoCaptured(slot.key, sample);
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
      photoUrl
        ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/5'
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Slot Header */}
      <div className="px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs sm:text-sm text-white">
            {slot.label}
          </span>
          {slot.required ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">Required</span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-400">Optional</span>
          )}
        </div>
        {photoUrl && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Check className="w-3 h-3" /> Captured
          </span>
        )}
      </div>

      {/* Body / Capture Area */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        {photoUrl ? (
          /* Captured Image Preview */
          <div className="space-y-2">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60 border border-slate-700">
              <img
                src={photoUrl}
                alt={slot.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onRemovePhoto(slot.key)}
                  className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-500 shadow transition"
                  title="Remove and retake photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {slot.description}
            </p>
          </div>
        ) : (
          /* Not Captured Yet: Capture buttons */
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-xs text-slate-400 mb-3 px-1">
              {slot.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {/* Native Mobile Camera Input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>

              {/* File upload input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              {/* Demo Sample generator button */}
              <button
                type="button"
                onClick={handleGenerateSample}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 text-[11px] font-medium border border-slate-700/50 transition"
                title="Generate simulated demo photo for fast testing"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Auto-Sample (Testing)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
