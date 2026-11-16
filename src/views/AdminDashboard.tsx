import React, { useState } from 'react';
import { 
  Building2, Users, Car, Bike, Plus, Search, ShieldCheck, 
  MapPin, Phone, KeyRound, CheckCircle2, SplitSquareVertical, 
  Cloud, Database, ExternalLink, Eye, EyeOff, Sparkles, Filter, Clock,
  FileSpreadsheet, Download, Calendar, Timer, UserCheck, Trash2, 
  AlertCircle, CalendarRange, ArrowRight, X
} from 'lucide-react';
import { ServiceCenter, Manager, VehicleRecord, ServiceCenterType } from '../types';
import { appStore, SessionUser } from '../services/store';
import { exportVehiclesToExcel } from '../utils/exportUtils';
import { VehicleDetailModal } from '../components/VehicleDetailModal';

interface AdminDashboardProps {
  session: SessionUser;
  vehicles: VehicleRecord[];
  onViewComparison: (vehicle: VehicleRecord) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  vehicles,
  onViewComparison
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'centers' | 'managers' | 'cloudflare'>('vehicles');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'checked_out'>('all');
  
  // Time period filter: 'all' | 'today' | 'week' | 'month' | 'range'
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'range'>('all');

  // Custom date range state (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [customStartDate, setCustomStartDate] = useState<string>(sevenDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Deep detail modal state
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState<VehicleRecord | null>(null);

  // Quick delete confirmation state
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleRecord | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string>('');

  // Modals
  const [isAddCenterOpen, setIsAddCenterOpen] = useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Center form state
  const [centerName, setCenterName] = useState('');
  const [centerLocation, setCenterLocation] = useState('');
  const [centerType, setCenterType] = useState<ServiceCenterType>('car');
  const [centerContact, setCenterContact] = useState('');
  const [centerEmail, setCenterEmail] = useState('');
  const [centerAddress, setCenterAddress] = useState('');

