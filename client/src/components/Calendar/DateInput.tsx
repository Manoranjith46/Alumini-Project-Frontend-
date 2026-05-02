import React, { useState, useRef, useEffect, useCallback, InputHTMLAttributes } from 'react';
import Calendar from './Calendar';
import styles from './DateInput.module.css';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  theme?: string;
  className?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultToToday?: boolean;
  yearRange?: string;
}

const DateInput = ({
  value,
  onChange,
  theme = 'admin',
  className = '',
  id,
  name,
  placeholder = 'Select date',
  defaultToToday = false,
  yearRange = 'default',
  ...props
}: DateInputProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [inputValue, setInputValue] = useState(() => {
    if (value) return value;
    return defaultToToday ? getTodayDate() : '';
  });
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value || (defaultToToday ? getTodayDate() : ''));
    }
  }, [value, defaultToToday]);

  const calculatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const calendarWidth = 360;
      const calendarHeight = 360;
      const margin = 20;

      let top = rect.bottom + 8;
      let left = rect.left;

      // Check if calendar would overflow right edge
      if (left + calendarWidth > window.innerWidth - margin) {
        left = window.innerWidth - calendarWidth - margin;
      }

      // Check if calendar would overflow left edge
      if (left < margin) {
        left = margin;
      }

      // Check if calendar would overflow bottom edge
      if (top + calendarHeight > window.innerHeight - margin) {
        // Position above input instead
        top = rect.top - calendarHeight - 8;
        
        // If still doesn't fit, position at top of viewport
        if (top < margin) {
          top = margin;
        }
      }

      setCalendarPosition({ top, left });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    const handleResize = () => {
      if (isCalendarOpen) {
        calculatePosition();
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isCalendarOpen, calculatePosition]);

  const handleInputClick = () => {
    calculatePosition();
    setIsCalendarOpen(true);
  };

  const handleCalendarChange = (date: string) => {
    setInputValue(date);
    if (onChange) {
      onChange({ target: { name, value: date } } as any);
    }
    setIsCalendarOpen(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') return '';
    // Parse date string as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const yearNum = date.getFullYear();
    return `${dayNum} ${monthName} ${yearNum}`;
  };

  return (
    <div className={styles.dateInputContainer} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          id={id}
          name={name}
          value={formatDisplayDate(inputValue)}
          onClick={handleInputClick}
          readOnly
          placeholder={placeholder}
          className={`${className} ${styles.dateInputField}`}
          {...props}
        />
        <span 
          className={`material-symbols-outlined ${styles.calendarIcon}`}
          onClick={handleInputClick}
        >
          calendar_today
        </span>
      </div>
      {isCalendarOpen && (
        <div style={{ position: 'fixed', top: `${calendarPosition.top}px`, left: `${calendarPosition.left}px`, zIndex: 9999 }}>
          <Calendar
            value={inputValue}
            onChange={handleCalendarChange}
            onClose={() => setIsCalendarOpen(false)}
            theme={theme}
            yearRange={yearRange}
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
