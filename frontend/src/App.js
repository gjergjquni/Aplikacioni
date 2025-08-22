// frontend/src/App.js

import React, { useState, useEffect } from 'react';
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

function App() {
  const [page, setPage] = useState('login');
  // This state will now hold the logged-in user object, or null
  const [user, setUser] = useState(null);
  // This state is for showing a loading message on startup
  const [isLoading, setIsLoading] = useState(true);

  // This runs ONCE when the app starts up.
  // It checks localStorage to see if the user is already logged in from a previous session.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // If we find a token and user info, we consider the user logged in
      setUser(JSON.parse(storedUser));
      setPage('dashboard');
    }
    
    setIsLoading(false); // Stop loading, we now know if user is logged in or not
  }, []); // The empty array [] means this effect runs only once.


  // All the app's shared data will live here
  const [transaksionet, setTransaksionet] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomes, setIncomes] = useState([]);

  // This function is called by LoginForm on successful login
  const handleLogin = (userData, token) => {
    // 1. Save the token and user info to localStorage for persistence
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2. Update the app's state
    setUser(userData);
    setPage('dashboard');
  };
  
  // If the app is still checking the session, show a loading message
  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading...</div>;
  }

  // --- Main Router Logic ---

  // If a user IS logged in, render the dashboard pages
  if (user) {
    switch (page) {
      case 'dashboard':
        return <HomeDashboard onNavigate={setPage} loggedInUser={user} transaksionet={transaksionet} setTransaksionet={setTransaksionet} totalIncome={totalIncome} setTotalIncome={setTotalIncome} incomes={incomes} setIncomes={setIncomes} />;
      case 'transaksionet':
        return <Transaksionet onNavigate={setPage} currentPage={page} transaksionet={transaksionet} setTransaksionet={setTransaksionet} />;
      case 'qellimet':
        return <Qellimet onNavigate={setPage} currentPage={page} />;
      case 'aichat':
        return <AIChat onNavigate={setPage} currentPage={page} />;
      case 'settings':
        return <Settings onNavigate={setPage} currentPage={page} loggedInUser={user} />;
      case 'help':
        return <Help onNavigate={setPage} currentPage={page} />;
      default:
        // Fallback to dashboard if something goes wrong
        return <HomeDashboard onNavigate={setPage} loggedInUser={user} />;
    }
  }

  // If NO user is logged in, render the authentication pages
  return (
    <>
      <div className="background-blur"></div>
      <AuthLayout>
        {page === 'login' && <LoginForm onSwitch={() => setPage('register')} onForgotPassword={() => setPage('forgot')} onLogin={handleLogin} />}
        {page === 'register' && <RegisterForm onSwitch={() => setPage('login')} />}
        {page === 'forgot' && <ForgotPasswordForm onBack={() => setPage('login')} />}
      </AuthLayout>
    </>
  );
}

export default App;