import React, { useState } from 'react';
import { Plus, CheckSquare, Search, Car, Bike, Clock, CheckCircle2, SplitSquareVertical, ArrowRight, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { VehicleRecord, VehicleStatus } from '../types';
import { appStore, SessionUser } from '../services/store';

interface ManagerDashboardProps {
  session: SessionUser;
  vehicles: VehicleRecord[];
  onStartCheckin: () => void;
  onStartCheckout: (vehicle: VehicleRecord) => void;
  onViewComparison: (vehicle: VehicleRecord) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  session,
  vehicles,
  onStartCheckin,
  onStartCheckout,
  onViewComparison
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'checked_out'>('all');

  const center = session.serviceCenter;
  const isCarCenter = center?.type === 'car';

  // Filter vehicles belonging to this service center
  const centerVehicles = vehicles.filter(v => v.serviceCenterId === session.serviceCenterId);

  const filteredVehicles = centerVehicles.filter(v => {
    const matchesSearch = v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.customerName && v.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.serviceType && v.serviceType.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterStatus === 'checked_in') return v.status === 'checked_in';
    if (filterStatus === 'checked_out') return v.status === 'checked_out';
    return true;
  });

  const checkedInCount = centerVehicles.filter(v => v.status === 'checked_in').length;
  const checkedOutCount = centerVehicles.filter(v => v.status === 'checked_out').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Service Center Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border shadow-lg ${
              isCarCenter
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {isCarCenter ? <Car className="w-8 h-8" /> : <Bike className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {center?.name}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isCarCenter
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {center?.type} Service
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {center?.location}
                </span>
                {center?.contact && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {center.contact}
                  </span>
                )}
                <span className="text-slate-300 font-medium">
                  • Manager: <strong className="text-white font-semibold">{session.name}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Counter - Clickable Filter Cards */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFilterStatus(filterStatus === 'checked_in' ? 'all' : 'checked_in');
                document.getElementById('vehicles-queue-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2.5 rounded-2xl border transition text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                filterStatus === 'checked_in'
                  ? 'bg-sky-500/25 border-sky-500/60 shadow-lg shadow-sky-500/15 ring-1 ring-sky-400'
                  : 'bg-slate-950/80 border-slate-800 hover:border-sky-500/40 hover:bg-slate-900'
              }`}
              title="Click to filter In-Service vehicles"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-sky-400 font-medium block">In Service (Active)</span>
                <Clock className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{checkedInCount}</span>
                <span className="text-[10px] text-sky-300 font-medium">
                  {filterStatus === 'checked_in' ? '● Filtered' : 'Filter active ➔'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setFilterStatus(filterStatus === 'checked_out' ? 'all' : 'checked_out');
                document.getElementById('vehicles-queue-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2.5 rounded-2xl border transition text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                filterStatus === 'checked_out'
                  ? 'bg-emerald-500/25 border-emerald-500/60 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-400'
                  : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
              }`}
              title="Click to filter Completed vehicles"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-emerald-400 font-medium block">Completed Checkout</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{checkedOutCount}</span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  {filterStatus === 'checked_out' ? '● Filtered' : 'Filter done ➔'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={onStartCheckin}
            className={`py-3.5 px-5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
              isCarCenter
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>New {isCarCenter ? 'Car' : 'Bike'} Check-In & Photo Inspection</span>
          </button>

          <button
            onClick={() => setFilterStatus('checked_in')}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-98"
          >
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Check-Out Active Vehicle ({checkedInCount} Ready)</span>
          </button>
        </div>
      </div>

      {/* Vehicles Queue & Management */}
      <div id="vehicles-queue-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Vehicles ({centerVehicles.length})
            </button>
            <button
              onClick={() => setFilterStatus('checked_in')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                filterStatus === 'checked_in'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-sky-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>In Service ({checkedInCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('checked_out')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                filterStatus === 'checked_out'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed ({checkedOutCount})</span>
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registration no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Vehicles Grid / Cards */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No vehicles found in this queue</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Check-In" above to register a vehicle.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredVehicles.map((vehicle) => {
              const isCompleted = vehicle.status === 'checked_out';
              const checkinPhotosCount = Object.keys(vehicle.checkinPhotos).length;
              const checkoutPhotosCount = Object.keys(vehicle.checkoutPhotos).length;

              return (
                <div
                  key={vehicle.id}
                  onClick={() => isCompleted ? onViewComparison(vehicle) : onStartCheckout(vehicle)}
                  className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-brand-500/60 rounded-2xl p-4 transition flex flex-col justify-between space-y-3 group cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-md"
                  title={isCompleted ? "Click to view Before/After comparison" : "Click to perform checkout or view photos"}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 group-hover:border-amber-400/50 transition">
                          {vehicle.vehicleNumber}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {isCompleted ? 'Checked Out' : 'In Service'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300 mt-1">
                        {vehicle.serviceType || 'Standard Inspection & Service'}
                      </p>
                      {vehicle.customerName && (
                        <p className="text-[11px] text-slate-400">
                          Customer: {vehicle.customerName} {vehicle.customerPhone && `(${vehicle.customerPhone})`}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <span>In: {new Date(vehicle.checkinTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      {vehicle.checkoutTime && (
                        <span className="block text-emerald-400">
                          Out: {new Date(vehicle.checkoutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Photo Badges */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                      📸 Check-in: <strong>{checkinPhotosCount}</strong> photos
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      📸 Checkout: <strong>{checkoutPhotosCount}</strong> photos
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    {/* Before/After Comparison Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewComparison(vehicle);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                    >
                      <SplitSquareVertical className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isCompleted ? 'Side-by-Side Compare' : 'View Photos'}</span>
                    </button>

                    {/* Check out button if not completed */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartCheckout(vehicle);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow shadow-emerald-600/20 active:scale-95"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Perform Check-Out</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
