import styles from './AD_View_Donation.module.css';
import Sidebar from './Components/Sidebar/Sidebar';

const Admin_View_Donation = ( { onLogout } ) => {

  // Transaction Data
  const transactionData = {
    donorName: 'Priya Varma',
    cause: 'Alumni Scholarship Fund',
    paymentType: 'UPI',
    paymentIcon: 'account_balance_wallet',
    transactionId: '#TRXN-98234102',
    amount: '₹250.00',
    date: 'Oct 24, 2023',
    status: 'Successful'
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} currentView={'donation_history'} />

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Back Button */}
        <div className={styles.backButton} onClick={() => window.history.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </div>

        {/* Page Content */}
        <div className={styles.contentWrapper}>
          {/* Header & Back Button */}
          <div className={styles.pageHeader}>
            <h2 className={styles.pageTitle}>Donation Transaction Details</h2>
          </div>

          {/* Receipt Card Wrapper */}
          <div className={styles.receiptWrapper}>
            <div className={styles.receiptCard}>
              
              {/* Top Color Bar */}
              <div className={styles.cardTopBar}></div>
              
              <div className={styles.cardBody}>
                {/* Receipt Header */}
                <div className={styles.receiptHeader}>
                  <div>
                    <h3 className={styles.receiptTitle}>Transaction Receipt</h3>
                    <p className={styles.receiptSubtitle}>Official record for your donation contribution</p>
                  </div>
                  <div className={styles.statusWrapper}>
                    <span className={styles.statusPill}>{transactionData.status}</span>
                  </div>
                </div>

                {/* Receipt Details Grid */}
                <div className={styles.detailsGrid}>
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>Donor Name</label>
                    <p className={styles.detailValue}>{transactionData.donorName}</p>
                  </div>
                  
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>Cause</label>
                    <p className={styles.detailValue}>{transactionData.cause}</p>
                  </div>
                  
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>Payment Type</label>
                    <div className={styles.paymentTypeWrapper}>
                      <span className={`material-symbols-outlined ${styles.paymentIcon}`}>
                        {transactionData.paymentIcon}
                      </span>
                      <p className={styles.detailValue}>{transactionData.paymentType}</p>
                    </div>
                  </div>
                  
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>Transaction ID</label>
                    <p className={styles.detailValueMono}>{transactionData.transactionId}</p>
                  </div>
                  
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>Amount</label>
                    <p className={styles.detailValueLarge}>{transactionData.amount}</p>
                  </div>
                  
                  <div className={styles.detailGroup}>
                    <label className={styles.detailLabel}>Transaction Date</label>
                    <p className={styles.detailValue}>{transactionData.date}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className={styles.divider}></div>

                {/* Card Footer (System Note & Actions) */}
                <div className={styles.cardFooter}>
                  <div className={styles.systemNote}>
                    <div className={styles.verifiedIcon}>
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                    <p>
                      This is a system-generated document. <br/>
                      K.S.R College of Engineering Alumni Portal.
                    </p>
                  </div>
                  
                  <div className={styles.actionButtons}>
                    <button className={styles.iconBtn} aria-label="Print">
                      <span className="material-symbols-outlined">print</span>
                    </button>
                    <button className={styles.iconBtn} aria-label="Share">
                      <span className="material-symbols-outlined">share</span>
                    </button>
                    <button className={styles.iconBtn} aria-label="Download">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin_View_Donation;