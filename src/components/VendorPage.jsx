import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Search, Upload, Plus, Trash2, CheckCircle2, X, FileSpreadsheet, User, Mail, UserCheck, AlertCircle } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Utility: derive a "Contact Name" from vendor name or email
   ───────────────────────────────────────────────────────────── */
function deriveContact(vendorName = '', email = '') {
  if (vendorName.trim()) {
    const firstWord = vendorName.trim().split(/\s+/)[0];
    return `${firstWord} Contact`;
  }
  if (email.trim()) {
    const domain = email.split('@')[1] || '';
    const company = domain.split('.')[0] || 'Vendor';
    return `${company.charAt(0).toUpperCase() + company.slice(1)} Contact`;
  }
  return 'Unknown Contact';
}

/* ─────────────────────────────────────────────────────────────
   Utility: normalise a raw Excel row into { name, email, contact }
   ───────────────────────────────────────────────────────────── */
function normaliseRow(raw) {
  const keys = Object.keys(raw);

  const nameKey = keys.find(k =>
    /vendor.?name|company|name/i.test(k)
  );
  const emailKey = keys.find(k =>
    /e.?mail|mail/i.test(k)
  );
  const contactKey = keys.find(k =>
    /contact|person|contact.?name|contact.?person/i.test(k)
  );

  const name    = (nameKey    ? String(raw[nameKey]    || '').trim() : '');
  const email   = (emailKey   ? String(raw[emailKey]   || '').trim() : '');
  const contact = (contactKey ? String(raw[contactKey] || '').trim() : '');

  return {
    name,
    email,
    contact: contact || deriveContact(name, email),
    contactWasDerived: !contact,
  };
}

/* ═══════════════════════════════════════════════════════════════
   INLINE ADD VENDOR FORM
   ═══════════════════════════════════════════════════════════════ */
