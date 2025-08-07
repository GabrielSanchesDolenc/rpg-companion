import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotarSpelljammer.css';

export default function NotarSpelljammer() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#333');
  const [brushSize, setBrushSize] = useState(4);
  const [notes, setNotes] = useState('');

  // Carrega nota do banco
  useEffect(() => {
  if (user) {
    fetch(`http://localhost:3001/anotacao/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.texto) setNotes(data.texto);
        if (data?.desenho) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = data.desenho;
        }
      });
  }
}, []);

  // Salva no banco
const salvarNota = () => {
  if (!user) return alert('Você precisa estar logado para salvar.');

  const canvas = canvasRef.current;
  const desenhoBase64 = canvas.toDataURL('image/png'); // 👈 transforma o desenho em imagem

  fetch('http://localhost:3001/anotacao', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: user.id,
      texto: notes,
      desenho: desenhoBase64
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Anotação e desenho salvos com sucesso!');
      } else {
        alert('Erro ao salvar anotação.');
      }
    })
    .catch(err => {
      console.error('Erro no fetch:', err);
      alert('Erro ao conectar com o servidor.');
    });
};

  // Monta canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const setSize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = 400;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx;

    return () => window.removeEventListener('resize', setSize);
  }, []);

  // Atualiza pincel
  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = brushColor;
    ctxRef.current.lineWidth = brushSize;
  }, [brushColor, brushSize]);

  // Canvas eventos
  const handleMouseDown = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const handleMouseMove = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const handleMouseUp = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <header className="header">
        <div className="title">RPG COMPANION</div>
        <div className="nav-buttons">
          {user && (
            <div className="user-info">
              <div className="status-circle" />
              <span>{user.username}</span>
            </div>
          )}
          <Link to="/spelljammer" className="nav-link">Ficha Spelljammer</Link>
          <Link to="/" className="nav-link">Home</Link>
        </div>
      </header>

      <main className="notar-container">
        <section className="notes-section">
          <h2>Bloco de Notas</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escreva aqui suas anotações..."
          />
          <button onClick={salvarNota}>Salvar Notas</button>
        </section>

        <section className="draw-section">
          <h2>Desenho Livre</h2>
          <div className="tools">
            <label>
              Cor:
              <input
                type="color"
                value={brushColor}
                onChange={e => setBrushColor(e.target.value)}
              />
            </label>
            <label>
              Tamanho:
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={e => setBrushSize(+e.target.value)}
              />
            </label>
            <button onClick={clearCanvas}>Limpar</button>
          </div>
          <canvas
            ref={canvasRef}
            className="draw-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </section>
      </main>
    </>
  );
}
