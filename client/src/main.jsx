import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AuthProvider from './context/authContext/authContext'

// This is react-dom at work: attaching your React app to the HTML div with id "root"
const root = createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
