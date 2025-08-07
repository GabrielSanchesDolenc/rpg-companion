const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao conectar ao BD:', err);
  else console.log('Conectado ao SQLite');
});



// Cria a tabela de usuários
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

// Cria a tabela de fichas
db.run(`
  CREATE TABLE IF NOT EXISTS fichas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE,
    dados TEXT,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
  );
`);

// Cria a tabela de anotações
db.run(`
  CREATE TABLE IF NOT EXISTS anotacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE,
    texto TEXT,
    desenho TEXT, -- pode usar TEXT para base64
    FOREIGN KEY (usuario_id) REFERENCES users(id)
  );
`);




module.exports = db;
