const express = require('express');
const router = express.Router();
const db = require('./db');

// Rota de registro
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    function (err) {
      if (err) return res.status(400).json({ error: 'Usuário já existe' });
      res.json({ id: this.lastID, username });
    }
  );
});

// Rota de login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      if (!row) return res.status(401).json({ error: 'Credenciais inválidas' });

      res.json({ message: 'Login bem-sucedido', user: row });
    }
  );
});



router.post('/ficha', (req, res) => {
  const { usuario_id, dados } = req.body;
  db.run(
    'INSERT OR REPLACE INTO fichas (usuario_id, dados) VALUES (?, ?)',
    [usuario_id, JSON.stringify(dados)],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar ficha' });
      res.json({ success: true });
    }
  );
});

router.get('/ficha/:usuario_id', (req, res) => {
  db.get('SELECT * FROM fichas WHERE usuario_id = ?', [req.params.usuario_id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar ficha' });
    if (!row) return res.json(null);
    res.json({ id: row.id, dados: JSON.parse(row.dados) });
  });
});

router.post('/anotacao', (req, res) => {
  const { usuario_id, texto, desenho } = req.body;

  db.run(`
    INSERT INTO anotacoes (usuario_id, texto, desenho)
    VALUES (?, ?, ?)
    ON CONFLICT(usuario_id) DO UPDATE
    SET texto = excluded.texto,
        desenho = excluded.desenho
  `, [usuario_id, texto, desenho], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao salvar anotação' });
    res.json({ success: true });
  });
});

router.get('/anotacao/:usuario_id', (req, res) => {
  db.get('SELECT * FROM anotacoes WHERE usuario_id = ?', [req.params.usuario_id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar anotação' });
    res.json(row || { texto: '', desenho: null });
  });
});



module.exports = router;
