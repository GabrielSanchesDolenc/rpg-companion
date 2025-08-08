import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginModal from './components/LoginModal';
import Spelljammer from './pages/spelljammer';
import NotarSpelljammer from './pages/notar_spelljammer';
import HyakkiYagyo from './pages/hyakki_yagyo';
import SkillTree from './pages/Hyakki_Arvore';

// Componente principal da tela inicial
function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginClose = (loggedIn) => {
    setShowLogin(false);
    if (loggedIn) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  };

  return (
    <>
      <header className="header">
        <div className="title">RPG COMPANION</div>
        <div className="nav-buttons">
                    {user ? (
            <div className="user-info">
              <div className="status-circle"></div>
              <span>{user.username}</span>
              <button className="logout-button" onClick={() => {
                localStorage.removeItem('user');
                window.location.reload();
              }}>Sair</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => setShowLogin(true)}>Login</button>
          )}
          </div>
      </header>

      <main className="main-content">
        <h1>Choose Your Campaign</h1>
        <div className="campaign-grid">
          <button className="campaign-button" onClick={() => navigate('/spelljammer')}>Spelljammer</button>
          <button className="campaign-button" onClick={() => navigate('/hyakki_yagyo')}>hyakki yagyo</button>
          <button className="campaign-button" onClick={() => navigate('/hyakki_arvore')}>Árvore de Habilidades</button>
        </div>
      </main>

      {showLogin && <LoginModal onClose={handleLoginClose} />}
    </>
  );
}

// Componente App com rotas
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/spelljammer" element={<Spelljammer />} />
        <Route path="/notar_spelljammer" element={<NotarSpelljammer />} />
        <Route path="/hyakki_yagyo" element={<HyakkiYagyo />} />
        <Route path="/hyakki_arvore" element={<SkillTree />} />
      </Routes>
    </Router>
  );
}

export default App;
