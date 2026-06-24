import React, { useState } from 'react';
import { X } from 'lucide-react';

/* =========================================================================
   ADD VENDOR MODAL
   ========================================================================= */
export function AddVendorModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState('Pending');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !contact) return;
    onSave({ name, email, contact, status });
    // Reset Form
    setName('');
    setEmail('');
    setContact('');
    setStatus('Pending');
    onClose();
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Add New Vendor Account</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="vendor-name-field">Vendor Name <span className="required">*</span></label>
            <input 
              type="text" 
              id="vendor-name-field" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="e.g. ChemTrans Corp"
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendor-email-field">Email Address <span class="required">*</span></label>
            <input 
              type="email" 
              id="vendor-email-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="e.g. invoices@chemtrans.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendor-contact-field">Contact Person <span className="required">*</span></label>
            <input 
              type="text" 
              id="vendor-contact-field" 
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required 
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendor-status-field">Verification Status</label>
            <select 
              id="vendor-status-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active (Invoice Complete)</option>
              <option value="Pending">Pending (Needs Reminder)</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   DOCUMENT PREVIEW MODAL
   ========================================================================= */
export function DocPreviewModal({ isOpen, onClose, document, onApprove, onReject }) {
  if (!isOpen || !document) return null;

  // Render mock quantities/items depending on who the vendor is
  const isChem = document.vendorName.toLowerCase().includes('chem');
  const isCatalyst = document.vendorName.toLowerCase().includes('cat');
  
  const getInvoiceItems = () => {
    if (isChem) {
      return (
        <>
          <tr>
            <td>Industrial Sulphuric Acid (98% Tech Grade) - 1000L Bulk Tank</td>
            <td className="text-right">2</td>
            <td className="text-right">$1,200.00</td>
            <td className="text-right">$2,400.00</td>
          </tr>
          <tr>
            <td>Pure Sodium Hydroxide Pellets - 25kg bags</td>
            <td className="text-right">20</td>
            <td className="text-right">$45.00</td>
            <td className="text-right">$900.00</td>
          </tr>
          <tr>
            <td>Bulk Delivery Logistics & Safety Surcharge</td>
            <td className="text-right">1</td>
            <td className="text-right">$350.00</td>
            <td className="text-right">$350.00</td>
          </tr>
        </>
      );
    } else if (isCatalyst) {
      return (
        <>
          <tr>
            <td>Platinum Chemical Catalyst (Liquid suspension)</td>
            <td className="text-right">4</td>
            <td className="text-right">$1,850.00</td>
            <td className="text-right">$7,400.00</td>
          </tr>
          <tr>
            <td>Nickel Base Activator Agent - 50L Drum</td>
            <td className="text-right">5</td>
            <td className="text-right">$220.00</td>
            <td className="text-right">$1,100.00</td>
          </tr>
        </>
      );
    } else {
      return (
        <>
          <tr>
            <td>Miscellaneous Organic Raw Chemical Solvents</td>
            <td className="text-right">10</td>
            <td className="text-right">$180.00</td>
            <td className="text-right">$1,800.00</td>
          </tr>
          <tr>
            <td>Standard Laboratory Supply Kits</td>
            <td className="text-right">2</td>
            <td className="text-right">$150.00</td>
            <td className="text-right">$300.00</td>
          </tr>
        </>
      );
    }
  };

  const getSubtotal = () => {
    if (isChem) return 3650;
    if (isCatalyst) return 8500;
    return 2100;
  };

  const subtotal = getSubtotal();
  const tax = subtotal * 0.10;
  const grandTotal = subtotal + tax;

  return (
    <div className="modal-overlay show">
      <div className="modal-box doc-preview-box">
        <div className="modal-header">
          <h2 id="preview-doc-title">Document Invoice Preview - {document.vendorName}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="doc-preview-content">
          <div className="mock-invoice-paper">
            <div className="invoice-paper-header">
              <div className="invoice-company">
                <h3 id="preview-invoice-vendor-name">{document.vendorName}</h3>
                <p>Chemicals Supply & Distribution Division</p>
              </div>
              <div className="invoice-meta text-right">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> <span id="preview-invoice-number">{document.invoiceNum || 'INV-2026-004'}</span></p>
                <p><strong>Date:</strong> <span id="preview-invoice-date">{document.uploadDate}</span></p>
              </div>
            </div>
            <hr className="invoice-divider" />
            <div className="invoice-billing">
              <div className="bill-to">
                <span className="section-label">BILL TO:</span>
                <strong>PK Industries Ltd</strong>
                <p>Chemical Manufacturing Unit 4</p>
                <p>Industrial Estate, Phase II</p>
              </div>
            </div>
            <div className="invoice-items-table-wrapper">
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {getInvoiceItems()}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2"></td>
                    <td className="text-right font-semibold">Subtotal:</td>
                    <td className="text-right font-semibold">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td colSpan="2"></td>
                    <td className="text-right font-semibold">Tax (VAT 10%):</td>
                    <td className="text-right font-semibold">${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td colSpan="2"></td>
                    <td className="text-right font-bold text-primary">Grand Total:</td>
                    <td className="text-right font-bold text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="invoice-footer">
              <p>Thank you for your business. Terms: Net 30 days. Please wire transfer to PK Bank Account.</p>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          {document.status === 'Pending Review' ? (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  onReject(document.id);
                  onClose();
                }}
              >
                Reject Invoice
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  onApprove(document.id);
                  onClose();
                }}
              >
                Approve & File Invoice
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={onClose}>Close Invoice</button>
          )}
        </div>
      </div>
    </div>
  );
}
