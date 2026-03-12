import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AD_Job_and_Reference.module.css';
import Sidebar from './Components/Sidebar/Sidebar';

const Admin_Job_and_Reference = ( { onLogout } ) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;

    // Mock data for the job cards
  const jobsData = [
    { id: 1, company: 'TechCorp Solutions', role: 'Software Engineer L3', imgId: '1' },
    { id: 2, company: 'Global Systems', role: 'Azure Solutions Architect', imgId: '2' },
    { id: 3, company: 'Data Dynamics', role: 'Full Stack Developer', imgId: '3' },
    { id: 4, company: 'Creative Cloud', role: 'UI/UX Designer', imgId: '4' },
    { id: 5, company: 'Prime Logistics', role: 'Data Scientist', imgId: '5' },
    { id: 6, company: 'Innova Hub', role: 'Hardware Engineer', imgId: '6' },
    { id: 7, company: 'TechCorp Solutions', role: 'Software Engineer L3', imgId: '1' },
    { id: 8, company: 'Global Systems', role: 'Azure Solutions Architect', imgId: '2' },
    { id: 9, company: 'Data Dynamics', role: 'Full Stack Developer', imgId: '3' },
    { id: 10, company: 'Creative Cloud', role: 'UI/UX Designer', imgId: '4' },
    { id: 11, company: 'Prime Logistics', role: 'Data Scientist', imgId: '5' },
    { id: 12, company: 'Innova Hub', role: 'Hardware Engineer', imgId: '6' },
    { id: 13, company: 'TechCorp Solutions', role: 'Software Engineer L3', imgId: '1' },
    { id: 14, company: 'Global Systems', role: 'Azure Solutions Architect', imgId: '2' },
    { id: 15, company: 'Data Dynamics', role: 'Full Stack Developer', imgId: '3' },
    { id: 16, company: 'Creative Cloud', role: 'UI/UX Designer', imgId: '4' },
    { id: 17, company: 'Prime Logistics', role: 'Data Scientist', imgId: '5' },
    { id: 18, company: 'Innova Hub', role: 'Hardware Engineer', imgId: '6' },
    { id: 19, company: 'Data Dynamics', role: 'Full Stack Developer', imgId: '3' },
    { id: 20, company: 'Creative Cloud', role: 'UI/UX Designer', imgId: '4' },
    { id: 21, company: 'Prime Logistics', role: 'Data Scientist', imgId: '5' },
    { id: 22, company: 'Innova Hub', role: 'Hardware Engineer', imgId: '6' },
  ];

  const totalPages = Math.ceil(jobsData.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const paginatedJobs = jobsData.slice(startIndex, startIndex + cardsPerPage);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display (showing max 3 page buttons)
  const getPageNumbers = () => {
    const pages = [];
    const maxButtonsToShow = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    
    if (endPage - startPage < maxButtonsToShow - 1) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.pageLayout}>
      
      {/* Sidebar */}
      <Sidebar onLogout={onLogout} currentView={'job_and_reference'} />

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Top Header */}
        <header className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Job & Reference</h2>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchWrapper}>
              <span className="material-symbols-outlined">search</span>
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search..." 
              />
            </div>
            <button className={styles.refreshBtn}>
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </header>

        {/* Sub Header & Actions */}
        <div className={styles.subHeader}>
          <div>
            <h3 className={styles.subTitle}>Available Opportunities</h3>
            <p className={styles.subDescription}>Explore job openings shared by our alumni network.</p>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className={styles.jobsGrid}>
          {paginatedJobs.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.companyLogoWrapper}>
                <img  
                  alt="Company Logo" 
                  className={styles.companyLogo}
                  onError={(e) => { e.target.src = `https://via.placeholder.com/100?text=C${job.imgId}` }}
                />
              </div>
              <h4 className={styles.companyName}>{job.company}</h4>
              <p className={styles.jobRole}>{job.role}</p>
              <button className={styles.viewDetailsBtn} onClick={() => { navigate('/admin/view_job_and_reference') }} >View Details</button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className={styles.paginationWrapper}>
          <nav className={styles.paginationNav}>
            <button 
              className={styles.pageBtn}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {getPageNumbers().map((page) => (
              <button 
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.activePageBtn : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className={styles.pageBtn}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        </div>

      </main>
    </div>
  );
};

export default Admin_Job_and_Reference;