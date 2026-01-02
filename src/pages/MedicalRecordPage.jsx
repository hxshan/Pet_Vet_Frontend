import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Calendar } from 'lucide-react';
import '../assets/styles/medicalRecords.css';
import NewRecordModal from '../components/NewRecordModal';

function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState('');

   const [isModalOpen, setIsModalOpen] = useState(false);

  const records = [
    {
      id: 1,
      patientName: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      owner: 'John Smith',
      lastVisit: '2025-12-28',
      status: 'Active',
    },
    {
      id: 2,
      patientName: 'Luna',
      species: 'Cat',
      breed: 'Persian',
      owner: 'Emily Davis',
      lastVisit: '2025-12-25',
      status: 'Active',
    },
    {
      id: 3,
      patientName: 'Charlie',
      species: 'Dog',
      breed: 'Beagle',
      owner: 'Michael Brown',
      lastVisit: '2025-12-20',
      status: 'Follow-up Required',
    },
    {
      id: 4,
      patientName: 'Bella',
      species: 'Dog',
      breed: 'Labrador',
      owner: 'Sarah Wilson',
      lastVisit: '2025-12-15',
      status: 'Active',
    },
    {
      id: 5,
      patientName: 'Whiskers',
      species: 'Cat',
      breed: 'Maine Coon',
      owner: 'David Martinez',
      lastVisit: '2025-12-10',
      status: 'Active',
    },
  ];

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
              {records.map((record) => (
                <tr key={record.id} className="table-row">
                  <td className="table-cell cell-primary">{record.patientName}</td>
                  <td className="table-cell">{record.species}</td>
                  <td className="table-cell">{record.breed}</td>
                  <td className="table-cell">{record.owner}</td>
                  <td className="table-cell">
                    <div className="date-cell">
                      <Calendar className="date-icon" />
                      {record.lastVisit}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${record.status === 'Active' ? 'status-active' : 'status-followup'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button className="view-button">
                      <FileText className="view-icon" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <p className="pagination-info">Showing 1 to 5 of 248 records</p>
        <div className="pagination-buttons">
          <button className="pagination-button">Previous</button>
          <button className="pagination-button pagination-active">1</button>
          <button className="pagination-button">2</button>
          <button className="pagination-button">3</button>
          <button className="pagination-button">Next</button>
        </div>
      </div>
      <NewRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default MedicalRecords;