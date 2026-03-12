import Sidebar from './Components/Sidebar/Sidebar';
import styles from './AD_Event_and_Reunion_Form1.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Admin_Event_and_Reunion_Form1 = ( { onLogout } ) => {

  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [alumniName, setAlumniName] = useState('');
  const [errors, setErrors] = useState({});

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!alumniName.trim()) newErrors.alumniName = 'Alumni name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    navigate('/admin/event_and_reunion_form2', {
      state: { eventName: eventName.trim(), alumniName: alumniName.trim() }
    });
  };





  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} currentView={'event_and_reunion_history'} />

      {/* Main Content */}
      <main className={styles.mainContent}>
          {/* Back Button */}
          <div className={styles.backButton} onClick={() => navigate('/admin/event_and_reunion_history') }>
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
          </div>
        
        {/* Header */}
        <header className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Invitation Creator</h2>
            <p className={styles.pageSubtitle}>Design and issue professional event invitations for alumni.</p>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.notificationBtn}>
              <span className="material-symbols-outlined">notifications</span>
              <span className={styles.notificationDot}></span>
            </button>
            <button className={styles.profileBtn}>
              <div className={styles.profileAvatar}>
                <span className="material-symbols-outlined">person</span>
              </div>
            </button>
          </div>
        </header>

        {/* Form Container */}
        <div className={styles.contentWrapper}>
          <div className={styles.formCard}>
            
            {/* Form Header */}
            <div className={styles.formHeader}>
              <div className={styles.formIconWrapper}>
                <span className="material-symbols-outlined">mail</span>
              </div>
              <h3 className={styles.formTitle}>Create New Invitation</h3>
              <p className={styles.formSubtitle}>Fill in the event and alumni details to generate a customized invitation.</p>
            </div>

            {/* Form */}
            <form className={styles.form} onSubmit={handleFormSubmit}>
              
              <div className={styles.inputGroup}>
                <label htmlFor="event-name" className={styles.formLabel}>Event Name</label>
                <input 
                  id="event-name" 
                  name="event-name" 
                  placeholder="e.g. Annual Networking Gala" 
                  className={`${styles.formInput} ${errors.eventName ? styles.inputError : ''}`}
                  value={eventName}
                  onChange={(e) => { setEventName(e.target.value); setErrors(prev => ({ ...prev, eventName: '' })); }}
                />
                {errors.eventName && <span className={styles.errorText}>{errors.eventName}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="alumni-name" className={styles.formLabel}>Alumni Name</label>
                <input 
                  type="text" 
                  id="alumni-name" 
                  name="alumni-name" 
                  placeholder="e.g. John Doe" 
                  className={`${styles.formInput} ${errors.alumniName ? styles.inputError : ''}`}
                  value={alumniName}
                  onChange={(e) => { setAlumniName(e.target.value); setErrors(prev => ({ ...prev, alumniName: '' })); }}
                />
                {errors.alumniName && <span className={styles.errorText}>{errors.alumniName}</span>}
              </div>

              <div className={styles.submitWrapper}>
                <button type="submit" className={styles.submitBtn}>
                  Create Invitation
                </button>
              </div>

            </form>

          </div>
        </div>

      </main>
    </div>
  );
};

export default Admin_Event_and_Reunion_Form1;