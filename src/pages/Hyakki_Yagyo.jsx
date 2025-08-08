import React, { useState, useEffect } from 'react';
import './style.css';

const user = JSON.parse(localStorage.getItem('user'));

// Componente para barras de status interativas
const StatusBar = ({ label, current, max, color, onChange }) => {
  return (
    <div className="status-bar">
      <div className="status-label">
        <span>{label}:</span>
        <input
          type="number"
          min="0"
          max={max}
          value={current}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="status-input"
        />
        <span>/{max}</span>
      </div>
      <div className="bar-container">
        <div 
          className="bar-fill" 
          style={{ 
            width: `${(current / max) * 100}%`, 
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
};

// Componente para atributos
const AttributeInput = ({ label, value, onChange }) => {
  return (
    <div className="attribute-input">
      <label>{label}</label>
      <div className="attribute-values">
        <input
          type="number"
          className="input text-center"
          value={value.total}
          onChange={(e) => onChange('total', parseInt(e.target.value) || 0)}
        />
        <span>/</span>
        <input
          type="number"
          className="input text-center damage"
          value={value.damage}
          onChange={(e) => onChange('damage', parseInt(e.target.value) || 0)}
        />
        <span>= {value.total - value.damage}</span>
      </div>
    </div>
  );
};

// Componente para local de armadura
const ArmorLocation = ({ location, value, onChange }) => {
  return (
    <div className="armor-location">
      <label>{location}</label>
      <input
        type="number"
        min="0"
        className="input text-center"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      />
    </div>
  );
};

// Componente para armas
const WeaponRow = ({ weapon, index, onChange, onRemove }) => {
  return (
    <tr>
      <td>
        <input
          type="text"
          className="input"
          value={weapon.name}
          onChange={(e) => onChange(index, 'name', e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          className="input"
          value={weapon.damage}
          onChange={(e) => onChange(index, 'damage', e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          className="input text-center"
          value={weapon.alcance}
          onChange={(e) => onChange(index, 'alcance', e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          className="input text-center"
          value={weapon.prec}
          onChange={(e) => onChange(index, 'prec', e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          className="input text-center"
          value={weapon.st}
          onChange={(e) => onChange(index, 'st', e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          className="input text-center"
          value={weapon.rco}
          onChange={(e) => onChange(index, 'rco', e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          className="input text-center"
          value={weapon.custo}
          onChange={(e) => onChange(index, 'custo', e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          className="input"
          value={weapon.peso}
          onChange={(e) => onChange(index, 'peso', e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          className="input"
          value={weapon.notes}
          onChange={(e) => onChange(index, 'notes', e.target.value)}
        />
      </td>
      <td>
        <button className="btn btn-danger" onClick={() => onRemove(index)}>Remover</button>
      </td>
    </tr>
  );
};

// Componente reutilizável para listas tipo tabela
const TableSection = ({ title, items, setItems, hasLevel = false, columns = [] }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    level: hasLevel ? 1 : undefined,
    points: hasLevel ? 1 : undefined
  });

  const handleAddOrSave = () => {
    if (!formData.name.trim()) return;
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = formData;
      setItems(updated);
      setEditingIndex(null);
    } else {
      setItems([...items, formData]);
    }
    setFormData({ 
      name: '', 
      description: '',
      level: hasLevel ? 1 : undefined,
      points: hasLevel ? 1 : undefined
    });
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(items[index]);
  };

  const handleRemove = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  return (
    <div className="table-section">
      <h2>{title}</h2>
      <div className="table-form">
        <input
          type="text"
          placeholder="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Descrição"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        {hasLevel && (
          <>
            <input
              type="number"
              placeholder="Nível"
              min="1"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
            />
            <input
              type="number"
              placeholder="Pontos"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
            />
          </>
        )}
        <button className="btn btn-primary" onClick={handleAddOrSave}>
          {editingIndex !== null ? 'Salvar' : '+ Adicionar'}
        </button>
      </div>
      <table className="item-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            {hasLevel && <th>Nível</th>}
            {hasLevel && <th>Pontos</th>}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={hasLevel ? 5 : 3} className="empty-row">Nenhum item adicionado</td>
            </tr>
          )}
          {items.map((item, index) => (
            <tr key={index}>
              <td title={item.description}>{item.name}</td>
              <td>{item.description}</td>
              {hasLevel && <td>{item.level}</td>}
              {hasLevel && <td>{item.points}</td>}
              <td>
                <button className="btn btn-warning" onClick={() => handleEdit(index)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleRemove(index)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const GURPSCharacterSheet = () => {
  const [characterInfo, setCharacterInfo] = useState({
    name: '',
    player: '',
    race: '',
    campaign: '',
    appearance: '',
    points: '',
    history: '',
    height: '',
    weight: '',
    sizeModifier: '',
    age: '',
    culturalFamiliarity: '',
    reactionModifiers: '',
    reputation: '',
    status: '',
  });

  const [movement, setMovement] = useState({
    cargaBase: '',
    velBasica: '',
    deslBasico: '',
    esquiva: '',
  });

  const [defenses, setDefenses] = useState({
    esquiva: 0,
    aparar: 0,
    bloqueio: 0,
    intimidacao: 0,
    carisma: 0,
    resistencia: 0
  });

  // estados das tabelas
  const [vantagens, setVantagens] = useState([]);
  const [desvantagens, setDesvantagens] = useState([]);
  const [pericias, setPericias] = useState([]);
  const [armasCorpo, setArmasCorpo] = useState([]);
  const [armasDistancia, setArmasDistancia] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [magias, setMagias] = useState([]);
  const [tecnicas, setTecnicas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [condicoes, setCondicoes] = useState([]);
  const [armaduras, setArmaduras] = useState([]);

  // Atributos básicos
  const [atributos, setAtributos] = useState({
    ST: { total: 10, damage: 0 }, // Força
    DX: { total: 10, damage: 0 }, // Destreza
    IQ: { total: 10, damage: 0 }, // Inteligência
    HT: { total: 10, damage: 0 },  // Saúde
  });

  // Pontos de vida e energia
  const [pontosVida, setPontosVida] = useState({ current: 10, max: 10 });
  const [pontosFadiga, setPontosFadiga] = useState({ current: 10, max: 10 });
  const [pontosYoujutsu, setPontosYoujutsu] = useState({ current: 0, max: 0 });

  // Armadura por local
  const [armaduraLocais, setArmaduraLocais] = useState({
    cabeca: 0,
    tronco: 0,
    bracos: 0,
    maos: 0,
    pernas: 0,
    pes: 0
  });

  // Imagem do personagem
  const [characterImage, setCharacterImage] = useState(null);

  // carregar do backend
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3001/ficha/hyakki_yagyo/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data?.dados) {
            setCharacterInfo(data.dados.characterInfo || {});
            setMovement(data.dados.movement || {});
            setDefenses(data.dados.defenses || {});
            setVantagens(data.dados.vantagens || []);
            setDesvantagens(data.dados.desvantagens || []);
            setPericias(data.dados.pericias || []);
            setArmasCorpo(data.dados.armasCorpo || []);
            setArmasDistancia(data.dados.armasDistancia || []);
            setEquipamentos(data.dados.equipamentos || []);
            setMagias(data.dados.magias || []);
            setTecnicas(data.dados.tecnicas || []);
            setHabilidades(data.dados.habilidades || []);
            setCondicoes(data.dados.condicoes || []);
            setArmaduras(data.dados.armaduras || []);
            setAtributos(data.dados.atributos || {
              ST: { total: 10, damage: 0 },
              DX: { total: 10, damage: 0 },
              IQ: { total: 10, damage: 0 },
              HT: { total: 10, damage: 0 }
            });
            setPontosVida(data.dados.pontosVida || { current: 10, max: 10 });
            setPontosFadiga(data.dados.pontosFadiga || { current: 10, max: 10 });
            setPontosYoujutsu(data.dados.pontosYoujutsu || { current: 0, max: 0 });
            setArmaduraLocais(data.dados.armaduraLocais || {
              cabeca: 0,
              tronco: 0,
              bracos: 0,
              maos: 0,
              pernas: 0,
              pes: 0
            });
            setCharacterImage(data.dados.characterImage || null);
          }
        });
    }
  }, []);

  const handleSave = () => {
    if (!user) return alert('Faça login para salvar a ficha.');
    const dados = {
      characterInfo,
      movement,
      defenses,
      vantagens,
      desvantagens,
      pericias,
      armasCorpo,
      armasDistancia,
      equipamentos,
      magias,
      tecnicas,
      habilidades,
      condicoes,
      armaduras,
      atributos,
      pontosVida,
      pontosFadiga,
      pontosYoujutsu,
      armaduraLocais,
      characterImage
    };
    fetch('http://localhost:3001/ficha/hyakki_yagyo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: user.id, dados })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) alert('Ficha salva com sucesso!');
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacterImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddWeapon = (setter) => {
    setter([...setter, {
      name: '',
      damage: '',
      alcance: '',
      prec: '',
      st: '',
      rco: '',
      custo: '',
      peso: '',
      notes: ''
    }]);
  };

  const handleWeaponChange = (weapons, setter, index, field, value) => {
    const updated = [...weapons];
    updated[index][field] = value;
    setter(updated);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Ficha de Personagem — GURPS Hyakki Yagyō</h1>
          {user && (
            <button className="btn btn-primary save-ficha" onClick={handleSave}>
              Salvar Ficha
            </button>
          )}
        </div>

        <div className="character-sheet-grid">
          {/* Coluna Esquerda */}
          <div className="left-column">
            {/* Imagem do Personagem */}
            <div className="section">
              <h2>Imagem do Personagem</h2>
              <div className="character-image-container">
                {characterImage ? (
                  <img src={characterImage} alt="Personagem" className="character-image" />
                ) : (
                  <div className="image-placeholder">Sem imagem</div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="image-upload"
                />
              </div>
            </div>

            {/* Atributos básicos */}
            <div className="section">
              <h2>Atributos Básicos</h2>
              <div className="attributes-grid">
                {Object.entries(atributos).map(([key, value]) => (
                  <AttributeInput
                    key={key}
                    label={key}
                    value={value}
                    onChange={(field, val) => setAtributos({
                      ...atributos,
                      [key]: { ...value, [field]: val }
                    })}
                  />
                ))}
              </div>
            </div>

            {/* Pontos de Vida, Fadiga e Youjutsu */}
            <div className="section">
              <h2>Pontos de Vida e Energia</h2>
              <div className="status-bars">
                <StatusBar 
                  label="Pontos de Vida" 
                  current={pontosVida.current} 
                  max={pontosVida.max} 
                  color="#e63946"
                  onChange={(val) => setPontosVida({ ...pontosVida, current: val })}
                />
                <StatusBar 
                  label="Pontos de Fadiga" 
                  current={pontosFadiga.current} 
                  max={pontosFadiga.max} 
                  color="#4a86e8"
                  onChange={(val) => setPontosFadiga({ ...pontosFadiga, current: val })}
                />
                <StatusBar 
                  label="Energia Esotérica" 
                  current={pontosYoujutsu.current} 
                  max={pontosYoujutsu.max} 
                  color="#9d4edd"
                  onChange={(val) => setPontosYoujutsu({ ...pontosYoujutsu, current: val })}
                />
              </div>
            </div>

            {/* Defesas */}
            <div className="section">
              <h2>Defesas</h2>
              <div className="section-grid">
                {Object.entries(defenses).map(([key, value]) => (
                  <div key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input
                      type="number"
                      className="input text-center"
                      value={value}
                      onChange={(e) => setDefenses({ ...defenses, [key]: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Armadura por Local */}
            <div className="section">
              <h2>Armadura por Local</h2>
              <div className="armor-grid">
                {Object.entries(armaduraLocais).map(([key, value]) => (
                  <ArmorLocation
                    key={key}
                    location={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={value}
                    onChange={(val) => setArmaduraLocais({ ...armaduraLocais, [key]: val })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="right-column">
            {/* Informações básicas */}
            <div className="section">
              <h2>Informações Básicas</h2>
              <div className="section-grid">
                {[
                  { label: 'Nome', key: 'name' },
                  { label: 'Jogador', key: 'player' },
                  { label: 'Campanha', key: 'campaign' },
                  { label: 'Raça/Espécie', key: 'race' },
                  { label: 'Aparência', key: 'appearance' },
                  { label: 'Pontos Totais', key: 'points', type: 'number' },
                  { label: 'Altura', key: 'height' },
                  { label: 'Peso', key: 'weight' },
                  { label: 'Mod. de Tamanho', key: 'sizeModifier' },
                  { label: 'Idade', key: 'age' },
                  { label: 'Familiaridades Culturais', key: 'culturalFamiliarity' },
                  { label: 'Modificadores de Reação', key: 'reactionModifiers' },
                  { label: 'Reputação', key: 'reputation' },
                  { label: 'Status', key: 'status' },
                ].map(field => (
                  <div key={field.key}>
                    <label>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      className="input"
                      value={characterInfo[field.key]}
                      onChange={(e) => setCharacterInfo({ ...characterInfo, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Deslocamento */}
            <div className="section">
              <h2>Deslocamento</h2>
              <div className="section-grid">
                {[
                  { label: 'Carga Base', key: 'cargaBase' },
                  { label: 'Velocidade Básica', key: 'velBasica' },
                  { label: 'Deslocamento Básico', key: 'deslBasico' },
                  { label: 'Esquiva', key: 'esquiva' },
                ].map(field => (
                  <div key={field.key}>
                    <label>{field.label}</label>
                    <input
                      type="number"
                      className="input text-center"
                      value={movement[field.key]}
                      onChange={(e) => setMovement({ ...movement, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Seções tipo tabela */}
            <TableSection title="Vantagens" items={vantagens} setItems={setVantagens} />
            <TableSection title="Desvantagens" items={desvantagens} setItems={setDesvantagens} />
            <TableSection title="Perícias" items={pericias} setItems={setPericias} hasLevel={true} />

            {/* Armaduras */}
            <div className="section">
              <h2>Armaduras</h2>
              <table className="item-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Posição</th>
                    <th>Custo</th>
                    <th>Peso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {armaduras.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-row">Nenhuma armadura adicionada</td>
                    </tr>
                  )}
                  {armaduras.map((armadura, index) => (
                    <tr key={index}>
                      <td>{armadura.name}</td>
                      <td>{armadura.position}</td>
                      <td>{armadura.cost}</td>
                      <td>{armadura.weight}</td>
                      <td>
                        <button className="btn btn-warning">Editar</button>
                        <button className="btn btn-danger">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="btn btn-primary">+ Adicionar Armadura</button>
            </div>

            {/* Armas Corpo a Corpo */}
            <div className="section">
              <h2>Armas de Combate Corpo a Corpo</h2>
              <table className="weapon-table">
                <thead>
                  <tr>
                    <th>Arma</th>
                    <th>Dano</th>
                    <th>Alcance</th>
                    <th>Prec</th>
                    <th>ST</th>
                    <th>RCO</th>
                    <th>Custo</th>
                    <th>Peso</th>
                    <th>Notas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {armasCorpo.length === 0 && (
                    <tr>
                      <td colSpan="10" className="empty-row">Nenhuma arma adicionada</td>
                    </tr>
                  )}
                  {armasCorpo.map((weapon, index) => (
                    <WeaponRow
                      key={index}
                      weapon={weapon}
                      index={index}
                      onChange={(i, field, value) => handleWeaponChange(armasCorpo, setArmasCorpo, i, field, value)}
                      onRemove={(i) => {
                        const updated = [...armasCorpo];
                        updated.splice(i, 1);
                        setArmasCorpo(updated);
                      }}
                    />
                  ))}
                </tbody>
              </table>
              <button 
                className="btn btn-primary"
                onClick={() => handleAddWeapon(setArmasCorpo)}
              >
                + Adicionar Arma
              </button>
            </div>

            {/* Armas à Distância */}
            <div className="section">
              <h2>Armas de Combate à Distância</h2>
              <table className="weapon-table">
                <thead>
                  <tr>
                    <th>Arma</th>
                    <th>Dano</th>
                    <th>Alcance</th>
                    <th>Prec</th>
                    <th>ST</th>
                    <th>RCO</th>
                    <th>Custo</th>
                    <th>Peso</th>
                    <th>Notas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {armasDistancia.length === 0 && (
                    <tr>
                      <td colSpan="10" className="empty-row">Nenhuma arma adicionada</td>
                    </tr>
                  )}
                  {armasDistancia.map((weapon, index) => (
                    <WeaponRow
                      key={index}
                      weapon={weapon}
                      index={index}
                      onChange={(i, field, value) => handleWeaponChange(armasDistancia, setArmasDistancia, i, field, value)}
                      onRemove={(i) => {
                        const updated = [...armasDistancia];
                        updated.splice(i, 1);
                        setArmasDistancia(updated);
                      }}
                    />
                  ))}
                </tbody>
              </table>
              <button 
                className="btn btn-primary"
                onClick={() => handleAddWeapon(setArmasDistancia)}
              >
                + Adicionar Arma
              </button>
            </div>

            {/* Histórico / Notas */}
            <div className="section">
              <h2>Histórico / Notas</h2>
              <textarea
                className="input"
                value={characterInfo.history}
                onChange={(e) => setCharacterInfo({ ...characterInfo, history: e.target.value })}
                rows={6}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GURPSCharacterSheet;