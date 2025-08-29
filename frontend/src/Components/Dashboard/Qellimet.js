// frontend/src/Components/Dashboard/Qellimet.js

import React, { useState, useEffect } from 'react';
import './Qellimet.css';
import logo from '../../img/logo1.png';
import { FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaCog, FaQuestionCircle, FaEdit, FaTrash, FaPlus, FaLaptop, FaPlane, FaCar, FaGraduationCap, FaHeart, FaGift, FaQuestion, FaBars, FaTimes } from 'react-icons/fa';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../../services/api';

const kategoriaOptions = [
  { value: 'Teknologji', label: 'Teknologji', icon: 'FaLaptop', color: '#00b894' },
  { value: 'Pushime', label: 'Pushime', icon: 'FaPlane', color: '#0984e3' },
  { value: 'Transport', label: 'Transport', icon: 'FaCar', color: '#e17055' },
  { value: 'Shtëpi', label: 'Shtëpi', icon: 'FaHome', color: '#6c5ce7' },
  { value: 'Edukim', label: 'Edukim', icon: 'FaGraduationCap', color: '#fd79a8' },
  { value: 'Shëndetësi', label: 'Shëndetësi', icon: 'FaHeart', color: '#e84393' },
  { value: 'Dhuratë', label: 'Dhuratë', icon: 'FaGift', color: '#fdcb6e' },
  { value: 'Të tjera', label: 'Të tjera', icon: 'FaQuestion', color: '#636e72' },
];

function getIconForCategory(cat) {
  const found = kategoriaOptions.find(k => k.value === cat);
  if (!found) return <FaQuestion />;
  const iconMap = { 'FaLaptop': <FaLaptop />, 'FaPlane': <FaPlane />, 'FaCar': <FaCar />, 'FaHome': <FaHome />, 'FaGraduationCap': <FaGraduationCap />, 'FaHeart': <FaHeart />, 'FaGift': <FaGift />, 'FaQuestion': <FaQuestion /> };
  return iconMap[found.icon] || <FaQuestion />;
}

function getColorForCategory(cat) {
  const found = kategoriaOptions.find(k => k.value === cat);
  return found ? found.color : '#636e72';
}

function calculateProgress(saved, target) {
  if (target === 0 || !target) return 0;
  return Math.min((saved / target) * 100, 100);
}

