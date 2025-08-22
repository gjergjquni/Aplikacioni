// frontend/src/Components/Dashboard/HomeDashboard.js

import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaPlus, FaTimes, FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaCog, FaQuestionCircle, FaBars, FaSignOutAlt } from 'react-icons/fa';
import './HomeDashboard.css';
import logo from '../../img/logo1.png';
import { getHomeDashboardData } from '../../services/api';

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export default function HomeDashboard({ onNavigate, loggedInUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    notifications: [],
    spendingByCategory: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === 'true');

    const fetchData = async () => {
      try {
        setError('');
        setIsLoading(true);
        const data = await getHomeDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Nuk mund të ngarkoheshin të dhënat. Provoni përsëri më vonë.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };
  
  const dynamicCategories = Object.entries(dashboardData.spendingByCategory).map(([name, value], index) => {
    const colors = ['#00b894', '#0984e3', '#e17055', '#6c5ce7', '#fdcb6e', '#636e72'];
    return { name, value, color: colors[index % colors.length] };
  });
  const dynamicTotal = dynamicCategories.reduce((sum, c) => sum + c.value, 0);

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px', fontSize: '1.5rem' }}>Duke ngarkuar Panelin...</div>;
  }
  
  if (error) {
    return <div style={{ color: '#ff6b6b', textAlign: 'center', paddingTop: '50px', fontSize: '1.5rem' }}>{error}</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => setIsCollapsed(v => { const nv = !v; localStorage.setItem('sidebarCollapsed', String(nv)); return nv; })}>
            <img src={logo} alt="Logo" />
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-menu">
          <button type="button" className="active" onClick={() => onNavigate('dashboard')}><FaHome /> <span>Ballina</span></button>
          <button type="button" onClick={() => onNavigate('transaksionet')}><FaExchangeAlt /> <span>Transaksionet</span></button>
          <button type="button" onClick={() => onNavigate('qellimet')}><FaBullseye /> <span>Qëllimet</span></button>
          <button type="button" onClick={() => onNavigate('aichat')}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
          <button type="button" onClick={() => onNavigate('settings')}><FaCog /> <span>Settings</span></button>
          <button type="button" onClick={() => onNavigate('help')}><FaQuestionCircle /> <span>Ndihmë</span></button>
          <button type="button" onClick={() => setShowLogoutModal(true)} style={{ marginTop: 'auto' }}><FaSignOutAlt /> <span>Dil</span></button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content-center">
          <div className="greeting-section">
            <div className="greeting-header">
              <div>
                <h1>Mirë se u riktheve, {loggedInUser.fullName}!</h1>
                <p className="greeting-sub">Ja përmbledhja jote financiare për sot.</p>
              </div>
              <button className="add-income-btn" onClick={() => setShowIncomeModal(true)}>
                <FaPlus /> Shto të ardhura
              </button>
            </div>
          </div>
          
          <div className="main-balance-section">
            <div className="balance-card">
              <FaWallet className="balance-icon" />
              <div className="balance-label">Bilanci total</div>
              {/* --- FIX APPLIED HERE --- */}
              <div className="balance-value">{parseFloat(dashboardData.balance).toFixed(2)}€</div>
            </div>
            <div className="income-card">
              <FaArrowUp className="income-icon" />
              <div className="income-label">Të ardhura mujore</div>
              {/* --- FIX APPLIED HERE --- */}
              <div className="income-value">{parseFloat(dashboardData.monthlyIncome).toFixed(2)}€</div>
            </div>
            <div className="expense-card">
              <FaArrowDown className="expense-icon" />
              <div className="expense-label">Shpenzime mujore</div>
              {/* --- FIX APPLIED HERE --- */}
              <div className="expense-value">{parseFloat(dashboardData.monthlyExpenses).toFixed(2)}€</div>
            </div>
          </div>
          
          <div className="dashboard-bottom-section">
            <div className="pie-chart-card">
              <div className="pie-title">Shpenzimet sipas kategorive</div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'}}>
                {dynamicCategories.length > 0 ? (
                  <>
                    <div style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: `conic-gradient(${dynamicCategories.map((cat, i) => `${cat.color} ${i === 0 ? 0 : (dynamicCategories.slice(0, i).reduce((a, c) => a + c.value, 0) / dynamicTotal) * 100}%, ${cat.color} ${(dynamicCategories.slice(0, i + 1).reduce((a, c) => a + c.value, 0) / dynamicTotal) * 100}%`).join(', ')})`,
                      border: '1px solid #181926', boxSizing: 'border-box', position: 'relative', marginBottom: '8px',
                    }}>
                    </div>
                    <div className="pie-legend">
                      {dynamicCategories.map(cat => (
                        <div key={cat.name} className="pie-legend-item">
                          <span className="pie-color" style={{background: cat.color}}></span>
                          <span>{cat.name} ({parseFloat(cat.value).toFixed(2)}€)</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#b2bec3' }}>
                    <p style={{margin: '0 0 8px 0', fontSize: '1.1rem'}}>Nuk ka shpenzime</p>
                    <p style={{margin: 0, fontSize: '0.9rem'}}>Shto transaksione për të parë shpenzimet</p>
                  </div>
                )}
              </div>
            </div>
            <div className="compare-notify-section">
              <div className="notifications-list">
                 {dashboardData.notifications.map((n, i) => (
                    <div key={i} className={`notification-card ${n.type}`}>
                      <span>{n.text}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>KONFIRMO DALJEN</h3>
              <button className="modal-close-btn" onClick={() => setShowLogoutModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body"><p>A jeni të sigurt që dëshironi të dilni nga llogaria?</p></div>
            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowLogoutModal(false)}>ANULO</button>
              <button type="button" className="confirm-btn" onClick={confirmLogout}>PO, DIL</button>
            </div>
          </div>
        </div>
      )}

      {/* You can add your Income Modal here if needed */}

    </div>
  );
}