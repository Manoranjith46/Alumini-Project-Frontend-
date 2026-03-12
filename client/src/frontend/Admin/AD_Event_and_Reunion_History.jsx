import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AD_Event_and_Reunion_History.module.css';
import Sidebar from './Components/Sidebar/Sidebar';

const Admin_Event_and_Reunion_History = ( { onLogout } ) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;
  // Event cards data
  const eventsData = [
    {
      id: 1,
      title: 'Silver Jubilee Reunion',
      speaker: 'Dr. Sarah Mitchell, Chief Academic Officer',
      description: 'A grand celebration marking 25 years of excellence and shared memories at the main campus hall.'
    },
    {
      id: 2,
      title: 'Annual Alumni Meet',
      speaker: 'James Wilson, Senior Partner at Global Tech',
      description: 'Our signature yearly gathering to network, share success stories, and reconnect with faculty.'
    },
    {
      id: 3,
      title: 'Tech Symposium 2023',
      speaker: 'Elena Rodriguez, Lead AI Researcher',
      description: 'A deep dive into emerging technologies featuring keynote speeches from our industry-leading alumni.'
    },
    {
      id: 4,
      title: 'Global Networking Gala',
      speaker: 'David Chen, International Relations Director',
      description: 'An international evening of elegance connecting alumni across borders and industries worldwide.'
    },
    {
      id: 5,
      title: "Founder's Day Celebration",
      speaker: 'Prof. Arthur Sterling, Historian and Alumnus',
      description: 'Honoring the visionaries who built our institution with special awards and historical exhibits.'
    },
    {
      id: 6,
      title: 'Homecoming 2022',
      speaker: 'Marcus Thompson, Alumni Association President',
      description: 'Reliving the good old days with campus tours, sports matches, and an evening bonfire.'
    },
    {
      id: 7,
      title: 'Leadership Summit 2022',
      speaker: 'Michael Roberts, CEO of Visionary Corp',
      description: 'A gathering of industry leaders discussing the future of global leadership and innovation.'
    },
    {
      id: 8,
      title: 'Art & Design Expo',
      speaker: 'Sophia Loren, Creative Director at Studio A',
      description: 'Showcasing creative masterpieces and design breakthroughs from our talented alumni artists.'
    },
    {
      id: 9,
      title: 'Science & Research Forum',
      speaker: 'Dr. Alan Turing, Head of Research at BioLab',
      description: 'Exploring groundbreaking research and scientific discoveries presented by our alumni scholars.'
    },
    {
      id: 10,
      title: 'Silver Jubilee Reunion',
      speaker: 'Dr. Sarah Mitchell, Chief Academic Officer',
      description: 'A grand celebration marking 25 years of excellence and shared memories at the main campus hall.'
    },
    {
      id: 11,
      title: 'Annual Alumni Meet',
      speaker: 'James Wilson, Senior Partner at Global Tech',
      description: 'Our signature yearly gathering to network, share success stories, and reconnect with faculty.'
    },
    {
      id: 12,
      title: 'Tech Symposium 2023',
      speaker: 'Elena Rodriguez, Lead AI Researcher',
      description: 'A deep dive into emerging technologies featuring keynote speeches from our industry-leading alumni.'
    },
    {
      id: 13,
      title: 'Global Networking Gala',
      speaker: 'David Chen, International Relations Director',
      description: 'An international evening of elegance connecting alumni across borders and industries worldwide.'
    },
    {
      id: 14,
      title: "Founder's Day Celebration",
      speaker: 'Prof. Arthur Sterling, Historian and Alumnus',
      description: 'Honoring the visionaries who built our institution with special awards and historical exhibits.'
    },
    {
      id: 15,
      title: 'Homecoming 2022',
      speaker: 'Marcus Thompson, Alumni Association President',
      description: 'Reliving the good old days with campus tours, sports matches, and an evening bonfire.'
    },
    {
      id: 16,
      title: 'Leadership Summit 2022',
      speaker: 'Michael Roberts, CEO of Visionary Corp',
      description: 'A gathering of industry leaders discussing the future of global leadership and innovation.'
    },
    {
      id: 17,
      title: 'Art & Design Expo',
      speaker: 'Sophia Loren, Creative Director at Studio A',
      description: 'Showcasing creative masterpieces and design breakthroughs from our talented alumni artists.'
    },
    {
      id: 18,
      title: 'Science & Research Forum',
      speaker: 'Dr. Alan Turing, Head of Research at BioLab',
      description: 'Exploring groundbreaking research and scientific discoveries presented by our alumni scholars.'
    },
    {
      id: 19,
      title: 'Art & Design Expo',
      speaker: 'Sophia Loren, Creative Director at Studio A',
      description: 'Showcasing creative masterpieces and design breakthroughs from our talented alumni artists.'
    },
    {
      id: 20,
      title: 'Science & Research Forum',
      speaker: 'Dr. Alan Turing, Head of Research at BioLab',
      description: 'Exploring groundbreaking research and scientific discoveries presented by our alumni scholars.'
    }
  ];

  const totalPages = Math.ceil(eventsData.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const paginatedEvents = eventsData.slice(startIndex, startIndex + cardsPerPage);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxButtonsToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage < maxButtonsToShow - 1) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar Navigation */}
      <Sidebar onLogout={onLogout} currentView={'event_and_reunion_history'} />


      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.contentMaxWidth}>
          
          {/* Header Section */}
          <header className={styles.pageHeader}>
            <div className={styles.headerText}>
              <h2 className={styles.pageTitle}>Events & Reunion History</h2>
              <p className={styles.pageSubtitle}>
                Reflecting on our past gatherings, celebrations, and alumni milestones.
              </p>
            </div>
            <button className={styles.hostBtn} onClick={() => { navigate('/admin/event_and_reunion_form1') }} >
              <span className="material-symbols-outlined">add_circle</span>
              <span>Host New Event</span>
            </button>
          </header>

          {/* Event History Grid */}
          <section className={styles.eventsGrid}>
            {paginatedEvents.map((event) => (
              <article key={event.id} className={styles.eventCard}>
                <div className={styles.cardContent}>
                  <div className={styles.cardText}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <div className={styles.eventSpeaker}>{event.speaker}</div>
                    <p className={styles.eventDescription}>{event.description}</p>
                  </div>
                  <button className={styles.viewDetailsBtn} onClick={() => { navigate('/admin/event_and_reunion_invitation') }} >View Details</button>
                </div>
              </article>
            ))}
          </section>

          {/* Pagination */}
          <footer className={styles.pagination}>
            <button
              className={styles.pageArrowBtn}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`${styles.pageNumberBtn} ${currentPage === page ? styles.activePage : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageArrowBtn}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </footer>

        </div>
      </main>

    </div>
  );
};

export default Admin_Event_and_Reunion_History;