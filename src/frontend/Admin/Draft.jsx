import styles from './Draft.module.css';
import Sidebar from './Components/Sidebar/Sidebar';

const Admin_Draft = ( {onLogout} ) => {
  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar onLogout={ onLogout } currentView={'mail'} />
      

      {/*  Main Content */}
      <main className={styles.mainContent} data-purpose="main-content-area">
        {/* Back Button */}
        <div className={styles.backButton} onClick={() => window.history.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </div>

        {/*  Email Content Card */}
        <article className={styles.draftDetailCard} data-purpose="draft-detail-card">
          
          {/* Card Header: Metadata */}
          <header className={styles.cardHeader}>
            <div className={styles.metaRow}>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Recipient:</span>
                <div className={styles.recipientBadge}>
                  <div className={styles.recipientAvatar}>
                    <svg className={styles.avatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <span className={styles.recipientName}>Dr. Arul Kumar</span>
                </div>
              </div>
              
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Last Saved:</span>
                <span className={styles.metaValue}>Oct 24, 2023, 10:45 AM</span>
              </div>
            </div>
            
            <div className={styles.subjectRow}>
              <span className={styles.metaLabel}>Subject:</span>
              <h2 className={styles.subjectTitle}>Guest Lecture Invitation - Dept of IT</h2>
            </div>
          </header>

          {/* Card Body: Message Content */}
          <section className={styles.cardBody} data-purpose="email-body-text">
            <p>Dear Dr. Arul,</p>
            
            <p className={styles.textLarge}>
              We would like to formally invite you to share your expertise with our current final year students regarding the emerging trends in AI and Machine Learning. 
            </p>
            
            <p>
              Your journey from KSRCE to your current role at Google is truly inspiring for our juniors. We believe that your insights would be invaluable in helping them understand the practical applications of these technologies and the career paths available in this rapidly evolving field.
            </p>
            
            <p>
              We are looking to host this session sometime next month. Could you please let us know your availability? We can facilitate this session either in person at our campus or via a virtual webinar, whichever is more convenient for you.
            </p>
            
            <p className={styles.signatureBlock}>
              Warm regards,<br/>
              <span className={styles.signatureName}>The KSRCE Alumni Coordination Team</span>
            </p>
          </section>

          {/* Card Footer: Send Action */}
          <footer className={styles.cardFooter}>
            <button className={styles.sendBtn} data-purpose="send-draft-action">
              <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              Send Now
            </button>
          </footer>

        </article>
        {/* END: Email Content Card */}

      </main>
      {/* END: Main Content */}
      
    </div>
  );
};

export default Admin_Draft;