// Importimi i librarive të nevojshme nga React
import React, { useState } from 'react';
// Importimi i komponentëve të ndryshëm të aplikacionit
import LoginForm from './Components/Auth/LoginForm';
import RegisterForm from './Components/Auth/RegisterForm';
import ForgotPasswordForm from './Components/Auth/ForgotPasswordForm';
import AuthLayout from './Components/Auth/AuthLayout';
import './App.css';
import HomeDashboard from './Components/Dashboard/HomeDashboard';
import Transaksionet from './Components/Dashboard/Transaksionet';
import Qellimet from './Components/Dashboard/Qellimet';
import AIChat from './Components/Chat/AIChat';
import Settings from './Components/UI/Settings';
import Help from './Components/UI/Help';

// Të dhënat fillestare të transaksioneve - bosh në nisje
const initialTransaksionet = [];

// Komponenti kryesor i aplikacionit - App
function App() {
  // State për të menaxhuar faqen aktuale të aplikacionit
  // Vlerat e mundshme: 'login', 'register', 'forgot', 'dashboard', 'transaksionet', 'qellimet', 'aichat', 'settings', 'help'
  const [page, setPage] = useState('login');
  
  // State për të ruajtur informacionin e përdoruesit të loguar
  const [loggedInUser, setLoggedInUser] = useState(null);

  const deriveDisplayName = (email) => {
    if (!email || typeof email !== 'string') return '';
    const namePart = email.split('@')[0] || '';
    const tokens = namePart.replace(/[._-]+/g, ' ').split(' ').filter(Boolean);
    if (tokens.length === 0) return email;
    const titleCased = tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
    return titleCased;
  };
  
  // State të përbashkët për të dhënat e transaksioneve
  const [transaksionet, setTransaksionet] = useState(initialTransaksionet);
  
  // State për totalin e të ardhurave - vlera fillestare 0
  const [totalIncome, setTotalIncome] = useState(0);
  
  // State për të ruajtur listën e të ardhurave
  const [incomes, setIncomes] = useState([]);

  // Funksioni që thirret kur përdoruesi bën login
  // Merr emrin e përdoruesit dhe e vendos në state, pastaj e dërgon në dashboard
  const handleLogin = (email) => {
    setLoggedInUser({ email, displayName: deriveDisplayName(email) });
    setPage('dashboard');
  };

  // Kontrolli i faqes së Transaksioneve
  // Nëse përdoruesi është loguar dhe ka zgjedhur faqen e transaksioneve
  if (page === 'transaksionet' && loggedInUser) {
    return <Transaksionet
      currentPage={page}
      onNavigate={setPage}
      transaksionet={transaksionet}
      setTransaksionet={setTransaksionet}
    />;
  }

  // Kontrolli i faqes së Qëllimeve
  // Nëse përdoruesi është loguar dhe ka zgjedhur faqen e qëllimeve
  if (page === 'qellimet' && loggedInUser) {
    return <Qellimet
      currentPage={page}
      onNavigate={setPage}
    />;
  }

  // Kontrolli i faqes së AIChat
  // Nëse përdoruesi është loguar dhe ka zgjedhur faqen e AIChat
  if (page === 'aichat' && loggedInUser) {
    return <AIChat
      currentPage={page}
      onNavigate={setPage}
    />;
  }

  // Kontrolli i faqes së Settings
  // Nëse përdoruesi është loguar dhe ka zgjedhur faqen e Settings
  if (page === 'settings' && loggedInUser) {
    return <Settings
      currentPage={page}
      onNavigate={setPage}
      loggedInUser={loggedInUser}
    />;
  }

  // Kontrolli i faqes së Help
  // Nëse përdoruesi është loguar dhe ka zgjedhur faqen e Help
  if (page === 'help' && loggedInUser) {
    return <Help
      currentPage={page}
      onNavigate={setPage}
    />;
  }

  // Kontrolli i faqes së Dashboard
  // Nëse përdoruesi është loguar dhe është në faqen kryesore
  if (page === 'dashboard' && loggedInUser) {
    return <HomeDashboard
      onGoToTransaksionet={() => setPage('transaksionet')}
      onNavigate={setPage}
      transaksionet={transaksionet}
      setTransaksionet={setTransaksionet}
      totalIncome={totalIncome}
      setTotalIncome={setTotalIncome}
      incomes={incomes}
      setIncomes={setIncomes}
      loggedInUser={loggedInUser}
    />;
  }

  // Kthimi i komponentit kryesor për faqet e autentifikimit
  return (
    <>
      {/* Div për efektin e blur në background */}
      <div className="background-blur"></div>
      
      {/* Layout-i i autentifikimit që përmban formularët */}
      <AuthLayout>
        {/* Kontrolli i faqes së login */}
        {page === 'login' && (
          <LoginForm 
            onSwitch={() => setPage('register')} // Funksioni për të kaluar në regjistrim
            onForgotPassword={() => setPage('forgot')} // Funksioni për të kaluar në "Harruat fjalëkalimin"
            onLogin={handleLogin} // Funksioni që thirret kur bëhet login
          />
        )}
        
        {/* Kontrolli i faqes së regjistrimit */}
        {page === 'register' && (
          <RegisterForm onSwitch={() => setPage('login')} />
        )}
        
        {/* Kontrolli i faqes së "Harruat fjalëkalimin" */}
        {page === 'forgot' && (
          <ForgotPasswordForm onBack={() => setPage('login')} />
        )}
      </AuthLayout>
    </>
  );
}

// Eksportimi i komponentit App për ta përdorur në index.js
export default App;