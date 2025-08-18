// Importimi i librarive të nevojshme nga React
import React, { useState, useEffect } from 'react';
// Importimi i ikonave nga react-icons
import { FaCog, FaUser, FaBell, FaPalette, FaGlobe, FaSignOutAlt, FaTrash, FaEdit, FaEye, FaEyeSlash, FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaQuestionCircle, FaBars, FaTimes, FaGraduationCap, FaBriefcase, FaInfoCircle } from 'react-icons/fa';
import './Settings.css';
import logo from '../../img/logo1.png';

// Komponenti i Settings
export default function Settings({ currentPage, onNavigate, loggedInUser }) {
  // State për të menaxhuar sidebar-in në mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State për të menaxhuar formularët e ndryshimit
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Debug për modalin
  useEffect(() => {
    console.log('showAboutModal:', showAboutModal);
  }, [showAboutModal]);

  // State për formularët (mbushet nga loggedInUser)
  const deriveNameFromEmail = (email) => {
    if (!email) return { first: '', last: '' };
    const base = email.split('@')[0] || '';
    const tokens = base.replace(/[._-]+/g, ' ').split(' ').filter(Boolean);
    const title = tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
    const first = title[0] || '';
    const last = title.slice(1).join(' ');
    return { first, last };
  };

  const initialName = loggedInUser?.displayName || '';
  const split = initialName.split(' ');
  const fallback = deriveNameFromEmail(loggedInUser?.email);
  const [nameForm, setNameForm] = useState({ firstName: split[0] || fallback.first, lastName: split.slice(1).join(' ') || fallback.last });
  const [emailForm, setEmailForm] = useState({ email: loggedInUser?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [statusForm, setStatusForm] = useState({ status: 'Student' });
  const [professionForm, setProfessionForm] = useState({ profession: 'Inxhinier Softueri' });

  // State për preferencat
  const [preferences, setPreferences] = useState({
    language: 'Shqip',
    theme: 'Pamja fillestare',
    currency: '€'
  });
  
  // State për njoftimet
  const [notifications, setNotifications] = useState({
    newTransactions: true,
    completedGoals: true,
    budgetReminders: false,
    aiSuggestions: true,
    appNotifications: true
  });
  
  // State për të fshehtë fjalëkalimin
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State për validimin e fjalëkalimit
  const [passwordError, setPasswordError] = useState('');
  
  // State për mesazhet e suksesit
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Funksioni për të ndryshuar temën
  const handleThemeChange = (newTheme) => {
    setPreferences(prev => ({...prev, theme: newTheme}));
  };
  
  // Funksioni për të ndryshuar njoftimet
  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Funksioni për të ndryshuar emrin
  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowNameModal(false);
    setSuccessMessage('Emri u ndryshua me sukses!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Funksioni për të ndryshuar emailin
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setShowEmailModal(false);
    setSuccessMessage('Emaili u ndryshua me sukses!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Funksioni për të kontrolluar validimin e fjalëkalimit në kohë reale
  const checkPasswordValidation = () => {
    if (passwordForm.newPassword && passwordForm.confirmPassword) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('Fjalëkalimet nuk përputhen!');
      } else if (passwordForm.newPassword.length < 6) {
        setPasswordError('Fjalëkalimi duhet të ketë të paktën 6 karaktere!');
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  };

  // Funksioni për të ndryshuar fjalëkalimin
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Kontrollo nëse fjalëkalimi aktual është plotësuar
    if (!passwordForm.currentPassword.trim()) {
      alert('Ju lutem plotësoni fjalëkalimin aktual!');
      return;
    }
    
    // Kontrollo nëse fjalëkalimi i ri është plotësuar
    if (!passwordForm.newPassword.trim()) {
      alert('Ju lutem plotësoni fjalëkalimin e ri!');
      return;
    }
    
    // Kontrollo nëse konfirmimi i fjalëkalimit është plotësuar
    if (!passwordForm.confirmPassword.trim()) {
      alert('Ju lutem plotësoni konfirmimin e fjalëkalimit!');
      return;
    }
    
    // Kontrollo nëse fjalëkalimi i ri dhe konfirmimi përputhen
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Fjalëkalimi i ri dhe konfirmimi nuk përputhen!');
      return;
    }
    
    // Kontrollo nëse fjalëkalimi i ri është i ndryshëm nga ai aktual
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      alert('Fjalëkalimi i ri duhet të jetë i ndryshëm nga ai aktual!');
      return;
    }
    
    // Kontrollo nëse fjalëkalimi i ri plotëson kërkesat minimale
    if (passwordForm.newPassword.length < 6) {
      alert('Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere!');
      return;
    }
    
    // Nëse të gjitha kontrollet kalojnë, vazhdo me ndryshimin
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccessMessage('Fjalëkalimi u ndryshua me sukses!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Funksioni për të ndryshuar statusin
  const handleStatusSubmit = (e) => {
    e.preventDefault();
    setShowStatusModal(false);
    setSuccessMessage('Statusi u ndryshua me sukses!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Funksioni për të ndryshuar profesionin
  const handleProfessionSubmit = (e) => {
    e.preventDefault();
    setShowProfessionModal(false);
    setSuccessMessage('Profesioni u ndryshua me sukses!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Funksioni për të dalë nga llogaria
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Funksioni për të konfirmuar daljen
  const confirmLogout = () => {
    window.location.href = '/';
    setShowLogoutModal(false);
  };
  
  // Funksioni për të fshirë llogarinë
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // Funksioni për të konfirmuar fshirjen
  const confirmDeleteAccount = () => {
    window.location.href = '/';
    setShowDeleteModal(false);
  };

  return (
    <div className="dashboard-container">
      {/* Hamburger Menu Button për Mobile */}
      <button 
        className="hamburger-menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <FaBars />
      </button>

      {/* Sidebar Overlay për Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-menu">
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('dashboard'); setSidebarOpen(false);}}><FaHome /> <span>Ballina</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('transaksionet'); setSidebarOpen(false);}}><FaExchangeAlt /> <span>Transaksionet</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('qellimet'); setSidebarOpen(false);}}><FaBullseye /> <span>Qëllimet</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('aichat'); setSidebarOpen(false);}}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
          <button type="button" className="active" onClick={e => {e.preventDefault(); onNavigate('settings'); setSidebarOpen(false);}}><FaCog /> <span>Cilësimet</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('help'); setSidebarOpen(false);}}><FaQuestionCircle /> <span>Ndihmë</span></button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Dil</button>
      </aside>
      
      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content-center">
          {/* Header Section */}
          <div className="settings-header">
            <div>
              <h2>CILËSIMET</h2>
              <p className="settings-desc">Menaxhoni profilin dhe preferencat tuaja</p>
            </div>
          </div>
          
          {/* Success Message */}
          {showSuccess && (
            <div className="success-message">
              <span>{successMessage}</span>
            </div>
          )}
          
          {/* Main Settings Grid */}
          <div className="settings-grid">
            {/* Profile Section - Left Column */}
            <div className="settings-column">
              <section className="settings-section profile-section">
                <div className="section-header">
                  <div className="header-icon">
                    <FaUser />
                  </div>
                  <div className="header-text">
                    <h2>Profili</h2>
                    <p>Informacionet personale dhe profesionale</p>
                  </div>
                </div>
                
                <div className="profile-info-grid">
                  <div className="info-card">
                    <div className="info-header">
                      <FaUser className="info-icon" />
                      <span>Emri dhe Mbiemri</span>
                    </div>
                    <div className="info-value">{nameForm.firstName} {nameForm.lastName}</div>
                    <button className="info-action-btn" onClick={() => setShowNameModal(true)}>
                      <FaEdit /> Ndrysho
                    </button>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-header">
                      <FaGlobe className="info-icon" />
                      <span>Email-i</span>
                    </div>
                    <div className="info-value">{emailForm.email}</div>
                    <button className="info-action-btn" onClick={() => setShowEmailModal(true)}>
                      <FaEdit /> Ndrysho
                    </button>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-header">
                      <FaGraduationCap className="info-icon" />
                      <span>Statusi i profesionit</span>
                    </div>
                    <div className="info-value">{statusForm.status}</div>
                    <button className="info-action-btn" onClick={() => setShowStatusModal(true)}>
                      <FaEdit /> Ndrysho
                    </button>
                  </div>
                  
                  <div className="info-card">
                    <div className="info-header">
                      <FaBriefcase className="info-icon" />
                      <span>Profesioni aktual</span>
                    </div>
                    <div className="info-value">{professionForm.profession}</div>
                    <button className="info-action-btn" onClick={() => setShowProfessionModal(true)}>
                      <FaEdit /> Ndrysho
                    </button>
                  </div>
                </div>
                
                <div className="profile-actions">
                  <button className="action-btn primary" onClick={() => setShowPasswordModal(true)}>
                    <FaEdit /> Ndrysho fjalëkalimin
                  </button>
                  <div className="action-buttons">
                    <button className="action-btn warning" onClick={handleLogout}>
                      <FaSignOutAlt /> Dil nga llogaria
                    </button>
                    <button className="action-btn danger" onClick={handleDeleteAccount}>
                      <FaTrash /> Fshi llogarinë
                    </button>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Right Column */}
            <div className="settings-column">
              {/* Preferences Section */}
              <section className="settings-section preferences-section">
                <div className="section-header">
                  <div className="header-icon">
                    <FaPalette />
                  </div>
                  <div className="header-text">
                    <h2>Preferencat</h2>
                    <p>Personalizoni përvojën tuaj</p>
                  </div>
                </div>
                
                <div className="preferences-content">
                  <div className="preference-item">
                    <label>Gjuha</label>
                    <div className="language-display">
                      <span>Shqip</span>
                    </div>
                  </div>
                  
                  <div className="preference-item">
                    <label>Stili i pamjes</label>
                    <select 
                      value={preferences.theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                    >
                      <option value="Dritë">Dritë</option>
                      <option value="Errët">Errët</option>
                      <option value="Pamja fillestare">Pamja fillestare</option>
                    </select>
                  </div>
                  
                  <div className="preference-item">
                    <label>Valuta</label>
                    <select 
                      value={preferences.currency}
                      onChange={(e) => setPreferences(prev => ({...prev, currency: e.target.value}))}
                    >
                      <option value="€">€ (Euro)</option>
                      <option value="L">L (Lekë)</option>
                      <option value="$">$ (Dollar)</option>
                    </select>
                  </div>
                </div>
              </section>
              
              {/* Notifications Section */}
              <section className="settings-section notifications-section">
                <div className="section-header">
                  <div className="header-icon">
                    <FaBell />
                  </div>
                  <div className="header-text">
                    <h2>Njoftimet</h2>
                    <p>Kontrolloni njoftimet që merrni</p>
                  </div>
                </div>
                
                <div className="notifications-content">
                  <div className="notification-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notifications.newTransactions}
                        onChange={() => toggleNotification('newTransactions')}
                      />
                      <span>Transaksione të reja</span>
                    </label>
                    <div 
                      className={`toggle-switch ${notifications.newTransactions ? 'on' : ''}`}
                      onClick={() => toggleNotification('newTransactions')}
                    ></div>
                  </div>
                  
                  <div className="notification-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notifications.completedGoals}
                        onChange={() => toggleNotification('completedGoals')}
                      />
                      <span>Qëllime të përmbushura</span>
                    </label>
                    <div 
                      className={`toggle-switch ${notifications.completedGoals ? 'on' : ''}`}
                      onClick={() => toggleNotification('completedGoals')}
                    ></div>
                  </div>
                  
                  <div className="notification-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notifications.budgetReminders}
                        onChange={() => toggleNotification('budgetReminders')}
                      />
                      <span>Kujtesa për buxhetin</span>
                    </label>
                    <div 
                      className={`toggle-switch ${notifications.budgetReminders ? 'on' : ''}`}
                      onClick={() => toggleNotification('budgetReminders')}
                    ></div>
                  </div>
                  
                  <div className="notification-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notifications.aiSuggestions}
                        onChange={() => toggleNotification('aiSuggestions')}
                      />
                      <span>Sugjerime nga AI</span>
                    </label>
                    <div 
                      className={`toggle-switch ${notifications.aiSuggestions ? 'on' : ''}`}
                      onClick={() => toggleNotification('aiSuggestions')}
                    ></div>
                  </div>
                  
                  <div className="notification-item">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={notifications.appNotifications}
                        onChange={() => toggleNotification('appNotifications')}
                      />
                      <span>Njoftime të aplikacionit</span>
                    </label>
                    <div 
                      className={`toggle-switch ${notifications.appNotifications ? 'on' : ''}`}
                      onClick={() => toggleNotification('appNotifications')}
                    ></div>
                  </div>
                </div>
              </section>
              
              {/* Other Section */}
              <section className="settings-section other-section">
                <div className="section-header">
                  <div className="header-icon">
                    <FaCog />
                  </div>
                  <div className="header-text">
                    <h2>Të tjera</h2>
                    <p>Opsione shtesë</p>
                  </div>
                </div>
                
                <div className="other-content">
                  <button 
                    className="about-btn"
                    onClick={() => {
                      console.log('About button clicked from Other section');
                      setShowAboutModal(true);
                    }}
                  >
                    <FaInfoCircle /> Rreth aplikacionit
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Modal për ndryshimin e emrit */}
      {showNameModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ndrysho emrin</h3>
              <button className="modal-close-btn" onClick={() => setShowNameModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleNameSubmit} className="modal-form">
              <div className="form-group">
                <label>Emri:</label>
                <input 
                  type="text" 
                  value={nameForm.firstName}
                  onChange={(e) => setNameForm(prev => ({...prev, firstName: e.target.value}))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mbiemri:</label>
                <input 
                  type="text" 
                  value={nameForm.lastName}
                  onChange={(e) => setNameForm(prev => ({...prev, lastName: e.target.value}))}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowNameModal(false)}>
                  Anulo
                </button>
                <button type="submit" className="submit-btn">
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal për ndryshimin e emailit */}
      {showEmailModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ndrysho emailin</h3>
              <button className="modal-close-btn" onClick={() => setShowEmailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEmailSubmit} className="modal-form">
              <div className="form-group">
                <label>Email i ri:</label>
                <input 
                  type="email" 
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({...prev, email: e.target.value}))}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEmailModal(false)}>
                  Anulo
                </button>
                <button type="submit" className="submit-btn">
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal për ndryshimin e fjalëkalimit */}
      {showPasswordModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ndrysho fjalëkalimin</h3>
              <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label>Fjalëkalimi aktual:</label>
                <div className="password-input-container">
                  <input 
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Fjalëkalimi i ri:</label>
                <div className="password-input-container">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({...prev, newPassword: e.target.value}));
                      setTimeout(checkPasswordValidation, 100);
                    }}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Konfirmo fjalëkalimin e ri:</label>
                <div className="password-input-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}));
                      setTimeout(checkPasswordValidation, 100);
                    }}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="password-error-message" style={{
                  color: '#ff4444',
                  fontSize: '0.85rem',
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  borderRadius: '6px'
                }}>
                  {passwordError}
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Anulo
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!!passwordError}
                  style={{
                    opacity: passwordError ? 0.6 : 1,
                    cursor: passwordError ? 'not-allowed' : 'pointer'
                  }}
                >
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal për ndryshimin e statusit */}
      {showStatusModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ndrysho statusin</h3>
              <button className="modal-close-btn" onClick={() => setShowStatusModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleStatusSubmit} className="modal-form">
              <div className="form-group">
                <label>Statusi i ri:</label>
                <select 
                  value={statusForm.status}
                  onChange={(e) => setStatusForm(prev => ({...prev, status: e.target.value}))}
                >
                  <option value="Student">Student</option>
                  <option value="Student i punësuar">Student i punësuar</option>
                  <option value="I punësuar">I punësuar</option>
                  <option value="I pa punësuar">I pa punësuar</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowStatusModal(false)}>
                  Anulo
                </button>
                <button type="submit" className="submit-btn">
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal për ndryshimin e profesionit */}
      {showProfessionModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ndrysho profesionin</h3>
              <button className="modal-close-btn" onClick={() => setShowProfessionModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleProfessionSubmit} className="modal-form">
              <div className="form-group">
                <label>Profesioni i ri:</label>
                <select 
                  value={professionForm.profession}
                  onChange={(e) => setProfessionForm(prev => ({...prev, profession: e.target.value}))}
                >
                  <option value="Inxhinier Softueri">Inxhinier Softueri</option>
                  <option value="Inxhinier Telekomunikacioni">Inxhinier Telekomunikacioni</option>
                  <option value="Inxhinier Elektrik">Inxhinier Elektrik</option>
                  <option value="Inxhinier Mekanik">Inxhinier Mekanik</option>
                  <option value="Mesues/ Arsimtar/ Profesor">Mesues/ Arsimtar/ Profesor</option>
                  <option value="Infermier/ Doktor/ Farmacist">Infermier/ Doktor/ Farmacist</option>
                  <option value="Avokat">Avokat</option>
                  <option value="Ekonomist">Ekonomist</option>
                  <option value="Arkitekt">Arkitekt</option>
                  <option value="Dizajner">Dizajner</option>
                  <option value="Shitës">Shitës</option>
                  <option value="Menaxher">Menaxher</option>
                  <option value="Kontabilist / Financier">Kontabilist / Financier</option>
                  <option value="Gazetar">Gazetar</option>
                  <option value="Tjetër">Tjetër</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowProfessionModal(false)}>
                  Anulo
                </button>
                <button type="submit" className="submit-btn">
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal për konfirmimin e daljes */}
      {showLogoutModal && (
        <div className="modal-bg">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Konfirmo daljen</h3>
              <button className="modal-close-btn" onClick={() => setShowLogoutModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>A jeni të sigurt që dëshironi të dilni nga llogaria?</p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowLogoutModal(false)}
              >
                Anulo
              </button>
              <button 
                type="button" 
                className="confirm-btn" 
                onClick={confirmLogout}
              >
                Po, dil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal për konfirmimin e fshirjes së llogarisë */}
      {showDeleteModal && (
        <div className="modal-bg">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h3>Konfirmo fshirjen e llogarisë</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-icon">
                <FaTrash />
              </div>
              <p>A jeni të sigurt që dëshironi të fshini llogarinë?</p>
              <p className="warning-text">Kjo veprim nuk mund të kthehet mbrapsht dhe do të humbni të gjitha të dhënat tuaja.</p>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowDeleteModal(false)}
              >
                Anulo
              </button>
              <button 
                type="button" 
                className="delete-confirm-btn" 
                onClick={confirmDeleteAccount}
              >
                Po, fshi llogarinë
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal për informacionet rreth aplikacionit */}
      {showAboutModal && (
        <div className="modal-bg">
          <div className="modal-content about-modal">
            <div className="modal-header">
              <h3>Rreth aplikacionit</h3>
              <button className="modal-close-btn" onClick={() => setShowAboutModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="app-info">
                <div className="app-logo">
                  <img src={logo} alt="Logo" />
                </div>
                <h4>Ruaj Mençur</h4>
                
                <div className="info-section">
                  <h5>Çfarë është Ruaj Mençur?</h5>
                  <p>Ruaj Mençur është një aplikacion modern dhe intuitiv për menaxhimin e financave personale. Është krijuar për të ndihmuar përdoruesit të kenë kontroll të plotë mbi të ardhurat dhe shpenzimet e tyre.</p>
                </div>
                
                <div className="info-section">
                  <h5>Për çfarë shërben?</h5>
                  <p>Ky aplikacion shërben për të ndihmuar përdoruesit të:</p>
                  <ul>
                    <li>📊 Ndiqin shpenzimet dhe të ardhurat në kohë reale</li>
                    <li>💰 Menaxhojnë buxhetin personal</li>
                    <li>🎯 Vendosin dhe ndjekin qëllime financiare</li>
                    <li>📈 Analizojnë trendet e shpenzimeve</li>
                    <li>🤖 Marrin këshilla financiare nga AI</li>
                    <li>📱 Aksesojnë financat nga çdo pajisje</li>
                  </ul>
                </div>
                
                <div className="info-section">
                  <h5>Çfarë përmban aplikacioni?</h5>
                  <ul>
                    <li><strong>Dashboard:</strong> Pamje e përgjithshme e financave me statistika dhe grafikë</li>
                    <li><strong>Transaksionet:</strong> Menaxhimi i të ardhurave dhe shpenzimeve</li>
                    <li><strong>Qëllimet:</strong> Vendosja dhe ndjekja e qëllimeve financiare</li>
                    <li><strong>AI Chat:</strong> Këshilla financiare nga inteligjenca artificiale</li>
                    <li><strong>Cilësimet:</strong> Personalizimi i përvojës së përdoruesit</li>
                    <li><strong>Raporte:</strong> Analiza të detajuara të shpenzimeve</li>
                  </ul>
                </div>
                
                <div className="info-section">
                  <h5>Pse të përdorni Ruaj Mençur?</h5>
                  <ul>
                    <li>🎨 <strong>Dizajn modern:</strong> Interface e bukur dhe e lehtë për t'u përdorur</li>
                    <li>📱 <strong>Responsiv:</strong> Punon në të gjitha pajisjet (telefon, tablet, kompjuter)</li>
                    <li>🔒 <strong>I sigurt:</strong> Të dhënat tuaja janë të mbrojtura</li>
                    <li>⚡ <strong>I shpejtë:</strong> Performancë e shkëlqyer</li>
                    <li>🤖 <strong>AI Powered:</strong> Këshilla inteligjente për financat</li>
                    <li>📊 <strong>Statistika:</strong> Analiza të detajuara dhe raporte</li>
                  </ul>
                </div>
                
                <div className="info-section">
                  <h5>Si të filloni?</h5>
                  <p>Për të filluar përdorimin e Ruaj Mençur:</p>
                  <ol>
                    <li>Regjistrohuni ose hyni në llogarinë tuaj</li>
                    <li>Vendosni të ardhurat dhe shpenzimet tuaja</li>
                    <li>Krijoni qëllime financiare</li>
                    <li>Ndiqni progresin tuaj në dashboard</li>
                    <li>Përdorni AI Chat për këshilla</li>
                  </ol>
                </div>
              </div>
            </div>

          </div>
        </div>
             )}
     </div>
   );
 }
