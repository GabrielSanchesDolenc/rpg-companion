import React, { useEffect, useRef, useState } from 'react';
import './style.css';

const user = JSON.parse(localStorage.getItem('user'));
const API_URL = "http://localhost:3001";

const STORAGE_KEY = "skillTreeData";
const VIEW_KEY = "skillTreeView";

const DEFAULT_SKILLS = [
  { id: 'combat-1', name: 'Ataque Básico', description: 'Causa 10 de dano', acquired: true, position: { x: 50, y: 10 }, prerequisites: [], type: 'attack', image: '' },
  { id: 'combat-2', name: 'Golpe Poderoso', description: 'Causa 25 de dano com chance de crítico', acquired: false, position: { x: 30, y: 30 }, prerequisites: ['combat-1'], type: 'attack', image: '' },
  { id: 'combat-3', name: 'Fúria', description: 'Aumenta dano em 30% por 10s', acquired: false, position: { x: 10, y: 50 }, prerequisites: ['combat-2'], type: 'attack', image: '' },
  { id: 'magic-1', name: 'Bola de Fogo', description: 'Causa 20 de dano mágico', acquired: false, position: { x: 50, y: 30 }, prerequisites: ['combat-2'], type: 'magic', image: '' },
  { id: 'magic-2', name: 'Escudo Arcano', description: 'Reduz dano recebido em 40%', acquired: false, position: { x: 70, y: 50 }, prerequisites: ['magic-1'], type: 'defense', image: '' }
];

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export default function SkillTree() {
  // dados
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [compact, setCompact] = useState(false);

  // formulário
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', x: 50, y: 50, prerequisites: [], type: '', image: '' });

  // refs
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);

  // carregar do banco
  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/ficha/hyakki_arvore/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data?.dados) {
            setSkills(data.dados.skills || DEFAULT_SKILLS);
            if (data.dados.view) {
              setScale(data.dados.view.scale ?? 1);
              setTx(data.dados.view.tx ?? 0);
              setTy(data.dados.view.ty ?? 0);
              setCompact(data.dados.view.compact ?? false);
            }
          }
        })
        .catch(err => console.error("Erro ao carregar árvore:", err));
    }
  }, []);

  // salvar no banco
  function salvarArvore() {
    if (!user) return alert("Faça login para salvar sua árvore!");
    const dados = { skills, view: { scale, tx, ty, compact } };
    fetch(`${API_URL}/ficha/hyakki_arvore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id: user.id, dados })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) alert("Árvore salva com sucesso!");
      })
      .catch(err => console.error("Erro ao salvar árvore:", err));
  }

  // helpers
  const findSkill = id => skills.find(s => s.id === id);
  const canAcquire = skill => !skill.prerequisites?.length || skill.prerequisites.every(rid => !!findSkill(rid)?.acquired);
  const hasDependentAcquired = skillId => skills.some(s => s.prerequisites.includes(skillId) && s.acquired);

  function toggleSkill(id) {
    setSkills(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (s.acquired) {
        if (hasDependentAcquired(s.id)) return s;
        return { ...s, acquired: false };
      }
      if (!canAcquire(s)) return s;
      return { ...s, acquired: true };
    }));
  }

  function addSkill(e) {
    e?.preventDefault();
    if (!form.name.trim()) return;
    const newSkill = {
      id: uid('s-'),
      name: form.name,
      description: form.description,
      acquired: false,
      position: { x: Number(form.x), y: Number(form.y) },
      prerequisites: Array.from(new Set(form.prerequisites || [])),
      type: form.type || '',
      image: form.image || ''
    };
    setSkills(prev => [...prev, newSkill]);
    resetForm();
  }

  function editSkill(e) {
    e?.preventDefault();
    if (!selected) return;
    setSkills(prev => prev.map(s => {
      if (s.id !== selected) return s;
      const prs = (form.prerequisites || []).filter(p => p !== s.id);
      return { ...s, name: form.name, description: form.description, position: { x: Number(form.x), y: Number(form.y) }, prerequisites: prs, type: form.type || '', image: form.image || '' };
    }));
    setSelected(null);
    resetForm();
  }

  function deleteSkill(id) {
    if (skills.some(s => s.prerequisites.includes(id))) {
      alert('Não é possível deletar: existem habilidades que dependem desta.');
      return;
    }
    setSkills(prev => prev.filter(s => s.id !== id));
    if (selected === id) {
      setSelected(null);
      resetForm();
    }
  }

  function startEdit(id) {
    const s = findSkill(id);
    if (!s) return;
    setSelected(id);
    setForm({ name: s.name, description: s.description, x: s.position.x, y: s.position.y, prerequisites: [...(s.prerequisites || [])], type: s.type || '', image: s.image || '' });
  }

  function resetForm() {
    setForm({ name: '', description: '', x: 50, y: 50, prerequisites: [], type: '', image: '' });
  }

  function handleImageFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      alert('Arquivo não é uma imagem');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setForm(prev => ({ ...prev, image: reader.result })); };
    reader.readAsDataURL(f);
  }

  function setImageUrl(url) { setForm(prev => ({ ...prev, image: url })); }
  function clearImage() { setForm(prev => ({ ...prev, image: '' })); }

  const renderConnections = () =>
    skills.flatMap(skill =>
      (skill.prerequisites || []).map(pid => {
        const p = findSkill(pid);
        if (!p) return null;
        const x1 = p.position.x, y1 = p.position.y;
        const x2 = skill.position.x, y2 = skill.position.y;
        const midX = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} C ${midX} ${y1} ${midX} ${y2} ${x2} ${y2}`;
        const active = p.acquired && skill.acquired;
        return <path key={`${pid}-${skill.id}`} d={d} className={active ? 'active' : ''} />;
      })
    ).filter(Boolean);

  // dragging & panning
  function onNodePointerDown(e, id) {
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = { type: 'node', id, startX: e.clientX, startY: e.clientY, rect };
    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onGlobalPointerUp);
  }

  function onStagePointerDown(e) {
    const rect = containerRef.current.getBoundingClientRect();
    const wantPan = e.button === 1 || e.altKey || e.shiftKey || e.button === 2 || e.target === stageRef.current;
    if (!wantPan) return;
    dragRef.current = { type: 'pan', startX: e.clientX, startY: e.clientY, startTx: tx, startTy: ty, rect };
    window.addEventListener('pointermove', onGlobalPointerMove);
    window.addEventListener('pointerup', onGlobalPointerUp);
  }

  function onGlobalPointerMove(e) {
    if (!dragRef.current) return;
    if (dragRef.current.type === 'node') {
      const { rect, id } = dragRef.current;
      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;
      const xPerc = Math.max(0, Math.min(100, (dx / rect.width) * 100));
      const yPerc = Math.max(0, Math.min(100, (dy / rect.height) * 100));
      setSkills(prev => prev.map(s => s.id === id ? { ...s, position: { x: xPerc, y: yPerc } } : s));
    } else if (dragRef.current.type === 'pan') {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setTx(dragRef.current.startTx + dx);
      setTy(dragRef.current.startTy + dy);
    }
  }

  function onGlobalPointerUp() {
    dragRef.current = null;
    window.removeEventListener('pointermove', onGlobalPointerMove);
    window.removeEventListener('pointerup', onGlobalPointerUp);
  }

  // zoom
  function onWheel(e) {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const sX = e.clientX - rect.left;
    const sY = e.clientY - rect.top;
    const delta = -e.deltaY || e.wheelDelta;
    const direction = delta > 0 ? 1.15 : 1 / 1.15;
    const newScale = Math.max(0.25, Math.min(3, +(scale * direction).toFixed(3)));
    const newTx = sX - (sX - tx) * (newScale / scale);
    const newTy = sY - (sY - ty) * (newScale / scale);
    setScale(newScale);
    setTx(newTx);
    setTy(newTy);
  }

  useEffect(() => {
    if (!stageRef.current) return;
    stageRef.current.style.setProperty('--scale', scale);
    stageRef.current.style.setProperty('--tx', `${tx}px`);
    stageRef.current.style.setProperty('--ty', `${ty}px`);
  }, [scale, tx, ty]);

  // reset / unlock / export / import
  function resetTree() {
    if (!window.confirm('Resetar a árvore para o estado padrão?')) return;
    setSkills(DEFAULT_SKILLS);
    setScale(1);
    setTx(0);
    setTy(0);
    setCompact(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VIEW_KEY);
  }

  function unlockAll() { setSkills(prev => prev.map(s => ({ ...s, acquired: true }))); }

  function exportJSON() {
    const data = { skills, view: { scale, tx, ty, compact } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill-tree.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed.skills)) {
          setSkills(parsed.skills);
        } else if (Array.isArray(parsed)) {
          setSkills(parsed);
        } else if (parsed?.skills) {
          setSkills(parsed.skills);
          if (parsed.view) {
            setScale(parsed.view.scale ?? 1);
            setTx(parsed.view.tx ?? 0);
            setTy(parsed.view.ty ?? 0);
            setCompact(parsed.view.compact ?? false);
          }
        } else {
          alert('JSON inválido');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON');
      }
    };
    reader.readAsText(f);
    e.target.value = '';
  }

  const nodeClass = (s) => {
    const t = s.type ? ` type-${s.type}` : '';
    return `skill-node${s.acquired ? ' acquired' : ''}${(!canAcquire(s) && !s.acquired) ? ' locked' : ''}${t}`;
  };

  // render
  return (
    <div className="skill-tree-app">
      <div className="left-panel">
        <h2 className="handwritten">Árvore de Habilidades</h2>

        <div className="controls" style={{ marginBottom: 12 }}>
          <button onClick={resetTree}>Resetar</button>
          <button onClick={unlockAll}>Desbloquear tudo</button>
          <button onClick={exportJSON}>Exportar (.json)</button>
          <button onClick={() => fileInputRef.current?.click()}>Importar</button>
          
          <input ref={fileInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={onImportFile} />
        </div>

        {user && (
          <button className="save-tree" onClick={salvarArvore}>
            Salvar Árvore
          </button>
        )}

        <form className="skill-form" onSubmit={(e) => selected ? editSkill(e) : addSkill(e)}>
          <h3>{selected ? 'Editar habilidade' : 'Adicionar habilidade'}</h3>

          <label>
            Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>

          <label>
            Tipo (ex: attack, defense, magic, utility)
            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="attack" />
          </label>

          <label>
            Descrição
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>

          <div className="pos-row">
            <label>
              X (%)
              <input type="number" min="0" max="100" value={form.x} onChange={(e) => setForm({ ...form, x: e.target.value })} />
            </label>
            <label>
              Y (%)
              <input type="number" min="0" max="100" value={form.y} onChange={(e) => setForm({ ...form, y: e.target.value })} />
            </label>
          </div>

          <label className="prereq-label">Pré-requisitos</label>
          <div className="prereq-list">
            {skills.map(s => (
              <label key={s.id} className="pr-item">
                <input
                  type="checkbox"
                  checked={form.prerequisites.includes(s.id)}
                  onChange={(e) => {
                    const next = new Set(form.prerequisites);
                    if (e.target.checked) next.add(s.id); else next.delete(s.id);
                    setForm({ ...form, prerequisites: Array.from(next) });
                  }}
                  disabled={selected === s.id}
                />
                {s.name}
              </label>
            ))}
          </div>

          {/* Image controls */}
          <label style={{ marginTop: 8 }}>Imagem (upload)</label>
          <input type="file" accept="image/*" onChange={handleImageFile} />

          <label style={{ marginTop: 6 }}>Ou URL da imagem</label>
          <input value={form.image} placeholder="https://.../img.png" onChange={(e) => setImageUrl(e.target.value)} />

          {form.image && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, color: '#e7dccb' }}>Preview:</div>
              <div style={{ marginTop: 6 }}>
                <img src={form.image} alt="preview" style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(0,0,0,0.12)' }} />
                <div style={{ marginTop: 6 }}>
                  <button type="button" onClick={() => clearImage()}>Remover imagem</button>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 8 }}>
            <button type="submit">{selected ? 'Salvar' : 'Adicionar'}</button>
            {selected ? (
              <button type="button" onClick={() => { setSelected(null); resetForm(); }}>Cancelar</button>
            ) : (
              <button type="button" onClick={() => resetForm()}>Limpar</button>
            )}
          </div>
        </form>
      </div>

      <div className={`canvas-area`}>
        <div className={`skill-tree ${compact ? 'compact' : ''} ${scale < 0.9 ? 'zoomed-out' : (scale > 1.4 ? 'zoomed-in' : '')}`} ref={containerRef} onWheel={onWheel} onPointerDown={onStagePointerDown}>
          <div className="zoom-controls" style={{ right: 22, top: 22 }}>
            <button onClick={() => { setScale(s => Math.max(0.25, +(s - 0.1).toFixed(2))); }}>−</button>
            <button onClick={() => { setScale(1); setTx(0); setTy(0); }}>Reset</button>
            <button onClick={() => { setScale(s => Math.min(3, +(s + 0.1).toFixed(2))); }}>+</button>
            <button className={`compact-toggle ${compact ? 'active' : ''}`} onClick={() => setCompact(c => !c)} title="Toggle compact">Compact</button>
          </div>

          <div className="stage" ref={stageRef} style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
            <svg className="connections-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
              {renderConnections()}
            </svg>

            {skills.map(skill => {
              const unlocked = canAcquire(skill);
              return (
                <div key={skill.id} className={nodeClass(skill)} style={{ left: `${skill.position.x}%`, top: `${skill.position.y}%` }} onClick={(e) => { e.stopPropagation(); if (unlocked) toggleSkill(skill.id); }} onPointerDown={(e) => onNodePointerDown(e, skill.id)} title={`${skill.name}\n${skill.description}`}>
                  <div className="node-top">
                    <div className="node-icon">
                      {skill.image ? (
                        <img src={skill.image} alt={skill.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div className={`node-pulse ${skill.acquired ? 'on' : ''}`} />
                      )}
                    </div>
                    <div className="node-actions">
                      <button onClick={(e) => { e.stopPropagation(); startEdit(skill.id); }}>✎</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSkill(skill.id); }}>🗑</button>
                    </div>
                  </div>
                  <div className="node-label">
                    <strong className="handwritten">{skill.name}</strong>
                    <small>{skill.acquired ? 'Adquirida' : unlocked ? 'Disponível' : 'Bloqueada'}</small>
                  </div>
                  {!compact && <div className="node-desc">{skill.description}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}