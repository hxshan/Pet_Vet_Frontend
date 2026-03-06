import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, Calendar, Syringe } from 'lucide-react';
import '../assets/styles/medicalRecords.css';
import NewRecordModal from '../components/NewRecordModal';
import { VaccinationModal } from '../components/VaccinationModal';
import { RecordDetailModal } from '../components/RecordDetailModal';
import { VaccinationDetailModal } from '../components/VaccinationDetailModal';
import { ToastContainer } from '../components/Toast.jsx';
import { useToast } from '../components/useToast.js';
import { apiFetch } from '../utils/api';

function MedicalRecords() {
  const [activeTab, setActiveTab] = useState('medical');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);

  // Medical records state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Vaccination records state
  const [vaxRecords, setVaxRecords] = useState([]);
  const [loadingVax, setLoadingVax] = useState(false);
  const [errorVax, setErrorVax] = useState('');
  const [vaxPage, setVaxPage] = useState(1);
  const [vaxTotal, setVaxTotal] = useState(0);
  const [vaxRefreshKey, setVaxRefreshKey] = useState(0);

  // Detail modal state
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedVaxId, setSelectedVaxId] = useState(null);

  const { toasts, toast, removeToast } = useToast();

  const triggerRefresh = () => setRefreshKey(k => k + 1);
  const triggerVaxRefresh = () => setVaxRefreshKey(k => k + 1);

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
  }, [page, limit, query, refreshKey]);

  useEffect(() => {
    if (activeTab !== 'vaccination') return;
    let mounted = true;
    const load = async () => {
      setLoadingVax(true);
      setErrorVax('');
      try {
        const res = await apiFetch(`vaccination/vet?page=${vaxPage}&limit=${limit}`);
        if (!mounted) return;
        if (res.ok && res.data) {
          const rows = res.data.data ?? res.data;
          setVaxRecords(Array.isArray(rows) ? rows : []);
          setVaxTotal(res.data.count ?? res.data.total ?? 0);
        } else {
          setVaxRecords([]);
          setVaxTotal(0);
          setErrorVax('No vaccination records found');
        }
      } catch (err) {
        console.error('Failed to load vaccination records', err);
        if (mounted) setErrorVax('Failed to load vaccination records');
      } finally {
        if (mounted) setLoadingVax(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [activeTab, vaxPage, limit, vaxRefreshKey]);

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

      {/* Tab Switcher */}
      <div className="records-tabs">
        <button
          className={`records-tab${activeTab === 'medical' ? ' records-tab--active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          <FileText size={16} />
          Medical Records
        </button>
        <button
          className={`records-tab${activeTab === 'vaccination' ? ' records-tab--active' : ''}`}
          onClick={() => setActiveTab('vaccination')}
        >
          <Syringe size={16} />
          Vaccination Records
        </button>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        {activeTab === 'medical' && (
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
        )}
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
          New Vaccination
        </button>
      </div>

      {/* ── Medical Records Table ── */}
      {activeTab === 'medical' && (
        <>
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
                          <span className="status-badge status-active">
                            {record.status || 'Active'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button className="view-button" onClick={() => setSelectedRecordId(record._id)}>
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
          <div className="pagination-container">
            <p className="pagination-info">
              Showing {records.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
            </p>
            <div className="pagination-buttons">
              <button className="pagination-button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
              {Array.from({ length: Math.max(1, Math.ceil(total / limit)) }).slice(Math.max(0, page - 3), page + 2).map((_, idx) => {
                const pnum = idx + Math.max(1, page - 3);
                return (
                  <button key={pnum} className={`pagination-button ${pnum === page ? 'pagination-active' : ''}`} onClick={() => setPage(pnum)}>{pnum}</button>
                );
              })}
              <button className="pagination-button" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>Next</button>
            </div>
          </div>
        </>
      )}

      {/* ── Vaccination Records Table ── */}
      {activeTab === 'vaccination' && (
        <>
          <div className="table-container">
            <div className="table-wrapper">
              <table className="records-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-heading">Pet Name</th>
                    <th className="table-heading">Species</th>
                    <th className="table-heading">Vaccine</th>
                    <th className="table-heading">Dose</th>
                    <th className="table-heading">Administered</th>
                    <th className="table-heading">Next Due</th>
                    <th className="table-heading">Status</th>
                    <th className="table-heading">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {loadingVax ? (
                    <tr className="table-row"><td colSpan={8} className="table-cell">Loading...</td></tr>
                  ) : errorVax ? (
                    <tr className="table-row"><td colSpan={8} className="table-cell">{errorVax}</td></tr>
                  ) : vaxRecords.length === 0 ? (
                    <tr className="table-row"><td colSpan={8} className="table-cell">No vaccination records</td></tr>
                  ) : (
                    vaxRecords.map((vax) => (
                      <tr key={vax._id} className="table-row">
                        <td className="table-cell cell-primary">{vax.pet?.name || '—'}</td>
                        <td className="table-cell">{vax.pet?.species || '—'}</td>
                        <td className="table-cell">{vax.vaccineName || '—'}</td>
                        <td className="table-cell">{vax.dose || '—'}</td>
                        <td className="table-cell">
                          <div className="date-cell">
                            <Calendar className="date-icon" />
                            {vax.administeredDate ? new Date(vax.administeredDate).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="table-cell">
                          {vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${vaxStatusClass(vax.status)}`}>
                            {vax.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button className="view-button" onClick={() => setSelectedVaxId(vax._id)}>
                            <Syringe className="view-icon" />
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
          <div className="pagination-container">
            <p className="pagination-info">
              Showing {vaxRecords.length === 0 ? 0 : (vaxPage - 1) * limit + 1} to {Math.min(vaxPage * limit, vaxTotal)} of {vaxTotal} records
            </p>
            <div className="pagination-buttons">
              <button className="pagination-button" onClick={() => setVaxPage(p => Math.max(1, p - 1))} disabled={vaxPage <= 1}>Previous</button>
              {Array.from({ length: Math.max(1, Math.ceil(vaxTotal / limit)) }).slice(Math.max(0, vaxPage - 3), vaxPage + 2).map((_, idx) => {
                const pnum = idx + Math.max(1, vaxPage - 3);
                return (
                  <button key={pnum} className={`pagination-button ${pnum === vaxPage ? 'pagination-active' : ''}`} onClick={() => setVaxPage(pnum)}>{pnum}</button>
                );
              })}
              <button className="pagination-button" onClick={() => setVaxPage(p => p + 1)} disabled={vaxPage >= Math.ceil(vaxTotal / limit)}>Next</button>
            </div>
          </div>
        </>
      )}

      <NewRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={({ type, message }) => {
          toast[type]?.(message);
          if (type === 'success') triggerRefresh();
        }}
      />
      <VaccinationModal
        isOpen={isVaccinationModalOpen}
        onClose={() => setIsVaccinationModalOpen(false)}
        onSuccess={({ type, message }) => {
          toast[type]?.(message);
          if (type === 'success') triggerVaxRefresh();
        }}
      />
      <RecordDetailModal
        isOpen={!!selectedRecordId}
        recordId={selectedRecordId}
        onClose={() => setSelectedRecordId(null)}
      />
      <VaccinationDetailModal
        isOpen={!!selectedVaxId}
        vaccinationId={selectedVaxId}
        onClose={() => setSelectedVaxId(null)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function vaxStatusClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed':  return 'status-active';
    case 'upcoming':   return 'status-upcoming';
    case 'overdue':
    case 'missed':     return 'status-overdue';
    default:           return 'status-followup';
  }
}

export default MedicalRecords;