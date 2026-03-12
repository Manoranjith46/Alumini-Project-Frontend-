import { useNavigate } from 'react-router-dom';
import styles from './AD_Alumini.module.css';
import Sidebar from './Components/Sidebar/Sidebar';
import { Search, UserPlus, Eye } from 'lucide-react';


const Admin_Alumini = ( { onLogout } ) => {
    const navigate = useNavigate();

  // Table Data
  const alumniData = [
    { id: '01', name: 'Ashik', designation: 'Senior Product Designer', batch: '2018-2022', location: 'San Francisco', type: 'Product-based', typeClass: styles.badgeBlue },
    { id: '02', name: 'Shamyuktha', designation: 'Software Engineer', batch: '2019-2023', location: 'Bangalore', type: 'Startup', typeClass: styles.badgePurple },
    { id: '03', name: 'Pragathi', designation: 'Data Scientist', batch: '2020-2024', location: 'Hyderabad', type: 'Product-based', typeClass: styles.badgeBlue },
    { id: '04', name: 'Mirithula', designation: 'UX Designer', batch: '2018-2022', location: 'Chennai', type: 'Service-based', typeClass: styles.badgeGreen },
    { id: '05', name: 'Keerthika', designation: 'Frontend Developer', batch: '2021-2025', location: 'Pune', type: 'Startup', typeClass: styles.badgePurple },
    { id: '06', name: 'Yazhini', designation: 'DevOps Engineer', batch: '2017-2021', location: 'Coimbatore', type: 'Product-based', typeClass: styles.badgeBlue },
    { id: '07', name: 'Arun Kumar', designation: 'Systems Architect', batch: '2016-2020', location: 'Chennai', type: 'Product-based', typeClass: styles.badgeBlue },
    { id: '08', name: 'Deepika Raj', designation: 'Data Analyst', batch: '2021-2025', location: 'Bengaluru', type: 'Startup', typeClass: styles.badgePurple },
  ];

  return (
    <div className={styles.pageContainer}>
      
      {/* Sidebar */}
        <Sidebar onLogout={onLogout} currentView={'alumini'} />

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* Content Header */}
        <header className={styles.contentHeader}>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.pageTitle}>Alumni Directory</h1>
            <p className={styles.pageSubtitle}>Manage and track your institution's global alumni network.</p>
          </div>

          <div className={styles.metricsGrid}>
            
            {/* Advanced Search Engine */}
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <span className={styles.searchIcon}>
                  <Search size={20} />
                </span>
                <input 
                  type="text" 
                  className={styles.mainSearchInput} 
                  placeholder="Search alumni, jobs..." 
                />
              </div>
              <div className={styles.filterGridRow}>
                <input type="text" className={styles.filterInput} placeholder="Search by Designation" />
                <input type="text" className={styles.filterInput} placeholder="Search by Location" />
              </div>
              <div className={styles.filterGridRow}>
                <input type="text" className={styles.filterInput} placeholder="Search by Type" />
                <select className={styles.filterSelect}>
                  <option value="">Search by Batch</option>
                  <option>2023-2027</option>
                  <option>2022-2026</option>
                  <option>2021-2025</option>
                  <option>2020-2024</option>
                </select>
              </div>
            </div>

            {/* Total Alumni Metric */}
            <div className={styles.metricCard}>
              <p className={styles.metricLabel}>Total No. of Alumni</p>
              <h2 className={styles.metricValue}>5,000+</h2>
            </div>

            {/* Action Card */}
            <div className={styles.actionCard} onClick={() => { navigate('/admin/alumini_form') }} >
              <UserPlus size={32} className={styles.actionIcon} />
              <span className={styles.actionText}>+ Add Alumni</span>
            </div>

          </div>
        </header>

        {/* Main Table Area */}
        <section className={styles.tableSection}>
          <div className={styles.tableContainer}>
            
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Batch</th>
                    <th>Location</th>
                    <th className={styles.textCenter}>Type</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {alumniData.map((row, index) => (
                    <tr key={index}>
                      <td className={styles.textMuted}>{row.id}</td>
                      <td className={styles.fontSemibold}>{row.name}</td>
                      <td>{row.designation}</td>
                      <td className={styles.fontMono}>{row.batch}</td>
                      <td>{row.location}</td>
                      <td className={styles.textCenter}>
                        <span className={`${styles.badge} ${row.typeClass}`}>
                          {row.type}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionWrapper}>
                          <button className={styles.viewBtn} title="View Details">
                            <Eye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className={styles.paginationFooter}>
              <span className={styles.paginationText}>Showing 1 to 8 of 5,000+ entries</span>
              <div className={styles.paginationControls}>
                <button className={styles.pageBtn} disabled>Previous</button>
                <button className={styles.pageBtn}>Next</button>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
};

export default Admin_Alumini;