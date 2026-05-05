import { useCallback, useEffect, useState, FC } from 'react';
import { User, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import styles from './Co_Profile.module.css';
import Sidebar from './Components/Sidebar/Sidebar';
import { useAuth } from '../../context/authContext/authContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface PersonalInfo {
  dob: string;
  gender: string;
  bloodGroup: string;
  address: string;
}

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  staffId: string;
  designation: string;
  department: string;
  role: string;
  location: string;
  status: string;
  joinDate: string;
  experience: string | number;
  publications: number;
  patents: number;
  personalInfo: PersonalInfo;
  education: Education[];
}

const emptyEducationRow: Education = { degree: '', institution: '', year: '' };

const mapProfileFromApi = (profile: any): ProfileState => ({
  name: profile?.name || '',
  email: profile?.email || '',
  phone: profile?.phone || '',
  staffId: profile?.staffId || '',
  designation: profile?.designation || '',
  department: profile?.department || '',
  role: profile?.role || (Array.isArray(profile?.roles) ? profile.roles[0] : 'coordinator'),
  location: profile?.location || '',
  status: profile?.status || 'Active',
  joinDate: profile?.joinDate ? new Date(profile.joinDate).toISOString().split('T')[0] : '',
  experience: profile?.experience || '',
  publications: profile?.publications ?? 0,
  patents: profile?.patents ?? 0,
  personalInfo: {
    dob: profile?.personalInfo?.dob ? new Date(profile.personalInfo.dob).toISOString().split('T')[0] : '',
    gender: profile?.personalInfo?.gender || '',
    bloodGroup: profile?.personalInfo?.bloodGroup || '',
    address: profile?.personalInfo?.address || '',
  },
  education:
    Array.isArray(profile?.education) && profile.education.length > 0
      ? profile.education.map((row: any) => ({
          degree: row?.degree || '',
          institution: row?.institution || '',
          year: row?.year || '',
        }))
      : [emptyEducationRow],
});

const initialProfileState = mapProfileFromApi(null);

interface CoordinatorProfileProps {
  onLogout: () => void;
}

