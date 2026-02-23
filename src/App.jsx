import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './frontend/Landing_Page/Landing';
import LoginGateway from './frontend/Auth/LoginGateway';
import ForgotPassword from './frontend/Auth/ForgotPassword';
import SendOtp from './frontend/Auth/SendOtp';
import UpdatePassword from './frontend/Auth/UpdatePassword';

// Alumini Imports
import Alumini_Dashboard from './frontend/Alumini/Dashboard';
import Alumini_Mail from './frontend/Alumini/Mail';
import Alumini_ViewMail from './frontend/Alumini/ViewMail';
import Alumini_MailForm from './frontend/Alumini/Accept_Invitation';
import Alumini_EventsReunion from './frontend/Alumini/Event_Reunion';
import Alumini_View_Invitation from './frontend/Alumini/View_Invitaion';
import Alumini_Donation_History from './frontend/Alumini/Donation_History';
import Alumini_DonationFormPage from './frontend/Alumini/Donation_Form';
import Alumini_JobReference_History from './frontend/Alumini/JobReference_History';
import Alumini_Feedback from './frontend/Alumini/Feedback';
import Alumini_JobReference_Form from './frontend/Alumini/JobReference_Form';
import Alumini_Profile from './frontend/Alumini/Profile';

// Admin Imports
import Admin_Mail from './frontend/Admin/Mail';
import Admin_CreateMail from './frontend/Admin/CreateMail';
import Admin_Draft_History from './frontend/Admin/Draft_History';
import Admin_Draft from './frontend/Admin/Draft';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <Router>
      <Routes>
{/* Landing Page Routes */}
        <Route 
          path="/landing" 
          element={<LandingPage />} />

{/* Login GateWay Routes */}
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/alumini/dashboard" /> : <LoginGateway onLogin={handleLogin} />} />
        <Route 
          path="/forgot-password" 
          element={isLoggedIn ? <Navigate to="/alumini/dashboard" /> : <ForgotPassword onLogin={handleLogin} />} />
        <Route 
          path="/send-otp" 
          element={isLoggedIn ? <Navigate to="/alumini/dashboard" /> : <SendOtp onLogin={handleLogin} />} />
        <Route 
          path="/update-password" 
          element={isLoggedIn ? <Navigate to="/alumini/dashboard" /> : <UpdatePassword onLogin={handleLogin} />} />


{/* Alumini Routes */}
{/* Alumini DashBoard Routes */}
        <Route
          path="/alumini/dashboard"
          element={isLoggedIn ? <Alumini_Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

{/* Alumini Mail */}
        <Route
          path="/alumini/mail"
          element={isLoggedIn ? <Alumini_Mail onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/alumini/mail/viewmail"
          element={isLoggedIn ? <Alumini_ViewMail onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/alumini/mail/viewmail/acceptmail"
          element={isLoggedIn ? <Alumini_MailForm onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

{/* Alumini Events and Reunion */}
        <Route
          path="/alumini/event_reunion"
          element={isLoggedIn ? <Alumini_EventsReunion onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/alumini/event_reunion/view_invitation"
          element={isLoggedIn ? <Alumini_View_Invitation onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

{/* Alumini Donation History and Form */}
        <Route
          path="/alumini/donation_history"
          element={isLoggedIn ? <Alumini_Donation_History onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/alumini/donation_history/donation_form"
          element={isLoggedIn ? <Alumini_DonationFormPage onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

{/* Alumini Job Reference History and Form */}
        <Route
          path="/alumini/JobReference_History"
          element={isLoggedIn ? <Alumini_JobReference_History onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/alumini/JobReference_History/JobReference_Form"
          element={isLoggedIn ? <Alumini_JobReference_Form onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

{/* Alumini Feedback */}
        <Route
          path="/alumini/feedback"
          element={isLoggedIn ? <Alumini_Feedback onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

{/* Alumini Profile */}
        <Route
          path="/alumini/profile"
          element={isLoggedIn ? <Alumini_Profile onLogout={handleLogout} /> : <Navigate to="/login" />}
        />


{/* Admin Routes */}
{/* Admin Mail Routes */}
        <Route
          path="/admin/mail"
          element={isLoggedIn ? <Admin_Mail onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/mail/create_mail"
          element={isLoggedIn ? <Admin_CreateMail onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/mail/draft_history"
          element={isLoggedIn ? <Admin_Draft_History onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/mail/draft"
          element={isLoggedIn ? <Admin_Draft onLogout={handleLogout} /> : <Navigate to="/login" />}
        />





{/* Master Route for Unknown EndPoint */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/alumini/dashboard" : "/landing"} />} />
      </Routes>
    </Router>
  )
}

export default App