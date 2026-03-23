import { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  MapPin
} from 'lucide-react';
import styles from './AD_View_Faculty.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Components/Sidebar/Sidebar';
import { useAuth } from '../../context/authContext/authContext';

const API_BASE = import.meta.env.VITE_API_URL;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Admin_View_Faculty = ({ onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user?.token) {
        setError('Please login to view faculty details');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/faculty/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch faculty details');
        }

        const data = await response.json();

        if (data.success && data.faculty) {
          setFacultyData(data.faculty);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFaculty();
    }
  }, [id, user]);

  const handleBack = () => {
    navigate('/admin/department');
  };

  const handleEdit = () => {
    navigate(`/admin/department/edit_faculty/${id}`);
  };

  if (loading) {
    return (
      <div className={styles.dashboardWrapper}>
        <Sidebar currentView={'department'} onLogout={onLogout} />
        <main className={styles.mainContent}>
          <div className={styles.dashboardContent}>
            <p>Loading faculty details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardWrapper}>
        <Sidebar currentView={'department'} onLogout={onLogout} />
        <main className={styles.mainContent}>
          <div className={styles.dashboardContent}>
            <p className={styles.error}>{error}</p>
            <button className={styles.backBtn} onClick={handleBack}>
              <ArrowLeft size={16} /> Back to Department
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className={styles.dashboardWrapper}>
        <Sidebar currentView={'department'} onLogout={onLogout} />
        <main className={styles.mainContent}>
          <div className={styles.dashboardContent}>
            <p>Faculty not found</p>
            <button className={styles.backBtn} onClick={handleBack}>
              <ArrowLeft size={16} /> Back to Department
            </button>
          </div>
        </main>
      </div>
    );
  }

  const profileInitial = facultyData.name.replace('Dr. ', '').trim().charAt(0).toUpperCase();

  return (
    <div className={styles.dashboardWrapper}>
      <Sidebar currentView={'department'} onLogout={onLogout}  />
      {/* Main Content Area */}
      <main className={styles.mainContent}>

        {/* Dashboard Content Area */}
        <div className={styles.dashboardContent}>

          {/* Breadcrumb & Actions */}
          <div className={styles.pageHeader}>
            <div>
              <button className={styles.backBtn} onClick={handleBack}>
                <ArrowLeft size={16} /> Back to Department
              </button>
              <h1 className={styles.pageTitle}>Faculty Profile</h1>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.editBtn} onClick={handleEdit}>
                <Edit size={18} /> Edit Profile
              </button>
              <button className={styles.deleteBtn}>
                <Trash2 size={18} /> Deactivate
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className={styles.profileWrapper}>

            {/* Top Profile Header */}
            <div className={styles.profileHeaderCard}>
              <div className={styles.profileAvatarLarge}>
                <span>{profileInitial}</span>
              </div>
              <div className={styles.profileIntro}>
                <div className={styles.introTop}>
                  <h2>{facultyData.name}</h2>
                  <span className={styles.badgeActive}>{facultyData.status}</span>
                </div>
                <p className={styles.designation}>{facultyData.designation}</p>
                <p className={styles.department}>{facultyData.department}</p>

                <div className={styles.quickContact}>
                  <div className={styles.contactItem}>
                    <Mail size={16} /> <span>{facultyData.email}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <Phone size={16} /> <span>{facultyData.phone || 'N/A'}</span>
                  </div>
                  <div className={styles.contactItem}>
                    <MapPin size={16} /> <span>{facultyData.location || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className={styles.infoGridLayout}>
              {/* Personal Information */}
              <div className={`${styles.infoCard} ${styles.fullSection}`}>
                <div className={styles.cardHeader}>
                  <Users size={20} className={styles.cardIcon} />
                  <h3>Personal Information</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Staff ID</span>
                    <span className={styles.infoValue}>{facultyData.staffId}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Date of Birth</span>
                    <span className={styles.infoValue}>{formatDate(facultyData.personalInfo?.dob)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Gender</span>
                    <span className={styles.infoValue}>{facultyData.personalInfo?.gender || 'N/A'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Blood Group</span>
                    <span className={styles.infoValue}>{facultyData.personalInfo?.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Date of Joining</span>
                    <span className={styles.infoValue}>{formatDate(facultyData.joinDate)}</span>
                  </div>
                  <div className={`${styles.infoRow} ${styles.fullWidth}`}>
                    <span className={styles.infoLabel}>Residential Address</span>
                    <span className={styles.infoValue}>{facultyData.personalInfo?.address || 'N/A'}</span>
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

export default Admin_View_Faculty;
