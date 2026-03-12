import { useNavigate } from 'react-router-dom';
import styles from './AD_Feedback.module.css';
import Sidebar from './Components/Sidebar/Sidebar';

const Admin_Feedback = ( { onLogout } ) => {
  // Feedback Data
  const feedbackData = [
    {
      id: 1,
      name: 'Arjun Mehta',
      quote: '"The KSRCE portal has been instrumental in keeping our batch connected. The networking events organized through the platform are truly world-class."',
      date: 'Oct 24',
    },
    {
      id: 2,
      name: 'Sana Williams',
      quote: '"I am thoroughly impressed by the mentorship initiatives. Giving back to my juniors at KSRCE has been a fulfilling experience facilitated by this portal."',
      date: 'Oct 22',
    },
    {
      id: 3,
      name: 'David Chen',
      quote: '"The job board and reference system provided here are exceptional. It\'s a professional ecosystem that adds immense value to our alumni community."',
      date: 'Oct 15',
    },
    {
      id: 4,
      name: 'Priya Sharma',
      quote: '"Attending the recent campus reunion reminded me of the strong foundation KSRCE provided. The portal made registration and coordination seamless."',
      date: 'Oct 12',
    },
    {
      id: 5,
      name: 'Michael Tan',
      quote: '"The technical workshops hosted via the alumni portal are top-tier. It\'s great to see a commitment to lifelong learning within our network."',
      date: 'Oct 10',
    },
    {
      id: 6,
      name: 'Anjali Rao',
      quote: '"The new infrastructure updates shared through the portal are amazing. Proud to be an alumnus of an institution that never stops evolving."',
      date: 'Oct 05',
    },
    {
      id: 7,
      name: 'Robert Brown',
      quote: '"Efficient, professional, and engaging. This portal is the gold standard for how alumni relations should be managed in the modern era."',
      date: 'Sep 28',
    },
    {
      id: 8,
      name: 'Emily White',
      quote: '"The scholarship donation process is transparent and easy to navigate. It\'s heartening to see our contributions making a real difference."',
      date: 'Sep 25',
    },
    {
      id: 9,
      name: 'Rajesh Kumar',
      quote: '"From sports meets to industry seminars, the variety of engagement is fantastic. KSRCE truly knows how to value its alumni."',
      date: 'Sep 20',
    },
  ];

  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} currentView="feedback" />


      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Header */}
        <header className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Alumni Feedback</h2>
          <div className={styles.titleDivider}></div>
        </header>

        {/* 3x3 Feedback Grid */}
        <div className={styles.feedbackGrid}>
          {feedbackData.map((feedback) => (
            <div key={feedback.id} className={styles.feedbackCard}>
              <div className={styles.cardBody}>
                <h3 className={styles.authorName}>{feedback.name}</h3>
                <p className={styles.feedbackQuote}>{feedback.quote}</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.dateBadge}>{feedback.date}</span>
                <button className={styles.viewBtn} onClick={() => { navigate('/admin/feedback_form') }} >
                  View <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default Admin_Feedback;