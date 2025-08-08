// Spelljammer.jsx

import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const user = JSON.parse(localStorage.getItem('user'));

const handleLogout = () => {
  localStorage.removeItem('user');
  window.location.reload();
};

const ABILITIES = [
  'força',
  'destreza',
  'constituição',
  'inteligência',
  'sabedoria',
  'carisma'
];

const SKILLS = [
  'Atletismo',
  'Acrobacia',
  'Furtividade',
  'Prestidigitação',
  'Arcanismo',
  'História',
  'Investigação',
  'Natureza',
  'Religião',
  'Adestrar Animais',
  'Intuição',
  'Medicina',
  'Percepção',
  'Sobrevivência',
  'Atuação',
  'Enganação',
  'Intimidação',
  'Persuasão'
];

const SKILL_TO_ABILITY = {
  Atletismo:          'força',
  Acrobacia:          'destreza',
  Furtividade:        'destreza',
  Prestidigitação:    'destreza',
  Arcanismo:          'inteligência',
  História:           'inteligência',
  Investigação:       'inteligência',
  Natureza:           'inteligência',
  Religião:           'inteligência',
  'Adestrar Animais': 'sabedoria',
  Intuição:           'sabedoria',
  Medicina:           'sabedoria',
  Percepção:          'sabedoria',
  Sobrevivência:      'sabedoria',
  Atuação:            'carisma',
  Enganação:          'carisma',
  Intimidação:        'carisma',
  Persuasão:          'carisma'
};


function computeModifierNum(score) {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function computeModifier(score) {
  return formatModifier(computeModifierNum(score));
}

function computeProficiencyBonus(level) {
  const lvl = Math.min(Math.max(level, 1), 20);
  if (lvl <= 4) return 2;
  if (lvl <= 8) return 3;
  if (lvl <= 12) return 4;
  if (lvl <= 16) return 5;
  return 6;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

export default function Spelljammer() {
  const [character, setCharacter] = useState({
    classLevel:        1,
    background:        '',
    player:            '',
    race:              '',
    alignment:         '',
    exp:               '',
    inspiration:       false,
    armorClass:        '',
    initiative:        '',
    speed:             '',
    maxHp:             0,
    currentHp:         0,
    tempHp:            '',
    hitDice:           '',
    photoUrl:          '',
    deathSaves:        { success: 0, failure: 0 },
    abilities:         ABILITIES.reduce((acc, ab) => ({ ...acc, [ab]: 8 }), {}),
    savingThrows:      ABILITIES.reduce((acc, ab) => ({ ...acc, [ab]: false }), {}),
    skills:            SKILLS.reduce((acc, sk) => ({ ...acc, [sk]: false }), {}),
    passivePerception: '',
    languages:         '',
    attacksList:       [],
    equipment:         '',
    traits:            '',
    ideals:            '',
    bonds:             '',
    flaws:             '',
    notes:             '',
  });

  // Estados do tooltip movidos para DENTRO do componente
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipContent, setTooltipContent] = useState({ name: '', description: '' });

  // Funções do tooltip movidas para DENTRO do componente
  const handleShowTooltip = (idx) => {
    const attack = character.attacksList[idx];
    if (!attack || !attack.description) return;
    
    // Usar querySelectorAll para maior confiabilidade
    const elements = document.querySelectorAll('.attack-title');
    if (idx >= elements.length) return;
    
    const element = elements[idx];
    const rect = element.getBoundingClientRect();

    setTooltipContent({
      name: attack.name,
      description: attack.description
    });
    
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX
    });
    
    setTooltipVisible(true);
  };

  const handleHideTooltip = () => {
    setTooltipVisible(false);
  };
  
  const handleChange = (field, value) =>
    setCharacter(prev => ({ ...prev, [field]: value }));

  const handleNestedChange = (section, field, value) =>
    setCharacter(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));

  const handleNumberChange = field => e => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;

    if (field === 'currentHp') {
      val = clamp(val, 0, character.maxHp);
    }

    if (field === 'maxHp') {
      val = clamp(val, 0, 9999);
      // if currentHp > new max, reduce it too
      setCharacter(prev => ({
        ...prev,
        maxHp: val,
        currentHp: Math.min(prev.currentHp, val)
      }));
      return;
    }

    handleChange(field, val);
  };

  const handleAbilityChange = ability => e => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    val = clamp(val, 8, 30);
    handleNestedChange('abilities', ability, val);
  };

  const handleLevelChange = e => {
    let lvl = parseInt(e.target.value, 10);
    if (isNaN(lvl)) return;
    lvl = clamp(lvl, 1, 20);
    setCharacter(prev => ({ ...prev, classLevel: lvl }));
  };

  const levelNum     = clamp(parseInt(character.classLevel, 10) || 1, 1, 20);
  const profBonusNum = computeProficiencyBonus(levelNum);
  const profBonusStr = formatModifier(profBonusNum);

  // percentual para a barra de vida
  const hpPercent = character.maxHp > 0
    ? (character.currentHp / character.maxHp) * 100
    : 0;

  // 1. Adicionar um novo item em modo edição
    const handleAddAttack = () => {
  setCharacter(prev => ({
    ...prev,
    attacksList: [
      ...prev.attacksList,
      { name: '', description: '', isEditing: true } // Removido isOpen
    ]
  }));
};
  // 2. Atualizar um item (nome ou descrição)
    const handleAttackChange = (idx, field, value) => {
    setCharacter(prev => {
      const list = [...prev.attacksList];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, attacksList: list };
    });
  };
  // 3. Salvar edição de um item (fecha o formulário)
    const handleSaveAttack = idx => {
  setCharacter(prev => {
    const list = [...prev.attacksList];
    list[idx].isEditing = false;
    return { ...prev, attacksList: list };
  });
};
    // 5. Remover item
    const handleRemoveAttack = idx => {
      setCharacter(prev => ({
        ...prev,
        attacksList: prev.attacksList.filter((_, i) => i !== idx)
      }));
    };
    