function InlineAddForm({ onSave, onCancel }) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({
      name:    name.trim(),
      email:   email.trim(),
      contact: contact.trim() || deriveContact(name.trim(), email.trim()),
    });
    setName(''); setEmail(''); setContact('');
  };

  return (
    <form className="inline-add-form" onSubmit={handleSubmit} id="inline-add-vendor-form">
      <div className="inline-add-title">
        <UserCheck size={16} />
        <span>Add New Vendor</span>
      </div>
      <div className="inline-add-fields">
        <div className="inline-field">
          <label htmlFor="iaf-name">Vendor Name <span className="required">*</span></label>
          <input
            id="iaf-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. ChemTrans Corp"
            required
          />
        </div>
        <div className="inline-field">
          <label htmlFor="iaf-email">Email Address <span className="required">*</span></label>
          <input
            id="iaf-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. compliance@chemtrans.com"
            required
          />
        </div>
        <div className="inline-field">
          <label htmlFor="iaf-contact">Contact Person <span className="optional">(optional)</span></label>
          <input
            id="iaf-contact"
            type="text"
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="Auto-generated if left blank"
          />
        </div>
      </div>
      <div className="inline-add-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" id="btn-save-inline-vendor">
          <Plus size={15} /> Save Vendor
        </button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   IMPORT PREVIEW MODAL
   ═══════════════════════════════════════════════════════════════ */
function ImportPreviewModal({ rows, filename, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay show">
      <div className="modal-box import-preview-box">
        <div className="modal-header">
          <h2>
            <FileSpreadsheet size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Excel Import Preview — <em>{filename}</em>
          </h2>
          <button className="modal-close-btn" onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="import-preview-body">
          <p className="import-preview-subtitle">
            {rows.length} vendor row{rows.length !== 1 ? 's' : ''} detected.
            Review below and confirm import.
          </p>

          <div className="import-derived-note">
            <AlertCircle size={14} />
            <span>Rows marked <span className="derived-badge">Auto</span> had no Contact column — contact was generated from vendor name/email.</span>
          </div>

          <div className="table-responsive import-preview-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th><User size={13} /> Vendor Name</th>
                  <th><Mail size={13} /> Email</th>
                  <th><UserCheck size={13} /> Contact Person</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="row-num">{i + 1}</td>
                    <td><strong>{r.name || <span className="text-muted">—</span>}</strong></td>
                    <td>{r.email || <span className="text-muted">—</span>}</td>
                    <td>
                      {r.contact}
                      {r.contactWasDerived && (
                        <span className="derived-badge">Auto</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" id="btn-confirm-import" onClick={() => onConfirm(rows)}>
            <CheckCircle2 size={16} /> Import {rows.length} Vendor{rows.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN VENDOR PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function VendorPage({
  vendors,
  onAddVendor,
  onDeleteVendor,
  onImportVendors,
  onMarkCompliant
}) {
  const [searchQuery,       setSearchQuery]       = useState('');
  const [showAddForm,       setShowAddForm]        = useState(false);
  const [importRows,        setImportRows]         = useState(null);
  const [importFilename,    setImportFilename]     = useState('');
  const [importError,       setImportError]        = useState('');
  const [lastImportMsg,     setLastImportMsg]      = useState('');
  const [deleteConfirmId,   setDeleteConfirmId]    = useState(null);

  const fileInputRef = useRef(null);

  /* ── Filter ── */
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.name    || '').toLowerCase().includes(q) ||
      (v.email   || '').toLowerCase().includes(q) ||
      (v.contact || '').toLowerCase().includes(q)
    );
  });

  /* ── Excel Upload ── */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setImportError('');

    try {
      const data = await file.arrayBuffer();
      const workbook  = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet     = workbook.Sheets[sheetName];
      const rawRows   = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rawRows.length) {
        setImportError('The uploaded file appears to be empty or has no readable rows.');
        return;
      }

      const parsed = rawRows
        .map(normaliseRow)
        .filter(r => r.name || r.email);

      if (!parsed.length) {
        setImportError('Could not find Vendor Name or Email columns. Please check your Excel format.');
        return;
      }

      setImportFilename(file.name);
      setImportRows(parsed);
    } catch (err) {
      setImportError(`Failed to read file: ${err.message}`);
    }
  };

  const handleConfirmImport = (rows) => {
    const clean = rows.map(({ contactWasDerived: _omit, ...rest }) => rest);
    onImportVendors(clean, importFilename);
    setLastImportMsg(`Successfully imported ${clean.length} vendor${clean.length !== 1 ? 's' : ''} from ${importFilename}.`);
    setImportRows(null);
    setImportFilename('');
    setTimeout(() => setLastImportMsg(''), 6000);
  };

  const handleAddVendor = (vendorData) => {
    onAddVendor(vendorData);
    setShowAddForm(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };
  
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteVendor(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getComplianceBadgeClass = (status) => {
    switch (status) {
      case 'Compliant':
        return 'badge success';
      case 'Under Review':
        return 'badge sent';
      case 'Non-Compliant':
      case 'Overdue':
        return 'badge failed';
      case 'Pending':
      default:
        return 'badge pending';
    }
  };

  return (
    <div className="page-content">

      {/* ── Toolbar ── */}
      <div className="page-header-actions">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or contact…"
            id="vendor-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="action-buttons-group">
          <button
            className="btn btn-secondary"
            id="btn-upload-excel"
            onClick={() => { setImportError(''); fileInputRef.current.click(); }}
            title="Upload an Excel/CSV file to bulk-import vendors"
          >
            <Upload size={16} /> Upload Excel
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />

          <button
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
            id="btn-add-vendor-toggle"
            onClick={() => setShowAddForm(p => !p)}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Cancel' : 'Add Vendor'}
          </button>
        </div>
      </div>

      {/* ── Import Error Bar ── */}
      {importError && (
        <div className="excel-info-bar error-bar" id="import-error-bar">
          <div className="info-content">
            <AlertCircle size={18} className="error-icon" />
            <span>{importError}</span>
          </div>
          <button className="dismiss-btn" onClick={() => setImportError('')}><X size={16} /></button>
        </div>
      )}

      {/* ── Import Success Bar ── */}
      {lastImportMsg && (
        <div className="excel-info-bar" id="import-success-bar">
          <div className="info-content">
            <CheckCircle2 className="success-icon" size={18} />
            <span>{lastImportMsg}</span>
          </div>
          <button className="dismiss-btn" onClick={() => setLastImportMsg('')}><X size={16} /></button>
        </div>
      )}

      {/* ── Inline Add Form ── */}
      {showAddForm && (
        <InlineAddForm
          onSave={handleAddVendor}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* ── Vendor Count Summary ── */}
      <div className="vendor-summary-row">
        <span className="vendor-count-label">
          Showing <strong>{filteredVendors.length}</strong> of <strong>{vendors.length}</strong> vendor{vendors.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Vendor Table ── */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table" id="vendor-data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th><User size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Vendor Name</th>
                <th><Mail size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Email Address</th>
                <th><UserCheck size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Contact Person</th>
                <th>Compliance Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-state">
                    <FileSpreadsheet size={36} strokeWidth={1.2} />
                    <h3>{vendors.length === 0 ? 'No vendors yet' : 'No results found'}</h3>
                    <p>
                      {vendors.length === 0
                        ? 'Upload an Excel file or click "Add Vendor" to get started.'
                        : 'Try a different search term.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor, idx) => (
                  <tr key={vendor.id} className={deleteConfirmId === vendor.id ? 'row-deleting' : ''}>
                    <td className="row-num text-muted">{idx + 1}</td>
                    <td>
                      <div className="vendor-name-cell">
                        <div className="vendor-avatar-chip">
                          {(vendor.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <strong>{vendor.name}</strong>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${vendor.email}`} className="email-link">
                        {vendor.email}
                      </a>
                    </td>
                    <td>
                      <span className="contact-chip">{vendor.contact}</span>
                    </td>
                    <td>
                      <span className={getComplianceBadgeClass(vendor.complianceStatus || 'Pending')}>
                        {vendor.complianceStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="text-right">
                      {deleteConfirmId === vendor.id ? (
                        <div className="delete-confirm-row">
                          <span className="delete-confirm-text">Delete?</span>
                          <button
                            className="btn btn-danger-sm"
                            id={`btn-confirm-delete-${vendor.id}`}
                            onClick={handleDeleteConfirm}
                          >
                            Yes
                          </button>
                          <button
                            className="btn btn-ghost-sm"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
                          {vendor.complianceStatus !== 'Compliant' && (
                            <button
                              className="btn btn-success-sm"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => onMarkCompliant(vendor.name)}
                              title="Mark Compliant"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            className="actions-cell-btn delete-btn"
                            id={`btn-delete-${vendor.id}`}
                            onClick={() => handleDeleteClick(vendor.id)}
                            title="Delete Vendor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Import Preview Modal ── */}
      {importRows && (
        <ImportPreviewModal
          rows={importRows}
          filename={importFilename}
          onConfirm={handleConfirmImport}
          onCancel={() => { setImportRows(null); setImportFilename(''); }}
        />
      )}
    </div>
  );
}
