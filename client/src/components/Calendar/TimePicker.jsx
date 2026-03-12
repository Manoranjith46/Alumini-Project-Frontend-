import React, { useState, useRef, useEffect } from 'react';
import styles from './TimePicker.module.css';

const TimePicker = ({ value, onChange, onClose, theme = 'admin' }) => {
  // Parse initial value (HH:MM format)
  const parseTime = (timeStr) => {
    if (!timeStr) {
      const now = new Date();
      return {
        hours: now.getHours(),
        minutes: now.getMinutes()
      };
    }
    const [h, m] = timeStr.split(':').map(Number);
    return { hours: h || 0, minutes: m || 0 };
  };

  const initialTime = parseTime(value);
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [activeColumn, setActiveColumn] = useState('hour'); // 'hour' or 'minute'
  
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  // Scroll to selected values on mount
  useEffect(() => {
    scrollToSelected(hourRef, hours);
    scrollToSelected(minuteRef, minutes);
  }, []);

  const scrollToSelected = (ref, value) => {
    if (ref.current) {
      const item = ref.current.querySelector(`[data-value="${value}"]`);
      if (item) {
        item.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
  };

  const handleHourClick = (h) => {
    setHours(h);
    setActiveColumn('minute');
    setTimeout(() => scrollToSelected(minuteRef, minutes), 50);
  };

  const handleMinuteClick = (m) => {
    setMinutes(m);
  };

  const handleApply = () => {
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const timeString = `${formattedHours}:${formattedMinutes}`;
    if (onChange) {
      onChange(timeString);
    }
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onClose) onClose();
  };

  const formatHour = (h) => {
    return String(h).padStart(2, '0');
  };

  const formatMinute = (m) => {
    return String(m).padStart(2, '0');
  };

  // Generate hours array (0-23)
  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes array (0-59)
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className={`${styles.timePickerContainer} ${styles[theme]}`}>
      {/* Header */}
      <div className={styles.timePickerHeader}>
        <div className={styles.viewTabs}>
          <button
            className={`${styles.viewTab} ${activeColumn === 'hour' ? styles.activeTab : ''}`}
            onClick={() => setActiveColumn('hour')}
          >
            Hour
          </button>
          <button
            className={`${styles.viewTab} ${activeColumn === 'minute' ? styles.activeTab : ''}`}
            onClick={() => setActiveColumn('minute')}
          >
            Minute
          </button>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Current Time Display */}
      <div className={styles.currentTimeDisplay}>
        <span className={`${styles.timeSegment} ${activeColumn === 'hour' ? styles.activeSegment : ''}`}>
          {formatHour(hours)}
        </span>
        <span className={styles.timeSeparator}>:</span>
        <span className={`${styles.timeSegment} ${activeColumn === 'minute' ? styles.activeSegment : ''}`}>
          {formatMinute(minutes)}
        </span>
      </div>

      {/* Time Selection Columns */}
      <div className={styles.timePickerBody}>
        {/* Hours Column */}
        <div 
          className={`${styles.timeColumn} ${activeColumn === 'hour' ? styles.activeColumn : ''}`}
          ref={hourRef}
          onClick={() => setActiveColumn('hour')}
        >
          <div className={styles.columnLabel}>Hour</div>
          <div className={styles.scrollContainer}>
            {hoursArray.map((h) => (
              <div
                key={h}
                data-value={h}
                className={`${styles.timeCell} ${hours === h ? styles.selected : ''}`}
                onClick={() => handleHourClick(h)}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>
        </div>

        {/* Minutes Column */}
        <div 
          className={`${styles.timeColumn} ${activeColumn === 'minute' ? styles.activeColumn : ''}`}
          ref={minuteRef}
          onClick={() => setActiveColumn('minute')}
        >
          <div className={styles.columnLabel}>Minute</div>
          <div className={styles.scrollContainer}>
            {minutesArray.map((m) => (
              <div
                key={m}
                data-value={m}
                className={`${styles.timeCell} ${minutes === m ? styles.selected : ''}`}
                onClick={() => handleMinuteClick(m)}
              >
                {formatMinute(m)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.timePickerFooter}>
        <button className={styles.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
        <button className={styles.applyButton} onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default TimePicker;