useEffect(() => {
  if (user) {
    fetch(`http://localhost:3001/ficha/${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data?.dados) {
          setCharacter(prev => ({
            ...prev,
            ...data.dados,
            attacksList: data.dados.attacksList || []
          }));
        }
      });
  }
}, [user]);


  return (
    <>
      <header className="header">
        <div className="title">RPG COMPANION</div>
        <div className="nav-buttons">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/notar_spelljammer" className="nav-link">Notas</Link>

          {user ? (
            <div className="user-info">
              <div className="status-circle" />
              <span>{user.username}</span>
              <button className="logout-button" onClick={handleLogout}>Sair</button>
            </div>
          ) : (
            <button className="login-button" onClick={() => alert('Abra o modal aqui!')}>
              Login
            </button>
          )}
        </div>
      </header>
    <div className="sheet-container">
      {/* Top Section */}
      <div className="top-section">
        <h1>Spelljammer</h1>
                  {user && (
            <button className="save-ficha" onClick={() => {
            fetch('http://localhost:3001/ficha', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuario_id: user.id, dados: character })
            }).then(res => res.json()).then(data => {
              if (data.success) alert('Ficha salva com sucesso!');
            });
          }}>
            Salvar Ficha
          </button>
          )}

        <div className="top-fields">
          <div className="field">
            <label>NÍVEL</label>
            <input
              type="number"
              min="1"
              max="20"
              value={character.classLevel}
              onChange={handleLevelChange}
            />
          </div>
          {['background', 'player', 'race', 'alignment', 'exp'].map(field => (
            <div key={field} className="field">
              <label>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
              <input
                type="text"
                value={character[field]}
                onChange={e => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="columns">
        {/* Left Column: Atributos, TS e Perícias */}
        <div className="column">
          <h2>Atributos</h2>
          <div className="attributes-grid">
            {ABILITIES.map(ab => (
              <div key={ab} className="circle-input">
                <label>{ab.toUpperCase()}</label>
                <input
                  type="number"
                  min="8"
                  max="30"
                  value={character.abilities[ab]}
                  onChange={handleAbilityChange(ab)}
                />
                <input
                  type="text"
                  readOnly
                  value={computeModifier(character.abilities[ab])}
                />
              </div>
            ))}
          </div>

          <h2>Testes de Resistência</h2>
          {ABILITIES.map(ab => {
            const baseMod  = computeModifierNum(character.abilities[ab]);
            const totalMod = baseMod + (character.savingThrows[ab] ? profBonusNum : 0);
            return (
              <div key={ab} className="row-field">
                <label>{ab.toUpperCase()}</label>
                <input
                  type="text"
                  readOnly
                  value={formatModifier(totalMod)}
                />
                <input
                  type="checkbox"
                  checked={character.savingThrows[ab]}
                  onChange={e =>
                    handleNestedChange('savingThrows', ab, e.target.checked)
                  }
                />
              </div>
            );
          })}

          <h2>Perícias</h2>
          {SKILLS.map(skill => {
            const abilityKey = SKILL_TO_ABILITY[skill];
            const baseMod    = computeModifierNum(character.abilities[abilityKey]);
            const totalMod   = baseMod + (character.skills[skill] ? profBonusNum : 0);
            return (
              <div key={skill} className="row-field">
                <label>{skill}</label>
                <input
                  type="text"
                  readOnly
                  value={formatModifier(totalMod)}
                />
                <input
                  type="checkbox"
                  checked={character.skills[skill]}
                  onChange={e =>
                    handleNestedChange('skills', skill, e.target.checked)
                  }
                />
              </div>
            );
          })}

          <label>Percepção Passiva</label>
          <input
            type="text"
            value={character.passivePerception}
            onChange={e => handleChange('passivePerception', e.target.value)}
          />

          <label>Idiomas e Proficiências</label>
          <textarea
            value={character.languages}
            onChange={e => handleChange('languages', e.target.value)}
          />
        </div>

        {/* Middle Column: Combate */}
        <div className="column">
          <h2>Combate</h2>

          <label>Bônus de Proficiência</label>
          <input type="text" readOnly value={profBonusStr} />

          <label>Classe de Armadura</label>
          <input
            type="text"
            value={character.armorClass}
            onChange={e => handleChange('armorClass', e.target.value)}
          />

          <label>Iniciativa</label>
          <input
            type="text"
            value={character.initiative}
            onChange={e => handleChange('initiative', e.target.value)}
          />

          <label>Velocidade</label>
          <input
            type="text"
            value={character.speed}
            onChange={e => handleChange('speed', e.target.value)}
          />

          {/* Nova seção de foto */}
          <label>Foto do Personagem (URL)</label>
          <input
            type="text"
            placeholder="cole a URL da imagem"
            value={character.photoUrl}
            onChange={e => handleChange('photoUrl', e.target.value)}
          />
          {character.photoUrl && (
            <img
              className="character-photo"
              src={character.photoUrl}
              alt="Foto do Personagem"
            />
          )}

          {/* Inputs de PV */}
          <label>PV Máximo</label>
          <input
            type="number"
            min="0"
            value={character.maxHp}
            onChange={handleNumberChange('maxHp')}
          />

          <label>Pontos de Vida Atuais</label>
          <input
            type="number"
            min="0"
            value={character.currentHp}
            onChange={handleNumberChange('currentHp')}
          />

          {/* Barra de vida */}
          <div className="hp-bar">
            <div
              className="hp-fill"
              style={{ width: `${hpPercent}%` }}
            />
            <span className="hp-text">
              {character.currentHp} / {character.maxHp}
            </span>
          </div>

          <label>PV Temporários</label>
          <input
            type="text"
            value={character.tempHp}
            onChange={e => handleChange('tempHp', e.target.value)}
          />

          <label>Dado de Vida</label>
          <input
            type="text"
            value={character.hitDice}
            onChange={e => handleChange('hitDice', e.target.value)}
          />

          <label>Death Saves</label>
          <div className="death-saves">
            <span>Sucessos:</span>
            <input
              type="number"
              value={character.deathSaves.success}
              onChange={e =>
                handleNestedChange('deathSaves', 'success', parseInt(e.target.value, 10))
              }
            />
            <span>Falhas:</span>
            <input
              type="number"
              value={character.deathSaves.failure}
              onChange={e =>
                handleNestedChange('deathSaves', 'failure', parseInt(e.target.value, 10))
              }
            />
          </div>

          <section>
            <h2>Ataques & Magias</h2>
            <button type="button" className="add-attack" onClick={handleAddAttack}>
              + Adicionar Ataque/Magia
            </button>

  <ul className="attacks-list">
    {character.attacksList.map((atk, idx) => (
      <li key={idx} className="attack-item">
        {atk.isEditing ? (
          <div className="attack-edit">
            <input
              type="text"
              placeholder="Nome do Ataque/Magia"
              value={atk.name}
              onChange={e =>
                handleAttackChange(idx, 'name', e.target.value)
              }
            />
            <textarea
              placeholder="Descrição (dano, efeitos, etc)"
              value={atk.description}
              onChange={e =>
                handleAttackChange(idx, 'description', e.target.value)
              }
            />
            <div className="attack-edit-buttons">
              <button onClick={() => handleSaveAttack(idx)}>
                Salvar
              </button>
              <button onClick={() => handleRemoveAttack(idx)}>
                Remover
              </button>
            </div>
          </div>
        ) : (
          <div className="attack-view">
            <div className="attack-header">
              <span 
                className="attack-title"
                onMouseEnter={() => handleShowTooltip(idx)}
                onMouseLeave={() => handleHideTooltip()}
              >
                {atk.name}
              </span>
              <div className="attack-actions">
                <button 
                  onClick={() => {
                    setCharacter(prev => {
                      const list = [...prev.attacksList];
                      list[idx].isEditing = true;
                      return { ...prev, attacksList: list };
                    });
                  }}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleRemoveAttack(idx)}
                  title="Remover"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        )}
      </li>
    ))}
  </ul>
            
            {/* Tooltip flutuante */}
  {tooltipVisible && (
    <div 
      className="attack-tooltip"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left
      }}
    >
      <h4>{tooltipContent.name}</h4>
      <p>{tooltipContent.description}</p>
    </div>
  )}
</section>

          <label>Equipamento</label>
          <textarea
            value={character.equipment}
            onChange={e => handleChange('equipment', e.target.value)}
          />
        </div>

        {/* Right Column: Personalidade */}
        <div className="column">
          <h2>Personalidade</h2>

          <label>Traços</label>
          <textarea
            value={character.traits}
            onChange={e => handleChange('traits', e.target.value)}
          />

          <label>Ideais</label>
          <textarea
            value={character.ideals}
            onChange={e => handleChange('ideals', e.target.value)}
          />

          <label>Vínculos</label>
          <textarea
            value={character.bonds}
            onChange={e => handleChange('bonds', e.target.value)}
          />

          <label>Defeitos</label>
          <textarea
            value={character.flaws}
            onChange={e => handleChange('flaws', e.target.value)}
          />

          <label>Notas & Características</label>
          <textarea
            value={character.notes}
            onChange={e => handleChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
     </>
  );
}
