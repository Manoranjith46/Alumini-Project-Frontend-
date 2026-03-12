import React, { useState, useRef, useEffect, useCallback } from 'react';
import TimePicker from './TimePicker';
import styles from './TimeInput.module.css';

const TimeInput = ({ 
  value, 
  onChange, 
  theme = 'admin', 
  className = '',
  id,
  name,
  placeholder = 'Select time',
  defaultToNow = false,
  ...props 
}) => {
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  
  // Get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };
  
  const [inputValue, setInputValue] = useState(() => {
    if (value) return value;
    return defaultToNow ? getCurrentTime() : '';
  });
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value || (defaultToNow ? getCurrentTime() : ''));
    }
  }, [value, defaultToNow]);

  const calculatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pickerWidth = 280;
      const pickerHeight = 420;
      const margin = 20;

      let top = rect.bottom + 8;
      let left = rect.left;

      // Check if picker would overflow right edge
      if (left + pickerWidth > window.innerWidth - margin) {
        left = window.innerWidth - pickerWidth - margin;
      }

      // Check if picker would overflow left edge
      if (left < margin) {
        left = margin;
      }

      // Check if picker would overflow bottom edge
      if (top + pickerHeight > window.innerHeight - margin) {
        // Position above input instead
        top = rect.top - pickerHeight - 8;
        
        // If still doesn't fit, position at top of viewport
        if (top < margin) {
          top = margin;
        }
      }

      setPickerPosition({ top, left });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsTimePickerOpen(false);
      }
    };

    const handleResize = () => {
      if (isTimePickerOpen) {
        calculatePosition();
      }
    };

    if (isTimePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isTimePickerOpen, calculatePosition]);

  const handleInputClick = () => {
    calculatePosition();
    setIsTimePickerOpen(true);
  };

  const handleTimeChange = (time) => {
    setInputValue(time);
    if (onChange) {
      onChange({ target: { name, value: time } });
    }
    setIsTimePickerOpen(false);
  };

  const formatDisplayTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return (
    <div className={styles.timeInputContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          id={id}
          name={name}
          value={formatDisplayTime(inputValue)}
          onClick={handleInputClick}
          readOnly
          placeholder={placeholder}
          className={`${className} ${styles.timeInputField}`}
          {...props}
        />
        <span 
          className={`material-symbols-outlined ${styles.clockIcon}`}
          onClick={handleInputClick}
        >
          schedule
        </span>
      </div>
      {isTimePickerOpen && (
        <div style={{ position: 'fixed', top: `${pickerPosition.top}px`, left: `${pickerPosition.left}px`, zIndex: 9999 }}>
          <TimePicker
            value={inputValue}
            onChange={handleTimeChange}
            onClose={() => setIsTimePickerOpen(false)}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};

export default TimeInput;
