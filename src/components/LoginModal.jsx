import { useState } from 'react';
import './LoginModal.css';

function LoginModal({ onClose }) {
  const [tab, setTab] = useState('login'); // 'login' ou 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

 const handleSubmit = async () => {
  const url = `http://localhost:3001/${tab}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    setMessage(`✅ ${tab === 'login' ? 'Login' : 'Cadastro'} bem-sucedido!`);
    localStorage.setItem('user', JSON.stringify(data.user));
    onClose(true);
  } else {
    setMessage(`❌ ${data.error || 'Erro no servidor'}`);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="tabs">
          <button onClick={() => setTab('login')} className={tab === 'login' ? 'active' : ''}>Login</button>
          <button onClick={() => setTab('register')} className={tab === 'register' ? 'active' : ''}>Registrar</button>
        </div>
        <div className="form">
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSubmit}>{tab === 'login' ? 'Entrar' : 'Cadastrar'}</button>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