function calculateDaysLeft(targetDate) {
  if (!targetDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(targetDate);
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

const Qellimet = ({ onNavigate, currentPage }) => {
  const [qellimet, setQellimet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const [form, setForm] = useState({ 
    name: '', 
    savedAmount: '', 
    targetAmount: '', 
    category: '', 
    targetDate: '', 
    description: '' 
  });

  const handleNavigation = (page) => {
    setSidebarOpen(false); // Close the sidebar
    onNavigate(page); // Navigate to the new page
  };

  const fetchGoals = async () => {
    try {
      setError('');
      setIsLoading(true);
      const data = await getGoals();
      setQellimet(data.goals || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError("Nuk mund të ngarkoheshin qëllimet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === 'true');
    fetchGoals();
  }, []);

  const totaliKursyer = qellimet.reduce((sum, q) => sum + parseFloat(q.saved_amount || 0), 0);
  const totaliSynuar = qellimet.reduce((sum, q) => sum + parseFloat(q.target_amount || 0), 0);
  const progresiTotal = totaliSynuar > 0 ? (totaliKursyer / totaliSynuar) * 100 : 0;
  const qellimetAktive = qellimet.filter(q => parseFloat(q.saved_amount) < parseFloat(q.target_amount)).length;
  const qellimetPërfunduara = qellimet.length - qellimetAktive;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount || !form.category || !form.targetDate) return;
    
    try {
      if (editId) {
        await updateGoal(editId, form);
      } else {
        await createGoal(form);
      }
      setShowModal(false); 
      setEditId(null);
      setForm({ name: '', savedAmount: '', targetAmount: '', category: '', targetDate: '', description: '' });
      fetchGoals();
    } catch (err) {
      console.error("Failed to save goal:", err);
      alert(`Gabim: ${err.message}`);
    }
  }

  const handleEdit = (q) => {
    setForm({ 
      name: q.name,
      savedAmount: q.saved_amount,
      targetAmount: q.target_amount,
      category: q.category,
      targetDate: q.target_date ? new Date(q.target_date).toISOString().split('T')[0] : '',
      description: q.description || ''
    });
    setEditId(q.id); 
    setShowModal(true);
  }

  const handleDelete = async (id) => {
    if (window.confirm("A jeni i sigurt që doni ta fshini këtë qëllim?")) {
      try {
        await deleteGoal(id);
        fetchGoals();
      } catch (err) {
        console.error("Failed to delete goal:", err);
        alert(`Gabim gjatë fshirjes: ${err.message}`);
      }
    }
  }

  const handleUpdateProgress = (id, newAmount) => {
    const goalToUpdate = qellimet.find(q => q.id === id);
    // --- CHANGE: Prevent updates if the goal is already completed ---
    if (!goalToUpdate || parseFloat(goalToUpdate.saved_amount) >= parseFloat(goalToUpdate.target_amount)) {
        return; 
    }

    const updatedQellimet = qellimet.map(q => 
        q.id === id ? { ...q, saved_amount: Math.min(Number(newAmount), q.target_amount) } : q
    );
    setQellimet(updatedQellimet);

    if (window.updateTimeout) clearTimeout(window.updateTimeout);
    window.updateTimeout = setTimeout(async () => {
        try {
            await updateGoal(id, { savedAmount: newAmount });
        } catch (err) {
            console.error("Failed to update goal progress:", err);
            setQellimet(qellimet); // Revert on error
        }
    }, 1000);
  }

  return (
    <div className="dashboard-container">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo" onClick={() => setIsCollapsed(v => !v)}>
                    <img src={logo} alt="Logo" />
                </div>
                <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                    <FaTimes />
                </button>
            </div>
            <nav className="sidebar-menu">
                <button type="button" onClick={() => handleNavigation('dashboard')}><FaHome /> <span>Ballina</span></button>
                <button type="button" onClick={() => handleNavigation('transaksionet')}><FaExchangeAlt /> <span>Transaksionet</span></button>
                <button type="button" className="active"><FaBullseye /> <span>Qëllimet</span></button>
                <button type="button" onClick={() => handleNavigation('aichat')}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
                <button type="button" onClick={() => handleNavigation('settings')}><FaCog /> <span>Settings</span></button>
                <button type="button" onClick={() => handleNavigation('help')}><FaQuestionCircle /> <span>Ndihmë</span></button>
            </nav>
        </aside>

      <main className="dashboard-main">
        <div className="qellimet-container">
          <div className="qellimet-header">
            <h2>Qëllimet e tua financiare</h2>
            <p className="qellimet-desc">Vendos qëllime, ndiq progresin dhe arri ato që ke planifikuar.</p>
            <button className="add-btn" onClick={() => { setEditId(null); setForm({ name: '', savedAmount: '', targetAmount: '', category: '', targetDate: '', description: '' }); setShowModal(true); }}><FaPlus /> Shto qëllim</button>
          </div>

          <div className="qellimet-stats">
            <div className="stat-card"><div className="stat-value">{formatCurrency(totaliKursyer)}</div><div className="stat-label">Total i kursyer</div></div>
            <div className="stat-card"><div className="stat-value">{formatCurrency(totaliSynuar)}</div><div className="stat-label">Total i synuar</div></div>
            <div className="stat-card"><div className="stat-value">{Math.round(progresiTotal)}%</div><div className="stat-label">Progresi total</div></div>
            <div className="stat-card"><div className="stat-value">{qellimetAktive}</div><div className="stat-label">Qëllime aktive</div></div>
            <div className="stat-card"><div className="stat-value">{qellimetPërfunduara}</div><div className="stat-label">Qëllime përfunduara</div></div>
          </div>
          
          {isLoading ? (
              <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#a8b2d1'}}>Duke ngarkuar qëllimet...</p>
          ) : error ? (
              <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#ff6b6b'}}>{error}</p>
          ) : (
            <div className="qellimet-grid">
              {qellimet.map(q => {
                const progress = calculateProgress(q.saved_amount, q.target_amount);
                const daysLeft = calculateDaysLeft(q.target_date);
                const isCompleted = parseFloat(q.saved_amount) >= parseFloat(q.target_amount);
                const isOverdue = daysLeft < 0 && !isCompleted;
                
                return (
                  <div key={q.id} className={`qellim-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                    <div className="qellim-header">
                      <div className="qellim-icon" style={{ color: getColorForCategory(q.category) }}>{getIconForCategory(q.category)}</div>
                      <div className="qellim-title"><h3>{q.name}</h3><span className="qellim-category">{q.category}</span></div>
                      <div className="qellim-actions">
                        {/* --- CHANGE: Disable buttons and add styling when goal is completed --- */}
                        <button className="icon-btn" title="Edito" onClick={() => handleEdit(q)} disabled={isCompleted} style={{ cursor: isCompleted ? 'not-allowed' : 'pointer', opacity: isCompleted ? 0.5 : 1 }}>
                          <FaEdit />
                        </button>
                        <button className="icon-btn" title="Fshi" onClick={() => handleDelete(q.id)} disabled={isCompleted} style={{ cursor: isCompleted ? 'not-allowed' : 'pointer', opacity: isCompleted ? 0.5 : 1 }}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="qellim-progress">
                      <div className="progress-info">
                        <span>{formatCurrency(q.saved_amount)} / {formatCurrency(q.target_amount)}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: isCompleted ? '#00b894' : getColorForCategory(q.category) }}></div></div>
                    </div>
                    <div className="qellim-details">
                      <div className="qellim-amount-input">
                        <label>Përditëso shumën e kursyer:</label>
                        {/* --- CHANGE: Disable input and add styling when goal is completed --- */}
                        <input 
                          type="number" 
                          defaultValue={q.saved_amount} 
                          onChange={(e) => handleUpdateProgress(q.id, e.target.value)} 
                          min="0" 
                          max={q.target_amount} 
                          step="10" 
                          disabled={isCompleted}
                          style={{ 
                            cursor: isCompleted ? 'not-allowed' : 'auto', 
                            backgroundColor: isCompleted ? '#2d2f45' : '',
                            opacity: isCompleted ? 0.7 : 1
                          }}
                        />
                      </div>
                      <div className="qellim-info">
                        <div className="info-item">
                          <span className="info-label">Afati:</span>
                          <span className={`info-value ${isOverdue ? 'overdue' : ''}`}>{isOverdue ? `${Math.abs(daysLeft)} ditë më vonë` : `${daysLeft} ditë mbetur`}</span>
                        </div>
                        {q.description && <div className="info-item"><span className="info-label">Përshkrim:</span><span className="info-value">{q.description}</span></div>}
                      </div>
                    </div>
                    {isCompleted && <div className="qellim-completed-badge"><span>🎉 Qëllimi u arrit!</span></div>}
                  </div>
                );
              })}
              {qellimet.length === 0 && !isLoading && (
                <div className="qellimet-empty">
                  <div className="empty-icon">🎯</div>
                  <h3>Nuk ke qëllime ende</h3>
                  <p>Fillo duke shtuar qëllimin tënd të parë financiar!</p>
                  <button className="add-btn" onClick={() => { setEditId(null); setForm({ name: '', savedAmount: '', targetAmount: '', category: '', targetDate: '', description: '' }); setShowModal(true); }}><FaPlus /> Shto qëllimin tënd të parë</button>
                </div>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-bg">
            <div className="modal-content">
              <h3>{editId ? 'Edito' : 'Shto'} qëllim</h3>
              <form className="modal-form" onSubmit={handleSubmit}>
                <input type="text" placeholder="Emri i qëllimit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <input type="number" placeholder="Shuma e synuar (€)" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} required />
                <input type="number" placeholder="Shuma e kursyer (€) - opsionale" value={form.savedAmount} onChange={e => setForm(f => ({ ...f, savedAmount: e.target.value }))} />
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                  <option value="">Zgjidh kategorinë</option>
                  {kategoriaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <input type="date" placeholder="Data e përfundimit" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} required />
                <textarea placeholder="Përshkrim shtesë (opsional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:16}}>
                  <button type="button" onClick={() => {setShowModal(false); setEditId(null); setForm({ name: '', savedAmount: '', targetAmount: '', category: '', targetDate: '', description: '' });}} className="cancel-btn">Anulo</button>
                  <button type="submit" className="add-btn">{editId ? 'Ruaj' : 'Shto'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Qellimet;