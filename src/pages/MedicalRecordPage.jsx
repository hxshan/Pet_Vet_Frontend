import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, Calendar } from 'lucide-react';
import '../assets/styles/medicalRecords.css';
import NewRecordModal from '../components/NewRecordModal';
import { VaccinationModal } from '../components/VaccinationModal';
import { apiFetch } from '../utils/api';

function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState('');

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
        const res = await apiFetch(`medical-record/vet?page=${page}&limit=${limit}${qParam}`);
        if (!mounted) return;
        if (res.ok && res.data && Array.isArray(res.data.data)) {
          setRecords(res.data.data);
          setTotal(res.data.total || 0);
        } else {
          setRecords([]);
          setTotal(0);
          setError('No records found');
        }
      } catch (err) {
        console.error('Failed to load medical records', err);
        if (mounted) setError('Failed to load records');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [page, limit, query]);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return (
    <div className="medical-records-container">
      <div className="records-header">
        <h1 className="records-title">Medical Records</h1>
        <p className="records-subtitle">Manage and view patient medical records.</p>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search patients by name, owner, or species..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="filter-button">
          <Filter className="button-icon" />
          Filter
        </button>
        <button className="new-record-button" onClick={() => setIsModalOpen(true)}>
          <Plus className="button-icon" />
          New Record
        </button>
        <button className="new-record-button"
          onClick={() => setIsVaccinationModalOpen(true)}
        >
          <Plus className="button-icon" />
          New Vaccination Record
        </button>
      </div>

      {/* Records Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="records-table">
            <thead className="table-header">
              <tr>
                <th className="table-heading">Patient Name</th>
                <th className="table-heading">Species</th>
                <th className="table-heading">Breed</th>
                <th className="table-heading">Owner</th>
                <th className="table-heading">Last Visit</th>
                <th className="table-heading">Status</th>
                <th className="table-heading">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr className="table-row"><td colSpan={7} className="table-cell">Loading...</td></tr>
              ) : error ? (
                <tr className="table-row"><td colSpan={7} className="table-cell">{error}</td></tr>
              ) : records.length === 0 ? (
                <tr className="table-row"><td colSpan={7} className="table-cell">No records</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="table-row">
                    <td className="table-cell cell-primary">{record.pet?.name || '—'}</td>
                    <td className="table-cell">{record.pet?.species || '—'}</td>
                    <td className="table-cell">{record.pet?.breed || '—'}</td>
                    <td className="table-cell">{(record.petOwner && (record.petOwner.firstname || record.petOwner.lastname)) ? `${record.petOwner.firstname || ''} ${record.petOwner.lastname || ''}`.trim() : (typeof record.petOwner === 'string' ? record.petOwner : '—')}</td>
                    <td className="table-cell">
                      <div className="date-cell">
                        <Calendar className="date-icon" />
                        {record.visitDate ? new Date(record.visitDate).toLocaleString() : (record.createdAt ? new Date(record.createdAt).toLocaleString() : '—')}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${'status-active'}`}>
                        {record.status || 'Active'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button className="view-button">
                        <FileText className="view-icon" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="pagination-container">
        <p className="pagination-info">Showing {records.length === 0 ? 0 : ( (page-1)*limit + 1 ) } to {Math.min(page*limit, total)} of {total} records</p>
        <div className="pagination-buttons">
          <button className="pagination-button" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>Previous</button>
          {Array.from({ length: Math.max(1, Math.ceil(total / limit)) }).slice(Math.max(0, page-3), page+2).map((_, idx) => {
            const pnum = idx + Math.max(1, page-3);
            return (
              <button key={pnum} className={`pagination-button ${pnum === page ? 'pagination-active' : ''}`} onClick={() => setPage(pnum)}>{pnum}</button>
            );
          })}
          <button className="pagination-button" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>Next</button>
        </div>
      </div>
      <NewRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <VaccinationModal isOpen={isVaccinationModalOpen} onClose={() => setIsVaccinationModalOpen(false)} />
    </div>
  );
}

export default MedicalRecords;