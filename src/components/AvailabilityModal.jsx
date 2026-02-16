import { useState, useEffect } from 'react';
import { X, Clock, Calendar, Zap, Info, Save } from 'lucide-react';
import '../assets/styles/availabilityModal.css';
import { apiFetch } from '../utils/api.js';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 0, name: 'Sunday' },
];

const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export function AvailabilityModal({ isOpen, onClose, onSave }) {
  const defaultAvailability = () => DAYS_OF_WEEK.map(d => ({
    dayOfWeek: d.id,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    isActive: false
  }));

  const [availability, setAvailability] = useState(defaultAvailability());
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('availability/');
        if (!mounted) return;
        if (res.ok && res.data && Array.isArray(res.data.availability)) {
          const server = res.data.availability;
          const byDay = {};
          server.forEach((a) => { byDay[a.dayOfWeek] = a; });
          setAvailability((prev) => prev.map((d) => {
            if (Object.prototype.hasOwnProperty.call(byDay, d.dayOfWeek)) {
              return {
                dayOfWeek: d.dayOfWeek,
                startTime: byDay[d.dayOfWeek].startTime,
                endTime: byDay[d.dayOfWeek].endTime,
                slotDuration: byDay[d.dayOfWeek].slotDuration,
                isActive: byDay[d.dayOfWeek].isActive
              };
            }
            return d;
          }));
        }
      } catch (e) {
        console.error('Failed to fetch availability', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAvailability();
    return () => { mounted = false; };
  }, [isOpen]);
  if (!isOpen) return null;

  const updateDay = (dayOfWeek, updates) => {
    setAvailability((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day))
    );
  };

  const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    let current = start;
    while (current < end) {
      slots.push(
        current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      current = new Date(current.getTime() + duration * 60000);
    }

    return slots;
  };

  const handleSave = () => {
    // Persist each day's availability to the backend
    (async () => {
      for (const day of availability) {
        try {
          const body = {
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
            slotDuration: day.slotDuration,
            isActive: !!day.isActive
          };
          await apiFetch('availability/', { method: 'POST', body });
        } catch (e) {
          console.error('Failed saving availability for day', day.dayOfWeek, e);
        }
      }
      if (onSave) onSave(availability);
      onClose();
    })();
  };

  return (
    <div className="availability-modal-overlay" onClick={onClose}>
      <div className="availability-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="availability-modal-header">
          <div className="availability-modal-header-content">
            <h2>Set Availability</h2>
            <p>Configure your weekly schedule and appointment slot durations</p>
          </div>
          <button className="availability-modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="availability-modal-content">
          {loading && <div className="availability-loading" style={{padding:16}}>Loading availability...</div>}
          {DAYS_OF_WEEK.map((day) => {
            const daySettings = availability.find((a) => a.dayOfWeek === day.id) || {
              dayOfWeek: day.id,
              startTime: '09:00',
              endTime: '17:00',
              slotDuration: 30,
              isActive: false,
            };

            return (
              <div
                key={day.id}
                className={`availability-day-card ${
                  daySettings.isActive ? 'active' : 'inactive'
                }`}
              >
                <div className="availability-day-header">
                  <div className="availability-day-title">
                    <Calendar size={20} />
                    <h3>{day.name}</h3>
                  </div>
                  <div className="availability-day-toggle">
                    <span className="availability-toggle-label">
                      {daySettings.isActive ? 'Available' : 'Closed'}
                    </span>
                    <label className="availability-toggle-switch">
                      <input
                        type="checkbox"
                        className="availability-toggle-input"
                        checked={daySettings.isActive}
                        onChange={(e) =>
                          updateDay(day.id, { isActive: e.target.checked })
                        }
                      />
                      <span className="availability-toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {daySettings.isActive && (
                  <>
                    <div className="availability-time-settings">
                      <div className="availability-form-group">
                        <label className="availability-form-label">
                          <Clock size={14} />
                          Start Time
                        </label>
                        <input
                          type="time"
                          className="availability-form-input"
                          value={daySettings.startTime}
                          onChange={(e) =>
                            updateDay(day.id, { startTime: e.target.value })
                          }
                        />
                      </div>

                      <div className="availability-form-group">
                        <label className="availability-form-label">
                          <Clock size={14} />
                          End Time
                        </label>
                        <input
                          type="time"
                          className="availability-form-input"
                          value={daySettings.endTime}
                          onChange={(e) =>
                            updateDay(day.id, { endTime: e.target.value })
                          }
                        />
                      </div>

                      <div className="availability-form-group">
                        <label className="availability-form-label">
                          <Zap size={14} />
                          Slot Duration
                        </label>
                        <select
                          className="availability-form-select"
                          value={daySettings.slotDuration}
                          onChange={(e) =>
                            updateDay(day.id, {
                              slotDuration: parseInt(e.target.value),
                            })
                          }
                        >
                          {SLOT_DURATIONS.map((duration) => (
                            <option key={duration} value={duration}>
                              {duration} minutes
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="availability-slots-preview">
                      <h4>
                        <Clock size={14} />
                        Available Time Slots ({generateTimeSlots(daySettings.startTime, daySettings.endTime, daySettings.slotDuration).length} slots)
                      </h4>
                      <div className="availability-slots-grid">
                        {generateTimeSlots(
                          daySettings.startTime,
                          daySettings.endTime,
                          daySettings.slotDuration
                        ).map((slot, index) => (
                          <div key={index} className="availability-slot-chip">
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="availability-modal-footer">
          <div className="availability-footer-info">
            <Info size={16} />
            Changes will apply to future appointments
          </div>
          <div className="availability-footer-actions">
            <button className="availability-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="availability-save-btn" onClick={handleSave}>
              <Save size={16} />
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
