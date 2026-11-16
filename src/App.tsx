import React, { useState, useEffect } from 'react';
import { appStore, SessionUser } from './services/store';
import { VehicleRecord } from './types';
import { Header } from './components/Header';
import { LoginView } from './views/LoginView';
import { ManagerDashboard } from './views/ManagerDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { CarCheckinFlow } from './views/CarCheckinFlow';
import { BikeCheckinFlow } from './views/BikeCheckinFlow';
import { CheckoutFlow } from './views/CheckoutFlow';
import { ComparisonViewer } from './components/ComparisonViewer';
import { InstallPrompt } from './components/InstallPrompt';

export const App: React.FC = () => {
  // Session: defaults to pre-authenticated Rahul Sharma (Car Manager) for instant first-look demo,
  // or user can switch in 1-click to Admin or Bike Manager.
  const [session, setSession] = useState<SessionUser | null>(() => {
    const centers = appStore.getServiceCenters();
    const managers = appStore.getManagers();
    const defaultMgr = managers[0];
    const defaultCenter = centers.find(c => c.id === defaultMgr.serviceCenterId);
    return {
      role: 'manager',
      name: defaultMgr.name,
      managerId: defaultMgr.id,
      serviceCenterId: defaultMgr.serviceCenterId,
      serviceCenter: defaultCenter
    };
  });

  const [vehicles, setVehicles] = useState<VehicleRecord[]>(() => appStore.getVehicles());
  const [currentFlow, setCurrentFlow] = useState<'dashboard' | 'car_checkin' | 'bike_checkin' | 'checkout'>('dashboard');
  const [selectedVehicleForCheckout, setSelectedVehicleForCheckout] = useState<VehicleRecord | null>(null);
  const [comparisonVehicle, setComparisonVehicle] = useState<VehicleRecord | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setVehicles(appStore.getVehicles());
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    setSession(null);
    setCurrentFlow('dashboard');
  };

  const handleStartCheckin = () => {
    if (session?.serviceCenter?.type === 'car') {
      setCurrentFlow('car_checkin');
    } else {
      setCurrentFlow('bike_checkin');
    }
  };

  const handleStartCheckout = (vehicle: VehicleRecord) => {
    setSelectedVehicleForCheckout(vehicle);
    setCurrentFlow('checkout');
  };

  const handleFlowSuccess = (vehicleId: string) => {
    const updated = appStore.getVehicleById(vehicleId);
    setCurrentFlow('dashboard');
    if (updated && updated.status === 'checked_out') {
      setComparisonVehicle(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <InstallPrompt />
      <Header
        session={session}
        onLogout={handleLogout}
        onSwitchSession={(newSession) => {
          setSession(newSession);
          setCurrentFlow('dashboard');
        }}
      />

      <main className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
        {!session ? (
          <LoginView onLoginSuccess={(u) => setSession(u)} />
        ) : session.role === 'admin' ? (
          <AdminDashboard
            session={session}
            vehicles={vehicles}
            onViewComparison={(v) => setComparisonVehicle(v)}
          />
        ) : currentFlow === 'car_checkin' ? (
          <CarCheckinFlow
            session={session}
            onBack={() => setCurrentFlow('dashboard')}
            onSuccess={handleFlowSuccess}
          />
        ) : currentFlow === 'bike_checkin' ? (
          <BikeCheckinFlow
            session={session}
            onBack={() => setCurrentFlow('dashboard')}
            onSuccess={handleFlowSuccess}
          />
        ) : currentFlow === 'checkout' && selectedVehicleForCheckout ? (
          <CheckoutFlow
            vehicle={selectedVehicleForCheckout}
            session={session}
            onBack={() => setCurrentFlow('dashboard')}
            onSuccess={handleFlowSuccess}
          />
        ) : (
          <ManagerDashboard
            session={session}
            vehicles={vehicles}
            onStartCheckin={handleStartCheckin}
            onStartCheckout={handleStartCheckout}
            onViewComparison={(v) => setComparisonVehicle(v)}
          />
        )}
      </main>

      {/* Comparison Modal when active */}
      {comparisonVehicle && (
        <ComparisonViewer
          vehicle={comparisonVehicle}
          onClose={() => setComparisonVehicle(null)}
        />
      )}
    </div>
  );
};

export default App;