const CoordinatorProfile: FC<CoordinatorProfileProps> = ({ onLogout }) => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileState>(initialProfileState);
  const [originalProfile, setOriginalProfile] = useState<ProfileState>(initialProfileState);

  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [showUpdatePassword, setShowUpdatePassword] = useState<boolean>(false);
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
    resetNew: false,
    resetConfirm: false,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [resetData, setResetData] = useState({
    mobile: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetStep, setResetStep] = useState<string>('none');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  const messageTimerRef = { current: null as ReturnType<typeof setTimeout> | null };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchProfile = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/coordinators/profile/me`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        signal,
      });

      const data = await response.json();

      if (data.success && data.data) {
        const mapped = mapProfileFromApi(data.data);
        setProfileData(mapped);
        setOriginalProfile(mapped);
        setResetData((prev) => ({ ...prev, mobile: mapped.phone || '' }));
      } else if (data.success && !data.data) {
        showMessage('error', 'Coordinator profile not found. Please contact admin.');
      } else {
        showMessage('error', data.message || 'Failed to load profile');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching coordinator profile:', error);
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    const controller = new AbortController();

    if (user?.token) {
      fetchProfile(controller.signal);
    } else {
      setLoading(false);
    }

    return () => controller.abort();
  }, [user?.token, fetchProfile]);

  const handleProfileChange = (field: string, value: string | number) => {
    if (field.startsWith('personalInfo.')) {
      const child = field.split('.')[1];
      setProfileData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [child]: value,
        },
      }));
      return;
    }

    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setProfileData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const addEducationRow = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, { ...emptyEducationRow }],
    }));
  };

  const removeEducationRow = (index: number) => {
    setProfileData((prev) => {
      if (prev.education.length <= 1) return prev;
      return {
        ...prev,
        education: prev.education.filter((_, i) => i !== index),
      };
    });
  };

  const validateProfile = () => {
    if (!profileData.name.trim()) return 'Name is required';
    if (!profileData.email.trim()) return 'Email is required';
    if (!profileData.staffId.trim()) return 'Staff ID is required';
    if (!profileData.designation.trim()) return 'Designation is required';
    if (!profileData.department.trim()) return 'Department is required';
    if (!profileData.joinDate) return 'Join Date is required';
    return null;
  };

  const handleSaveProfile = async () => {
    const validationError = validateProfile();
    if (validationError) {
      showMessage('error', validationError);
      return;
    }

    try {
      setSavingProfile(true);

      const payload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        staffId: profileData.staffId,
        designation: profileData.designation,
        department: profileData.department,
        role: profileData.role,
        location: profileData.location,
        status: profileData.status,
        joinDate: profileData.joinDate,
        experience: profileData.experience,
        publications: Number(profileData.publications) || 0,
        patents: Number(profileData.patents) || 0,
        personalInfo: {
          ...profileData.personalInfo,
          dob: profileData.personalInfo.dob || undefined,
        },
        education: profileData.education,
      };

      const response = await fetch(`${API_BASE_URL}/api/coordinators/profile/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const mapped = mapProfileFromApi(data.data);
        setProfileData(mapped);
        setOriginalProfile(mapped);
        setIsEditing(false);
        showMessage('success', 'Profile updated successfully');
      } else {
        showMessage('error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving coordinator profile:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDiscard = () => {
    setProfileData(originalProfile);
    setIsEditing(false);
    showMessage('success', 'Changes discarded');
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coordinators/profile/password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Password updated successfully');
        setShowUpdatePassword(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showMessage('error', data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating coordinator password:', error);
      showMessage('error', 'Failed to update password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!resetData.mobile.trim()) {
      showMessage('error', 'Mobile number is required');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coordinators/profile/send-otp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile: resetData.mobile }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'OTP sent successfully');
        setOtpSent(true);
        setResetStep('otp');
      } else {
        showMessage('error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showMessage('error', 'Failed to send OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!resetData.otp.trim()) {
      showMessage('error', 'OTP is required');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coordinators/profile/verify-otp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: resetData.otp }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'OTP verified successfully');
        setOtpVerified(true);
        setResetStep('password');
      } else {
        showMessage('error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showMessage('error', 'Failed to verify OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetData.newPassword !== resetData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coordinators/profile/reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: resetData.newPassword,
          confirmPassword: resetData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Password reset successfully');
        setShowResetPassword(false);
        setResetData((prev) => ({
          ...prev,
          otp: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setResetStep('none');
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        showMessage('error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showMessage('error', 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageLayout}>
        <Sidebar currentView="profile" onLogout={onLogout} />
        <main className={styles.mainContent}>
          <p className={styles.loadingText}>Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      <Sidebar currentView="profile" onLogout={onLogout} />

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Coordinator Profile</h1>
            <p className={styles.pageSubtitle}>Manage your coordinator details in one place</p>
          </header>

          {message.text && (
            <div className={`${styles.message} ${styles[message.type as keyof typeof styles] || ''}`}>
              {message.text}
            </div>
          )}

          <div className={styles.formContainer}>
            <section className={styles.cardContainer}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <User className={styles.primaryText} size={20} />
                  <h3 className={styles.cardTitle}>Profile Information</h3>
                </div>
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    if (isEditing) {
                      handleDiscard();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>Basic Details</h4>
                  <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Name</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Email</label>
                      <input
                        type="email"
                        className={styles.inputField}
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Phone</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Staff ID</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.staffId}
                        onChange={(e) => handleProfileChange('staffId', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>Professional Information</h4>
                  <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Designation</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.designation}
                        onChange={(e) => handleProfileChange('designation', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Department</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Location</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.location}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Status</label>
                      <select
                        className={styles.inputField}
                        value={profileData.status}
                        onChange={(e) => handleProfileChange('status', e.target.value)}
                        disabled={!isEditing}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Join Date</label>
                      <input
                        type="date"
                        className={styles.inputField}
                        value={profileData.joinDate}
                        onChange={(e) => handleProfileChange('joinDate', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Experience</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.experience}
                        onChange={(e) => handleProfileChange('experience', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Publications</label>
                      <input
                        type="number"
                        min="0"
                        className={styles.inputField}
                        value={profileData.publications}
                        onChange={(e) => handleProfileChange('publications', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Patents</label>
                      <input
                        type="number"
                        min="0"
                        className={styles.inputField}
                        value={profileData.patents}
                        onChange={(e) => handleProfileChange('patents', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.sectionTitle}>Personal Information</h4>
                  <div className={styles.inputGrid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Date of Birth</label>
                      <input
                        type="date"
                        className={styles.inputField}
                        value={profileData.personalInfo.dob}
                        onChange={(e) => handleProfileChange('personalInfo.dob', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Gender</label>
                      <select
                        className={styles.inputField}
                        value={profileData.personalInfo.gender}
                        onChange={(e) => handleProfileChange('personalInfo.gender', e.target.value)}
                        disabled={!isEditing}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Blood Group</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={profileData.personalInfo.bloodGroup}
                        onChange={(e) => handleProfileChange('personalInfo.bloodGroup', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Address</label>
                      <textarea
                        className={`${styles.inputField} ${styles.textArea}`}
                        rows={3}
                        value={profileData.personalInfo.address}
                        onChange={(e) => handleProfileChange('personalInfo.address', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <div className={styles.educationActions}>
                    <h4 className={styles.sectionTitle}>Education</h4>
                    {isEditing && (
                      <button className={styles.smallBtn} onClick={addEducationRow} type="button">
                        <Plus size={14} /> Add Row
                      </button>
                    )}
                  </div>

                  {profileData.education.map((row, index) => (
                    <div key={`${row.degree}-${index}`} className={styles.educationRow}>
                      <div className={styles.inputGrid}>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Degree</label>
                          <input
                            type="text"
                            className={styles.inputField}
                            value={row.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Institution</label>
                          <input
                            type="text"
                            className={styles.inputField}
                            value={row.institution}
                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Year</label>
                          <input
                            type="text"
                            className={styles.inputField}
                            value={row.year}
                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {isEditing && profileData.education.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeEducationRow(index)}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className={styles.actionRow}>
                    <button className={styles.discardBtn} onClick={handleDiscard} type="button">
                      Discard
                    </button>
                    <button
                      className={styles.saveBtn}
                      onClick={handleSaveProfile}
                      type="button"
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.cardContainer}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <Lock className={styles.primaryText} size={20} />
                  <h3 className={styles.cardTitle}>Password Management</h3>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.passwordSection}>
                  <button
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowUpdatePassword((prev) => !prev)}
                    type="button"
                  >
                    <span>Update Password</span>
                    {showUpdatePassword ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showUpdatePassword && (
                    <div className={styles.passwordForm}>
                      <h4 className={styles.passwordFormTitle}>Update Password</h4>

                      <div className={styles.passwordFormGrid}>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Current Password</label>
                          <div className={styles.passwordWrapper}>
                            <input
                              type={showPasswords.old ? 'text' : 'password'}
                              className={styles.inputField}
                              value={passwordData.oldPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              className={styles.passwordToggle}
                              onClick={() => togglePasswordVisibility('old')}
                            >
                              {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>New Password</label>
                          <div className={styles.passwordWrapper}>
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              className={styles.inputField}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              className={styles.passwordToggle}
                              onClick={() => togglePasswordVisibility('new')}
                            >
                              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Confirm Password</label>
                          <div className={styles.passwordWrapper}>
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              className={styles.inputField}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              className={styles.passwordToggle}
                              onClick={() => togglePasswordVisibility('confirm')}
                            >
                              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        className={styles.primary}
                        onClick={handleUpdatePassword}
                        disabled={
                          actionLoading ||
                          !passwordData.oldPassword ||
                          !passwordData.newPassword ||
                          !passwordData.confirmPassword
                        }
                        type="button"
                      >
                        {actionLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.passwordSection}>
                  <button
                    className={styles.passwordToggleBtn}
                    onClick={() => setShowResetPassword((prev) => !prev)}
                    type="button"
                  >
                    <span>Reset Password (OTP)</span>
                    {showResetPassword ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showResetPassword && (
                    <div className={styles.passwordForm}>
                      <h4 className={styles.passwordFormTitle}>Reset Password</h4>

                      <div className={styles.stepIndicator}>
                        <div className={`${styles.stepDot} ${otpSent ? styles.completed : styles.active}`}>
                          {otpSent ? '✓' : '1'}
                        </div>
                        <div className={`${styles.stepConnector} ${otpSent ? styles.active : ''}`}></div>
                        <div className={`${styles.stepDot} ${otpVerified ? styles.completed : ''} ${resetStep === 'otp' ? styles.active : ''}`}>
                          {otpVerified ? '✓' : '2'}
                        </div>
                        <div className={`${styles.stepConnector} ${otpVerified ? styles.active : ''}`}></div>
                        <div className={`${styles.stepDot} ${resetStep === 'password' ? styles.active : ''}`}>
                          3
                        </div>
                      </div>

                      {resetStep === 'none' && (
                        <>
                          <div className={styles.noteBox}>
                            <p>
                              OTP will be sent to your registered mobile number in profile.
                            </p>
                          </div>

                          <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Mobile Number</label>
                            <input
                              type="text"
                              className={styles.inputField}
                              value={resetData.mobile}
                              onChange={(e) =>
                                setResetData((prev) => ({ ...prev, mobile: e.target.value }))
                              }
                            />
                          </div>

                          <button className={styles.primary} onClick={handleSendOtp} disabled={actionLoading} type="button">
                            {actionLoading ? 'Sending...' : 'Send OTP'}
                          </button>
                        </>
                      )}

                      {resetStep === 'otp' && (
                        <div className={styles.otpStep}>
                          <div className={styles.otpInputGroup}>
                            <label className={styles.inputLabel}>Enter OTP</label>
                            <input
                              type="text"
                              className={styles.inputField}
                              value={resetData.otp}
                              onChange={(e) =>
                                setResetData((prev) => ({ ...prev, otp: e.target.value }))
                              }
                              maxLength={6}
                            />
                          </div>
                          <button className={styles.primary} onClick={handleVerifyOtp} disabled={actionLoading} type="button">
                            {actionLoading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                      )}

                      {resetStep === 'password' && (
                        <>
                          <div className={styles.passwordFormGrid}>
                            <div className={styles.inputGroup}>
                              <label className={styles.inputLabel}>New Password</label>
                              <div className={styles.passwordWrapper}>
                                <input
                                  type={showPasswords.resetNew ? 'text' : 'password'}
                                  className={styles.inputField}
                                  value={resetData.newPassword}
                                  onChange={(e) =>
                                    setResetData((prev) => ({ ...prev, newPassword: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  className={styles.passwordToggle}
                                  onClick={() => togglePasswordVisibility('resetNew')}
                                >
                                  {showPasswords.resetNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>

                            <div className={styles.inputGroup}>
                              <label className={styles.inputLabel}>Confirm Password</label>
                              <div className={styles.passwordWrapper}>
                                <input
                                  type={showPasswords.resetConfirm ? 'text' : 'password'}
                                  className={styles.inputField}
                                  value={resetData.confirmPassword}
                                  onChange={(e) =>
                                    setResetData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  className={styles.passwordToggle}
                                  onClick={() => togglePasswordVisibility('resetConfirm')}
                                >
                                  {showPasswords.resetConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <button className={styles.primary} onClick={handleResetPassword} disabled={actionLoading} type="button">
                            {actionLoading ? 'Resetting...' : 'Reset Password'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoordinatorProfile;
