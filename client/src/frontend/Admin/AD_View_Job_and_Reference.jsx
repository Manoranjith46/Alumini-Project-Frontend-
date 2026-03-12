import styles from './AD_View_Job_and_Reference.module.css';
import Sidebar from './Components/Sidebar/Sidebar';

const Admin_View_Job_and_Reference = ( { onLogout } ) => {
  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} currentView={'job_and_reference'} />


      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          
          {/* Logged in User Badge */}
          <div className={styles.userBadgeContainer}>
            <p className={styles.userBadge}>
              Logged in as: <span>alumni.name@example.com</span>
            </p>
          </div>

          {/* Form Card */}
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Job Reference Submission Form</h2>
              <p className={styles.formSubtitle}>Help your fellow alumni by sharing career opportunities</p>
            </div>

            <form className={styles.form}>
              <div className={styles.formGrid}>
                {/* Company Name */}
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>Company Name</label>
                  <input 
                    className={styles.formInput} 
                    placeholder="e.g. Google" 
                    type="text" 
                  />
                </div>

                {/* Role / Position */}
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>Role / Position</label>
                  <input 
                    className={styles.formInput} 
                    placeholder="e.g. Senior Developer" 
                    type="text" 
                  />
                </div>

                {/* Target Branch */}
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>Target Branch / Department</label>
                  <select className={styles.formSelect}>
                    <option value="">Select Branch</option>
                    <option value="cse">Computer Science Engineering</option>
                    <option value="it">Information Technology</option>
                    <option value="ece">Electronics & Communication</option>
                    <option value="eee">Electrical & Electronics</option>
                    <option value="mech">Mechanical Engineering</option>
                    <option value="civil">Civil Engineering</option>
                  </select>
                </div>

                {/* Number of Vacancies */}
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>Number of Vacancies</label>
                  <input 
                    className={styles.formInput} 
                    placeholder="e.g. 5" 
                    type="number" 
                  />
                </div>

                {/* Job Location */}
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>Job Location</label>
                  <input 
                    className={styles.formInput} 
                    placeholder="e.g. Bangalore, India" 
                    type="text" 
                  />
                </div>

                {/* Mode of Work */}
                <div className={styles.inputGroup}>
                  <label className={styles.formLabel}>Mode of Work</label>
                  <select className={styles.formSelect}>
                    <option value="">Select Mode</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.formActions}>
                <button className={styles.submitBtn} type="button" onClick={() => window.history.back()} >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Back
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </main>

    </div>
  );
};

export default Admin_View_Job_and_Reference;