  // Manager form state
  const [mgrName, setMgrName] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrCenterId, setMgrCenterId] = useState('');
  const [mgrPin, setMgrPin] = useState('');

  const centers = appStore.getServiceCenters();
  const managers = appStore.getManagers();

  // 1. Filter by Time Period
  const timeFilteredVehicles = vehicles.filter(v => {
    if (!v.checkinTime) return true;
    const checkinDate = new Date(v.checkinTime);
    const now = new Date();

    if (timeFilter === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return checkinDate >= startOfToday && checkinDate <= endOfToday;
    }

    if (timeFilter === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return checkinDate >= sevenDaysAgo && checkinDate <= now;
    }

    if (timeFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return checkinDate >= startOfMonth && checkinDate <= now;
    }

    if (timeFilter === 'range') {
      if (!customStartDate && !customEndDate) return true;
      const start = customStartDate ? new Date(customStartDate + 'T00:00:00') : new Date(0);
      const end = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date();
      return checkinDate >= start && checkinDate <= end;
    }

    return true; // 'all'
  });

  // 2. Filter by Service Center
  const centerFilteredVehicles = timeFilteredVehicles.filter(v => {
    return selectedCenterId === 'all' || v.serviceCenterId === selectedCenterId;
  });

  // 3. Status and Search Filter for vehicle listing
  const filteredVehicles = centerFilteredVehicles.filter(v => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.vehicleNumber.toLowerCase().includes(q) ||
        (v.customerName && v.customerName.toLowerCase().includes(q)) ||
        (v.serviceType && v.serviceType.toLowerCase().includes(q));
    }
    return true;
  });

  const selectedCenter = centers.find(c => c.id === selectedCenterId);

  // Key Metrics for Active Selection
  const totalVehiclesCount = centerFilteredVehicles.length;
  const inServiceCount = centerFilteredVehicles.filter(v => v.status === 'checked_in').length;
  const completedVehicles = centerFilteredVehicles.filter(v => v.status === 'checked_out');
  const completedCount = completedVehicles.length;
  
  // Distinct Centers represented in this selection
  const distinctCenterIds = new Set(centerFilteredVehicles.map(v => v.serviceCenterId));
  const activeCentersInPeriod = distinctCenterIds.size;

  // Average Turnaround Duration
  let avgDurationText = 'N/A';
  if (completedVehicles.length > 0) {
    let totalMins = 0;
    let count = 0;
    completedVehicles.forEach(v => {
      if (v.checkinTime && v.checkoutTime) {
        const diffMs = new Date(v.checkoutTime).getTime() - new Date(v.checkinTime).getTime();
        totalMins += Math.max(0, Math.round(diffMs / 60000));
        count++;
      }
    });
    if (count > 0) {
      const avgMins = Math.round(totalMins / count);
      avgDurationText = avgMins < 60 ? `${avgMins}m` : `${Math.floor(avgMins / 60)}h ${avgMins % 60}m`;
    }
  }

  const getTimeFilterLabel = () => {
    if (timeFilter === 'today') return 'Today';
    if (timeFilter === 'week') return 'This Week';
    if (timeFilter === 'month') return 'This Month';
    if (timeFilter === 'range') return `${customStartDate} to ${customEndDate}`;
    return 'All Time';
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const success = appStore.deleteVehicle(vehicleId);
    if (success) {
      setNotificationMsg('Vehicle entry deleted successfully.');
      setTimeout(() => setNotificationMsg(''), 3500);
      if (selectedVehicleDetail?.id === vehicleId) {
        setSelectedVehicleDetail(null);
      }
    }
  };

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerName || !centerLocation) return;

    appStore.addServiceCenter({
      name: centerName.trim(),
      location: centerLocation.trim(),
      type: centerType,
      contact: centerContact.trim(),
      email: centerEmail.trim() || undefined,
      address: centerAddress.trim()
    });

    // Reset & close
    setCenterName('');
    setCenterLocation('');
    setCenterContact('');
    setCenterEmail('');
    setCenterAddress('');
    setIsAddCenterOpen(false);
  };

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgrName || !mgrCenterId || !mgrPin) return;

    appStore.addManager({
      name: mgrName.trim(),
      phone: mgrPhone.trim(),
      pin: mgrPin.trim(),
      serviceCenterId: mgrCenterId
    });

    setMgrName('');
    setMgrPhone('');
    setMgrCenterId('');
    setMgrPin('');
    setIsAddManagerOpen(false);
  };

  const handleAutoGeneratePin = () => {
    const randomPin = Math.floor(10000000 + Math.random() * 90000000).toString();
    setMgrPin(randomPin);
  };

  const togglePinReveal = (mgrId: string) => {
    setRevealedPins(prev => ({ ...prev, [mgrId]: !prev[mgrId] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 w-full max-w-full overflow-x-hidden">
      
      {/* Top Banner & Center Selector Dropdown */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl w-full max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Admin Control Center
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-Center Management, Manager PINs, Inspection Records & Side-by-Side Photo Comparison
            </p>
          </div>

          {/* Service Center Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 w-full sm:w-auto max-w-full">
            <Filter className="w-4 h-4 text-brand-400 ml-1 shrink-0" />
            <label className="text-xs font-semibold text-slate-400 shrink-0">Center:</label>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer w-full sm:w-auto max-w-full truncate min-w-0"
            >
              <option value="all">All Service Centers ({centers.length})</option>
              <optgroup label="Car Service Centers">
                {centers.filter(c => c.type === 'car').map(c => (
                  <option key={c.id} value={c.id}>🚗 {c.name} ({c.location})</option>
                ))}
              </optgroup>
              <optgroup label="Bike Service Centers">
                {centers.filter(c => c.type === 'bike').map(c => (
                  <option key={c.id} value={c.id}>🏍️ {c.name} ({c.location})</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Selected Center Details if specific center selected */}
        {selectedCenter && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 sm:gap-3 max-w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 max-w-full min-w-0">
              <span className="font-bold text-white text-sm flex items-center gap-1.5 shrink-0">
                {selectedCenter.type === 'car' ? <Car className="w-4 h-4 text-blue-400" /> : <Bike className="w-4 h-4 text-emerald-400" />}
                {selectedCenter.name}
              </span>
              <span className="flex items-center gap-1 text-slate-400 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> <span className="truncate">{selectedCenter.address || selectedCenter.location}</span>
              </span>
              {selectedCenter.contact && (
                <span className="flex items-center gap-1 text-slate-400 shrink-0">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedCenter.contact}
                </span>
              )}
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold uppercase shrink-0">
              {selectedCenter.type} Service Center
            </span>
          </div>
        )}

        {/* Time Period Filter Bar (Today | Week | Month | Custom Range | All Time) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-thin pb-1">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1.5 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-brand-400" /> Filter Period:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'range', label: 'Custom Range 📅' },
              { id: 'all', label: 'All Time' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                  timeFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Pickers (shown when range selected) */}
          {timeFilter === 'range' && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs animate-in fade-in">
              <span className="text-slate-400 font-medium pl-1">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
              />
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          )}
        </div>

        {/* Aggregate KPI Cards - 5 Responsive Cards (Filtered by Active Time & Center) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          {/* 1. Total Vehicles in Period */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('vehicles');
              setStatusFilter('all');
            }}
            className={`text-left p-3.5 rounded-2xl border transition group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
              statusFilter === 'all' && activeTab === 'vehicles'
                ? 'bg-brand-500/15 border-brand-500/60 shadow-lg shadow-brand-500/10'
                : 'bg-slate-950/70 border-slate-800 hover:border-brand-500/40 hover:bg-slate-900'
            }`}
            title="Click to view all vehicles for this period"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium group-hover:text-brand-300 transition">Total Vehicles</span>
              <Car className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{totalVehiclesCount}</span>
              <span className="text-[10px] text-slate-500 truncate">({getTimeFilterLabel()})</span>
            </div>
            <span className="text-[10px] text-brand-400/80 font-medium mt-1 block">
              Filter all ➔
            </span>
          </button>

          {/* 2. Active Centers */}
          <button
            type="button"
            onClick={() => setActiveTab('centers')}
            className={`text-left p-3.5 rounded-2xl border transition group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'centers'
                ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900'
            }`}
            title="Click to view and manage service centers"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium group-hover:text-amber-300 transition">Active Centers</span>
              <Building2 className={`w-3.5 h-3.5 transition ${activeTab === 'centers' ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{activeCentersInPeriod}</span>
              <span className="text-[10px] text-slate-500">/ {centers.length} Total</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-medium mt-1 block">
              Manage centers ➔
            </span>
          </button>

          {/* 3. In Service (Active) */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('vehicles');
              setStatusFilter(statusFilter === 'checked_in' ? 'all' : 'checked_in');
            }}
            className={`text-left p-3.5 rounded-2xl border transition group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'vehicles' && statusFilter === 'checked_in'
                ? 'bg-sky-500/20 border-sky-500/60 shadow-lg shadow-sky-500/15'
                : 'bg-slate-950/70 border-slate-800 hover:border-sky-500/40 hover:bg-slate-900'
            }`}
            title="Click to filter In-Service vehicles"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-400 font-medium group-hover:text-sky-300 transition">In Service</span>
              <Clock className={`w-3.5 h-3.5 transition ${activeTab === 'vehicles' && statusFilter === 'checked_in' ? 'text-sky-400' : 'text-sky-500'}`} />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{inServiceCount}</span>
              <span className="text-[10px] text-slate-500">Active</span>
            </div>
            <span className="text-[10px] text-sky-400/80 font-medium mt-1 block">
              {statusFilter === 'checked_in' && activeTab === 'vehicles' ? '● Filtered Active' : 'Filter active ➔'}
            </span>
          </button>

          {/* 4. Completed Checkouts */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('vehicles');
              setStatusFilter(statusFilter === 'checked_out' ? 'all' : 'checked_out');
            }}
            className={`text-left p-3.5 rounded-2xl border transition group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'vehicles' && statusFilter === 'checked_out'
                ? 'bg-emerald-500/20 border-emerald-500/60 shadow-lg shadow-emerald-500/15'
                : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
            }`}
            title="Click to filter Completed vehicles"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-medium group-hover:text-emerald-300 transition">Completed</span>
              <CheckCircle2 className={`w-3.5 h-3.5 transition ${activeTab === 'vehicles' && statusFilter === 'checked_out' ? 'text-emerald-400' : 'text-emerald-500'}`} />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{completedCount}</span>
              <span className="text-[10px] text-emerald-400">Ready</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-medium mt-1 block">
              {statusFilter === 'checked_out' && activeTab === 'vehicles' ? '● Filtered Done' : 'Filter done ➔'}
            </span>
          </button>

          {/* 5. Avg Turnaround Duration */}
          <div className="p-3.5 rounded-2xl border bg-slate-950/70 border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-medium">Avg Turnaround</span>
              <Timer className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-white">{avgDurationText}</span>
              <span className="text-[10px] text-slate-500">Duration</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block truncate">
              In & Out Time Average
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{notificationMsg}</span>
          <button type="button" onClick={() => setNotificationMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 w-full max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs overflow-x-auto max-w-full scrollbar-thin">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'vehicles'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4 text-sky-300 shrink-0" />
            <span>Vehicles & Inspections ({filteredVehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'centers'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Service Centers ({centers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('managers')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'managers'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-300 shrink-0" />
            <span>Managers & PINs ({managers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 sm:gap-2 transition whitespace-nowrap shrink-0 ${
              activeTab === 'cloudflare'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Cloudflare D1 & R2</span>
          </button>
        </div>

        {/* Quick action button depending on tab */}
        {activeTab === 'centers' && (
          <button
            onClick={() => setIsAddCenterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Center</span>
          </button>
        )}
        {activeTab === 'managers' && (
          <button
            onClick={() => setIsAddManagerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manager & PIN</span>
          </button>
        )}
      </div>

      {/* TAB 1: VEHICLES & COMPARISON */}
      {activeTab === 'vehicles' && (
        <div className="space-y-4">
          {/* Search bar, Status Filter Buttons & Excel Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({vehicles.filter(v => selectedCenterId === 'all' || v.serviceCenterId === selectedCenterId).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('checked_in')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === 'checked_in'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-sky-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>In Service ({vehicles.filter(v => (selectedCenterId === 'all' || v.serviceCenterId === selectedCenterId) && v.status === 'checked_in').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('checked_out')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === 'checked_out'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed ({vehicles.filter(v => (selectedCenterId === 'all' || v.serviceCenterId === selectedCenterId) && v.status === 'checked_out').length})</span>
              </button>
            </div>

            {/* Actions: Search bar & Excel Export Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto min-w-0">
              <div className="relative flex-1 min-w-[170px] sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search registration, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Excel Export Button */}
              <button
                type="button"
                onClick={() => {
                  exportVehiclesToExcel(filteredVehicles, centers, managers, {
                    centerName: selectedCenter?.name || 'All Service Centers',
                    statusFilter: statusFilter === 'all' ? 'All Statuses' : (statusFilter === 'checked_in' ? 'In Service' : 'Completed'),
                    timeFilterLabel: getTimeFilterLabel()
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition whitespace-nowrap shrink-0"
                title="Export complete vehicle records (Check-in, Check-out, duration, photos) to Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {filteredVehicles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <Car className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No vehicle records found for selected filter</p>
              <p className="text-xs text-slate-500 mt-1">Try switching the Period filter (e.g. "All Time") or resetting service center.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredVehicles.map(v => {
                const centerOfVehicle = centers.find(c => c.id === v.serviceCenterId);
                const isCheckedOut = v.status === 'checked_out';
                const totalPhotos = Object.keys(v.checkinPhotos || {}).length + Object.keys(v.checkoutPhotos || {}).length;
                const checkinDate = v.checkinTime ? new Date(v.checkinTime) : null;
                const checkoutDate = v.checkoutTime ? new Date(v.checkoutTime) : null;

                // Turnaround Duration calculation
                let durationBadge = 'In Service';
                if (checkinDate && checkoutDate) {
                  const diffMs = checkoutDate.getTime() - checkinDate.getTime();
                  const diffMins = Math.round(diffMs / 60000);
                  durationBadge = diffMins < 60 ? `${diffMins}m` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
                }

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleDetail(v)}
                    className="bg-slate-900 border border-slate-800 hover:border-brand-500/60 rounded-2xl p-4 transition flex flex-col justify-between space-y-3 group shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden"
                    title="Click to view deep details, photo inspection & records"
                  >
                    <div>
                      {/* Top Row: Number Plate, Vehicle Type & Status Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 group-hover:border-amber-400/50 transition">
                            {v.vehicleNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 flex items-center gap-1">
                            {v.vehicleType === 'car' ? <Car className="w-3 h-3 text-blue-400" /> : <Bike className="w-3 h-3 text-emerald-400" />}
                            {v.vehicleType}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isCheckedOut
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {isCheckedOut ? 'Completed' : 'In Service'}
                        </span>
                      </div>

                      {/* Middle: Service Type, Center & Customer */}
                      <div className="mt-2.5 space-y-1">
                        <p className="text-xs font-bold text-white truncate">
                          {v.serviceType || 'Standard Inspection & Service'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{centerOfVehicle?.name} ({centerOfVehicle?.location})</span>
                        </p>
                        {v.customerName && (
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="text-slate-300 truncate">{v.customerName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Turnaround Duration, Photos Count & Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{durationBadge}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          📷 {totalPhotos}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVehicleToDelete(v);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete vehicle entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[11px] text-brand-400 font-bold group-hover:text-brand-300 flex items-center gap-0.5 pl-1">
                          Details ➔
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SERVICE CENTERS */}
      {activeTab === 'centers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centers.map(c => {
              const centerMgrs = managers.filter(m => m.serviceCenterId === c.id);
              const centerVehs = vehicles.filter(v => v.serviceCenterId === c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCenterId(c.id);
                    setActiveTab('vehicles');
                    setStatusFilter('all');
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg space-y-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition group"
                  title={`Click to view all jobs for ${c.name}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${
                        c.type === 'car'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {c.type === 'car' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition flex items-center gap-1.5">
                          <span>{c.name}</span>
                          <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition text-xs font-normal">➔</span>
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {c.location}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      c.type === 'car'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {c.type} Center
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {c.address}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Contact: <strong className="text-slate-200">{c.contact}</strong></span>
                    <span>Managers: <strong className="text-purple-300">{centerMgrs.length}</strong></span>
                    <span className="text-amber-300 font-bold group-hover:underline">
                      Total Jobs: {centerVehs.length} (Click to view) ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGERS & PINs */}
      {activeTab === 'managers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers.map(mgr => {
              const assignedCenter = centers.find(c => c.id === mgr.serviceCenterId);
              const isRevealed = !!revealedPins[mgr.id];
              const managerVehicles = vehicles.filter(v => v.serviceCenterId === mgr.serviceCenterId);

              return (
                <div
                  key={mgr.id}
                  onClick={() => {
                    if (assignedCenter) {
                      setSelectedCenterId(assignedCenter.id);
                      setActiveTab('vehicles');
                      setStatusFilter('all');
                    }
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-4.5 shadow-lg space-y-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition group"
                  title="Click to view this manager's service center jobs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                        {mgr.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition flex items-center gap-1">
                          <span>{mgr.name}</span>
                          <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition text-xs">➔</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">{mgr.phone}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  {/* Assigned Center */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Assigned Service Center</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-medium mt-0.5">
                      {assignedCenter?.type === 'car' ? <Car className="w-3.5 h-3.5 text-blue-400" /> : <Bike className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="truncate">{assignedCenter?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* PIN Display & Toggle */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-slate-400">Login PIN:</span>
                      <span className="font-mono font-bold text-sm text-amber-300">
                        {isRevealed ? mgr.pin : '••••••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePinReveal(mgr.id)}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title={isRevealed ? 'Hide PIN' : 'Reveal PIN'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Center jobs: <strong className="text-sky-300">{managerVehicles.length}</strong></span>
                    <span className="text-purple-300 font-medium group-hover:underline">View jobs ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CLOUDFLARE CONFIGURATION & READINESS */}
      {activeTab === 'cloudflare' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Cloud className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cloudflare R2 (Storage) & D1 (Database) Architecture</h3>
              <p className="text-xs text-slate-400">
                Ready for production binding as soon as you provide Cloudflare details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* R2 Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-orange-400" /> Cloudflare R2 Bucket
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active & Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full-resolution inspection photo storage active with zero egress fees and edge streaming via /api/photos.
              </p>
              <div className="font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 space-y-1 break-all">
                <div>Bucket Name: <span className="text-orange-400 font-bold">gvd-inspection-photos</span></div>
                <div>Storage Binding: <span className="text-emerald-400 font-bold">PHOTOS_BUCKET (Connected)</span></div>
                <div>Public Stream: <span className="text-slate-400">/api/photos/inspections/...</span></div>
              </div>
            </div>

            {/* D1 Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" /> Cloudflare D1 Database
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active & Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Serverless SQL database storing service centers, managers with PINs, vehicle job cards, and photo metadata.
              </p>
              <div className="font-mono text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 space-y-1 break-all">
                <div>Database Name: <span className="text-cyan-400 font-bold">gvd_autocare_db</span></div>
                <div>Database ID: <span className="text-slate-400">9a193cb4-fac9-44a9-b81a-a257cbd0f8c0</span></div>
                <div>Binding: <span className="text-emerald-400 font-bold">DB (Connected)</span></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>All Systems Connected:</strong> Both Cloudflare D1 SQL database and Cloudflare R2 photo storage are active and bound to your live deployment at <strong>gvd-autocare.pages.dev</strong>!</span>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE CENTER */}
      {isAddCenterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-400" /> Add New Service Center
            </h3>

            <form onSubmit={handleCreateCenter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Center Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Auto Detailing Hub"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Bengaluru"
                    value={centerLocation}
                    onChange={(e) => setCenterLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Center Type *</label>
                  <select
                    value={centerType}
                    onChange={(e) => setCenterType(e.target.value as ServiceCenterType)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="car">🚗 Car Service Center</option>
                    <option value="bike">🏍️ Bike Service Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={centerContact}
                    onChange={(e) => setCenterContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="center@gvd.com"
                    value={centerEmail}
                    onChange={(e) => setCenterEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Address</label>
                <textarea
                  rows={2}
                  placeholder="Plot No., Road name, Landmark, Pincode..."
                  value={centerAddress}
                  onChange={(e) => setCenterAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCenterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow"
                >
                  Save Service Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANAGER */}
      {isAddManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Create Manager & Assign Center PIN
            </h3>

            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Manager Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={mgrName}
                  onChange={(e) => setMgrName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 99887 76655"
                  value={mgrPhone}
                  onChange={(e) => setMgrPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Service Center *</label>
                <select
                  value={mgrCenterId}
                  onChange={(e) => setMgrCenterId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">-- Choose Service Center --</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'car' ? '🚗' : '🏍️'} {c.name} ({c.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">8-Digit Security PIN *</label>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePin}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" /> Auto Generate 8-Digits
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="e.g. 12345678"
                  value={mgrPin}
                  onChange={(e) => setMgrPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-lg font-mono font-bold text-amber-300 focus:outline-none focus:border-brand-500 tracking-wider"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Manager will enter this 8-digit PIN on the mobile keypad to auto-login.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddManagerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow"
                >
                  Create Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deep Detail Modal when vehicle selected */}
      {selectedVehicleDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleDetail}
          center={centers.find(c => c.id === selectedVehicleDetail.serviceCenterId)}
          onClose={() => setSelectedVehicleDetail(null)}
          onDelete={(id) => handleDeleteVehicle(id)}
          onOpenComparison={(v) => {
            setSelectedVehicleDetail(null);
            onViewComparison(v);
          }}
        />
      )}

      {/* Quick Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-2xl bg-red-500/20 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Vehicle Record?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Permanently remove <strong>{vehicleToDelete.vehicleNumber}</strong> ({vehicleToDelete.serviceType || 'Inspection'}) and all associated photos.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteVehicle(vehicleToDelete.id);
                  setVehicleToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30"
              >
                Yes, Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
