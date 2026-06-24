import React, { useState } from 'react';
import { Search, Eye, FileText } from 'lucide-react';

export default function DocumentPage({
  documents,
  onOpenPreview
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter documents based on text and dropdown selection
  const filteredDocuments = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.vendorName.toLowerCase().includes(q) || 
      doc.fileName.toLowerCase().includes(q);

    const matchesStatus = 
      statusFilter === 'All' || 
      doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'badge approved';
      case 'Rejected':
        return 'badge rejected';
      case 'Pending Review':
      default:
        return 'badge pending-review';
    }
  };

  return (
    <div className="page-content">
      <div className="page-header-actions">
        {/* Search bar */}
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vendor name or file name..."
          />
        </div>

        {/* Filters */}
        <div className="filters-group">
          <div className="filter-wrapper">
            <label htmlFor="status-filter">Status Filter</label>
            <select 
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Documents</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>File Name</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-state">
                    <FileText size={48} />
                    <h3>No documents found</h3>
                    <p>Try searching for a different name or clear active status filters.</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.vendorName}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{doc.fileName}</td>
                    <td>{doc.uploadDate}</td>
                    <td>
                      <span className={getStatusBadgeClass(doc.status)}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        className="actions-cell-btn view-btn"
                        onClick={() => onOpenPreview(doc)}
                        title="View Document Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
