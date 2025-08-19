import React, { useState, useRef, useEffect } from 'react';
import { FaBars, FaTimes, FaHome, FaExchangeAlt, FaBullseye, FaRobot, FaCog, FaQuestionCircle } from 'react-icons/fa';
import './AIChat.css';
import logo from '../../img/logo1.png';

const AIChat = ({ currentPage, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    const savedOpen = localStorage.getItem('sidebarOpen');
    if (savedCollapsed !== null) setIsCollapsed(savedCollapsed === 'true');
    if (savedOpen !== null) setSidebarOpen(savedOpen === 'true');
  }, []);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Funksioni për të konfirmuar daljen
  const confirmLogout = () => {
    window.location.href = '/';
    setShowLogoutModal(false);
  };



  // Avatar configurations - easily customizable
  const avatars = {
    user: {
      src: '/img/user.icon.png',
      alt: 'Përdoruesi',
      fallback: '👤'
    },
    ai: {
      src: null, // No AI avatar image exists yet
      alt: 'AI Asistent',
      fallback: '🤖'
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate AI response (replace with actual API call)
  const simulateAIResponse = async (userMessage) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI responses based on user input
    let aiResponse = "Faleminderit për pyetjen tuaj! Unë jam këtu për t'ju ndihmuar me pyetjet tuaja financiare.";
    
    if (userMessage.toLowerCase().includes('shpenzuar')) {
      aiResponse = "Bazuar në të dhënat tuaja, këtë muaj keni shpenzuar rreth 450€. Kategoria më e madhe është ushqimi me 150€.";
    } else if (userMessage.toLowerCase().includes('të ardhura')) {
      aiResponse = "Të ardhurat tuaja totale janë 1240€. Kjo përfshin pagën mujore dhe të ardhura të tjera.";
    } else if (userMessage.toLowerCase().includes('kursej')) {
      aiResponse = "Për të kursyer më shumë, ju rekomandoj të: 1) Ndani shpenzimet në kategoritë e tyre, 2) Vendosni një buxhet mujor, 3) Gjurmoni shpenzimet tuaja çdo javë.";
    } else if (userMessage.toLowerCase().includes('qëllime')) {
      aiResponse = "Qëllimet tuaja aktuale financiare janë: 1) Kursimi për pushime - 2000€, 2) Blerja e një makine - 15000€, 3) Investimi në fond - 5000€.";
    }
    
    setIsLoading(false);
    return aiResponse;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const aiResponse = await simulateAIResponse(inputValue);
    
    const aiMessage = {
      id: Date.now() + 1,
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, aiMessage]);
  };



  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Hamburger Menu Button */}
      <button 
        className="hamburger-menu-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <FaBars />
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => setIsCollapsed(v => { const nv = !v; localStorage.setItem('sidebarCollapsed', String(nv)); return nv; })}>
            <img src={logo} alt="Logo" />
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => { setSidebarOpen(false); localStorage.setItem('sidebarOpen', 'false'); }}
          >
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-menu">
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('dashboard');}}><FaHome /> <span>Ballina</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('transaksionet');}}><FaExchangeAlt /> <span>Transaksionet</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('qellimet');}}><FaBullseye /> <span>Qëllimet</span></button>
          <button type="button" className="active" onClick={e => {e.preventDefault(); onNavigate('aichat');}}><FaRobot className="bot-icon" /> <span>AIChat</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('settings');}}><FaCog /> <span>Settings</span></button>
          <button type="button" onClick={e => {e.preventDefault(); onNavigate('help');}}><FaQuestionCircle /> <span>Ndihmë</span></button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content-center">
          {/* Header Section */}
          <div className="ai-chat-header-section">
            <div className="ai-chat-header">
              <div>
                <h1>FinBot</h1>
                <p className="ai-chat-subtitle">Bisedoni me AI-në për pyetje financiare</p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="ai-chat-content">
            {/* Messages Container */}
            <div className="messages-container">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-icon">🤖</div>
                  <h3>Mirë se vini në Asistentin Financiar AI!</h3>
                  <p>Unë jam këtu për t'ju ndihmuar me pyetjet tuaja financiare.</p>
                  <p>Shkruani pyetjen tuaj dhe do të merrni përgjigje menjëherë.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-avatar">
                    {message.sender === 'user' ? (
                      <>
                        <img 
                          src={avatars.user.src}
                          alt={avatars.user.alt}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="avatar-fallback">{avatars.user.fallback}</span>
                      </>
                    ) : (
                      <span className="avatar-fallback">{avatars.ai.fallback}</span>
                    )}
                  </div>
                  
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-timestamp">{message.timestamp}</div>
                  </div>
                </div>
              ))}
              
              {/* Loading Animation */}
              {isLoading && (
                <div className="message ai-message">
                  <div className="message-avatar">
                    <span className="avatar-fallback">{avatars.ai.fallback}</span>
                  </div>
                  <div className="message-content">
                    <div className="loading-animation">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="loading-text">...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>



            {/* Input Bar */}
            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  className="message-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Shkruani pyetjen tuaj këtu..."
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal për konfirmimin e daljes */}
        {showLogoutModal && (
          <div className="modal-bg">
            <div className="modal-content">
              <div className="modal-header">
                <h3>KONFIRMO DALJEN</h3>
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
                  ANULO
                </button>
                <button 
                  type="button" 
                  className="confirm-btn" 
                  onClick={confirmLogout}
                >
                  PO, DIL
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIChat; 