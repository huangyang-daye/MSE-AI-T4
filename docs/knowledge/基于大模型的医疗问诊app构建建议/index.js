import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import HealthProfile from './pages/HealthProfile';
import ChatConsultation from './pages/ChatConsultation';
import DiagnosisResult from './pages/DiagnosisResult';
import HealthRecords from './pages/HealthRecords';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Welcome />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="health-profile" element={<HealthProfile />} />
          <Route path="consultation" element={<ChatConsultation />} />
          <Route path="diagnosis-result" element={<DiagnosisResult />} />
          <Route path="health-records" element={<HealthRecords />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
