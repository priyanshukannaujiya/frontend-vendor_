import React from 'react';
import { Users, Send, FileCheck, Clock, MailX, CalendarClock, TrendingUp, AlertCircle, AlertTriangle, CheckCircle2, RefreshCw, FileSpreadsheet, MailPlus, ShieldAlert } from 'lucide-react';

export default function DashboardPage({
  vendors,
  activities,
  requestsSent,
  sdsReceived,
  sdsProcessed,
  pendingCount,
  sdsFailed,
  complianceRate,
  lastRequestDate,
  onTriggerEmail,
  onImportExcel
}) {
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Compliant':
      case 'Processed':
      case 'Success':
        return 'badge success';
      case 'Responded':
      case 'Under Review':
        return 'badge sent';
      case 'Failed':
      case 'Non-Compliant':
      case 'Overdue':
        return 'badge failed';
      case 'Pending':
      default:
        return 'badge pending';
    }
  };

  return (
    <div className="page-content active">
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Vendors */}
        <div className="kpi-card blue-gradient">
          <div className="kpi-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="kpi-details">
            <h3>Total Vendors</h3>
            <span className="kpi-value">{vendors.length}</span>
            <p className="kpi-trend positive">
              <TrendingUp size={12} />
              <span>Compliance Rate: {complianceRate}%</span>
            </p>
          </div>
        </div>

        {/* Requests Sent */}
        <div className="kpi-card green-gradient">
          <div className="kpi-icon-wrapper">
            <Send size={24} />
          </div>
          <div className="kpi-details">
            <h3>Compliance Requests</h3>
            <span className="kpi-value">{requestsSent}</span>
            <p className="kpi-trend positive">
              <TrendingUp size={12} />
              <span>Sent via SMTP</span>
            </p>
          </div>
        </div>

        {/* SDS Documents Received */}
        <div className="kpi-card purple-gradient">
          <div className="kpi-icon-wrapper">
            <FileCheck size={24} />
          </div>
          <div className="kpi-details">
            <h3>SDS Received</h3>
            <span className="kpi-value">{sdsReceived}</span>
            <p className="kpi-trend positive">
              <CheckCircle2 size={12} />
              <span>{sdsProcessed} Processed</span>
            </p>
          </div>
        </div>

        {/* Pending Vendors */}
        <div className="kpi-card orange-gradient">
          <div className="kpi-icon-wrapper">
            <Clock size={24} />
          </div>
          <div className="kpi-details">
            <h3>Pending / Overdue</h3>
            <span className="kpi-value">{pendingCount}</span>
            <p className="kpi-trend neutral">
              <AlertCircle size={12} />
              <span>Awaiting SDS reply</span>
            </p>
          </div>
        </div>

        {/* Extraction Failures */}
        <div className="kpi-card red-gradient">
          <div className="kpi-icon-wrapper">
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-details">
            <h3>Extraction Failures</h3>
            <span className="kpi-value">{sdsFailed}</span>
            <p className="kpi-trend negative">
              <AlertTriangle size={12} />
              <span>Requires attention</span>
            </p>
          </div>
        </div>

        {/* Last Inbox Scan */}
        <div className="kpi-card gray-gradient">
          <div className="kpi-icon-wrapper">
            <CalendarClock size={24} />
          </div>
          <div className="kpi-details">
            <h3>Last Request Date</h3>
            <span className="kpi-value date-value">{lastRequestDate || 'Never'}</span>
            <p className="kpi-trend info">
              <RefreshCw size={12} />
              <span>IMAP scanning enabled</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="dashboard-split">
        {/* Left Side: Recent Activity Table */}
        <div className="dashboard-table-card">
          <div className="card-header">
            <h2>SDS Compliance Activity Log</h2>
            <div className="table-actions">
              <span className="pulse-indicator"></span>
              <span className="action-caption">Live Monitoring</span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Request Date</th>
                  <th>SDS Received Date</th>
                  <th>Extraction Status</th>
                  <th>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No recent activities logged. Send emails or run an IMAP scan to see live logs.
                    </td>
                  </tr>
                ) : (
                  activities.map((act) => (
                    <tr key={act.id}>
                      <td><strong>{act.vendorName}</strong></td>
                      <td>{act.requestDate || <span style={{ color: 'var(--text-light)' }}>-</span>}</td>
                      <td>{act.responseDate || <span style={{ color: 'var(--text-light)' }}>-</span>}</td>
                      <td>
                        <span className={getStatusBadgeClass(act.status)}>
                          {act.status}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(act.complianceStatus)}>
                          {act.complianceStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Mini Widgets / Quick Stats */}
        <div className="dashboard-sidebar-widgets">
          {/* System Status Dashboard */}
          <div className="info-card">
            <div className="card-header">
              <h2>Compliance Settings</h2>
            </div>
            <div className="status-list">
              <div className="status-row">
                <span className="status-label">Next Automated Scan</span>
                <span className="status-value highlight">Hourly Interval</span>
              </div>
              <div className="status-row">
                <span className="status-label">Active Connection</span>
                <span className="status-value success-text">IMAP & SMTP Active</span>
              </div>
              <div className="status-row">
                <span className="status-label">Compliance Policy</span>
                <span className="status-value link-text">Dow SDS Revision ≤ 3Y</span>
              </div>
            </div>
          </div>

          {/* Quick Start Actions */}
          <div className="info-card quick-actions-card">
            <div className="card-header">
              <h2>Quick Operations</h2>
            </div>
            <div className="quick-buttons">
              <button 
                className="btn btn-secondary" 
                onClick={onImportExcel}
              >
                <FileSpreadsheet size={16} /> Import Vendor List
              </button>
              <button 
                className="btn btn-primary" 
                onClick={onTriggerEmail}
              >
                <MailPlus size={16} /> Run Request Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
