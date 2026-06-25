import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
