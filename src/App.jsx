import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toasts from './components/Toasts';
import LoginPage from './components/LoginPage';

import DashboardPage from './components/DashboardPage';
import VendorPage from './components/VendorPage';
import EmailPage from './components/EmailPage';
import SDSProcessingPage from './components/SDSProcessingPage';
import ComplianceAnalyticsPage from './components/ComplianceAnalyticsPage';

// ── GHS classification tags ──────────────────────────────────────
export const GHS_CLASSES = [
  'Flammable', 'Toxic', 'Corrosive', 'Health Hazard',
  'Environmental', 'Oxidizing', 'Compressed Gas', 'Explosive'
];

// ── Helper: random pick from array ──────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function App() {
  // ── Auth (localStorage) ─────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dow_auth_status')) === true; }
    catch { return false; }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem('dow_current_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('dow_auth_status', JSON.stringify(isAuthenticated));
    if (currentUser) localStorage.setItem('dow_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('dow_current_user');
  }, [isAuthenticated, currentUser]);

  // ── Navigation (localStorage) ──────────────────────────────
  const [activePage, setActivePage] = useState(() =>
    localStorage.getItem('dow_active_page') || 'dashboard'
  );
  useEffect(() => { localStorage.setItem('dow_active_page', activePage); }, [activePage]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Toasts ─────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  // ── Notifications ──────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const addNotification = (type, text) => {
    const id = Date.now();
    setNotifications(prev => [{ id, text, time: 'Just now', read: false, type }, ...prev]);
  };

  // ── Vendors ────────────────────────────────────────────────
  const [vendors, setVendors] = useState([]);

  // ── SDS Documents ──────────────────────────────────────────
  const [sdsDocuments, setSdsDocuments] = useState([]);

  // ── Activity log ───────────────────────────────────────────
  const [activities, setActivities] = useState([]);
  const logActivity = (vendorName, requestDate, responseDate, status, complianceStatus) => {
    const id = 'act-' + Date.now();
    setActivities(prev => [
      { id, vendorName, requestDate, responseDate, status, complianceStatus },
      ...prev
    ]);
  };

  // ── Email Campaign Stats ───────────────────────────────────
  const [requestsSent, setRequestsSent] = useState(0);
  const [successSent, setSuccessSent]   = useState(0);
  const [failedSent, setFailedSent]     = useState(0);
  const [lastRequestDate, setLastRequestDate] = useState(null);

  // ── Email template ─────────────────────────────────────────
  const [emailTemplate, setEmailTemplate] = useState(`Dear {vendor_name},

As part of Dow Chemical's supplier compliance and product stewardship program, we are requesting the latest SDS/MSDS documentation for products supplied to Dow Chemical.

ACTION REQUIRED:
Please reply directly to this email and attach your latest SDS/MSDS document(s).

Accepted formats: PDF, SDS, MSDS

Your SDS document should contain the following information:
- Product Name
- Emergency Telephone Number
- Revision Date
- GHS Classification

If you need assistance, please contact: supplier.compliance@dow.com

Thank you for your prompt cooperation in supporting our compliance program.

Best regards,

Global Supplier Compliance Team
Product Safety & Regulatory Affairs
Dow Chemical`);

  // ── Load Data from database (via server endpoints) ────────
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch Vendors
    fetch('http://localhost:4000/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(v => ({
            id: v.id,
            name: v.name,
            email: v.email,
            contact: v.contact,
            requestDate: v.request_date,
            lastResponseDate: v.last_response_date,
            status: v.status,
            complianceStatus: v.compliance_status
          }));
          setVendors(mapped);
          
          const initialActivities = mapped
            .filter(v => v.lastResponseDate || v.requestDate)
            .map(v => ({
              id: 'act-' + v.id,
              vendorName: v.name,
              requestDate: v.requestDate,
              responseDate: v.lastResponseDate,
              status: v.status === 'Responded' ? 'Success' : 'Requested',
              complianceStatus: v.complianceStatus
            }));
          setActivities(initialActivities);
        }
      })
      .catch(err => console.error('Failed to load vendors:', err));

    // Fetch SDS documents
    fetch('http://localhost:4000/sds-data')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.records)) {
          setSdsDocuments(data.records);
        }
      })
      .catch(err => console.error('Failed to load SDS data:', err));
  }, [isAuthenticated]);

  // ── Vendor CRUD ────────────────────────────────────────────
  const handleAddVendor = async (data) => {
    const v = { id: 'v-' + Date.now(), ...data, requestDate: null, lastResponseDate: null, status: 'Pending', complianceStatus: 'Pending' };
    try {
      await fetch('http://localhost:4000/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v)
      });
      setVendors(prev => [...prev, v]);
      addToast('success', 'Vendor Added', `${v.name} has been registered.`);
      addNotification('info', `New vendor registered: <strong>${v.name}</strong>`);
      logActivity(v.name, null, null, 'Pending', 'Pending');
    } catch (err) {
      console.error(err);
      addToast('danger', 'Save Error', 'Failed to save vendor to Supabase.');
    }
  };

  const handleDeleteVendor = async (id) => {
    const v = vendors.find(x => x.id === id);
    if (!v) return;
    try {
      await fetch(`http://localhost:4000/vendors/${id}`, { method: 'DELETE' });
      setVendors(prev => prev.filter(x => x.id !== id));
      addToast('danger', 'Vendor Removed', `${v.name} has been deleted.`);
    } catch (err) {
      console.error(err);
      addToast('danger', 'Error', 'Failed to delete vendor.');
    }
  };

  const handleImportVendors = async (list, filename) => {
    const processed = list.map((mv, i) => ({
      id: `v-import-${Date.now()}-${i}`,
      name: mv.name || '',
      email: mv.email || '',
      contact: mv.contact || '',
      requestDate: null,
      lastResponseDate: null,
      status: 'Pending',
      complianceStatus: 'Pending',
    }));

    for (const v of processed) {
      try {
        await fetch('http://localhost:4000/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v)
        });
      } catch (err) {
        console.error('Failed to import vendor', v.name, err);
      }
    }

    setVendors(prev => [...prev, ...processed]);
    addToast('success', 'Excel Imported', `Imported ${processed.length} vendors from ${filename}.`);
    addNotification('success', `Excel import: <strong>${filename}</strong> — ${processed.length} vendors added.`);
  };

  // Quick import stub (removed dummy data)
  const handleQuickImport = () => {
    addToast('info', 'Feature Disabled', 'Quick import dummy data has been removed.');
  };

  const handleMarkCompliant = async (vendorName) => {
    const v = vendors.find(x => x.name === vendorName);
    if (!v) return;
    
    const updatedVendor = { ...v, complianceStatus: 'Compliant', status: 'Compliant' };
    try {
      await fetch('http://localhost:4000/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVendor)
      });
      
      setVendors(prev => prev.map(item =>
        item.name === vendorName ? updatedVendor : item
      ));

      setSdsDocuments(prev => prev.map(d =>
        d.vendorName === vendorName ? { ...d, processingStatus: 'Processed' } : d
      ));

      addToast('success', 'Compliance Updated', `${vendorName} marked as Compliant.`);
      addNotification('success', `<strong>${vendorName}</strong> is now compliant.`);
    } catch (err) {
      console.error(err);
      addToast('danger', 'Error', 'Failed to update compliance status.');
    }
  };

  // ── Login / Logout ─────────────────────────────────────────
  const handleLogin = async (userData) => {
    try {
      await fetch('http://localhost:4000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch (err) {
      console.error('Failed to sync user session to database:', err);
    }
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    addToast('info', 'Signing Out', 'Logging out of Dow Chemical compliance portal...');
    setTimeout(() => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActivePage('dashboard');
      localStorage.removeItem('dow_auth_status');
      localStorage.removeItem('dow_current_user');
      localStorage.removeItem('dow_active_page');
    }, 1000);
  };

  // ── Computed metrics ──────────────────────────────────────
  const totalVendors    = vendors.length;
  const compliantCount  = vendors.filter(v => v.complianceStatus === 'Compliant').length;
  const pendingCount    = vendors.filter(v => v.status === 'Pending' || v.status === 'Overdue').length;
  const respondedCount  = vendors.filter(v => v.status === 'Responded' || v.status === 'Compliant').length;
  const sdsReceived     = sdsDocuments.length;
  const sdsProcessed    = sdsDocuments.filter(d => d.processingStatus === 'Processed').length;
  const sdsFailed       = sdsDocuments.filter(d => d.processingStatus === 'Failed').length;
  const complianceRate  = totalVendors > 0 ? Math.round((compliantCount / totalVendors) * 100) : 0;

  // ── Page renderer ─────────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            vendors={vendors}
            activities={activities}
            requestsSent={requestsSent}
            sdsReceived={sdsReceived}
            sdsProcessed={sdsProcessed}
            pendingCount={pendingCount}
            sdsFailed={sdsFailed}
            complianceRate={complianceRate}
            lastRequestDate={lastRequestDate}
            onTriggerEmail={() => setActivePage('email')}
            onImportExcel={handleQuickImport}
          />
        );
      case 'vendors':
        return (
          <VendorPage
            vendors={vendors}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
            onImportVendors={handleImportVendors}
            onMarkCompliant={handleMarkCompliant}
          />
        );
      case 'email':
        return (
          <EmailPage
            vendors={vendors}
            addNotification={addNotification}
            addToast={addToast}
            requestsSent={requestsSent}
            setRequestsSent={setRequestsSent}
            successSent={successSent}
            setSuccessSent={setSuccessSent}
            failedSent={failedSent}
            setFailedSent={setFailedSent}
            setLastRequestDate={setLastRequestDate}
            onLogActivity={logActivity}
            emailTemplate={emailTemplate}
            setEmailTemplate={setEmailTemplate}
            setVendors={setVendors}
          />
        );
      case 'sds':
        return (
          <SDSProcessingPage
            sdsDocuments={sdsDocuments}
            setSdsDocuments={setSdsDocuments}
            vendors={vendors}
            setVendors={setVendors}
            onLogActivity={logActivity}
            addToast={addToast}
            addNotification={addNotification}
          />
        );
      case 'analytics':
        return (
          <ComplianceAnalyticsPage
            vendors={vendors}
            sdsDocuments={sdsDocuments}
            requestsSent={requestsSent}
            complianceRate={complianceRate}
          />
        );
      default:
        return <div className="page-content">Page Not Found</div>;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toasts toasts={toasts} setToasts={setToasts} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />
      <main className="main-panel">
        <Header
          activePage={activePage}
          notifications={notifications}
          setNotifications={setNotifications}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
        <div className="content-body">
          {renderPage()}
        </div>
      </main>
      <Toasts toasts={toasts} setToasts={setToasts} />
    </div>
  );
}
