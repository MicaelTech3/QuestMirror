import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, addDoc, getDocs, deleteDoc,
         updateDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCEPrlqbW7ec7mSJLJF6lrY6pk-F1EXGTE",
  authDomain:        "questmirror-server.firebaseapp.com",
  projectId:         "questmirror-server",
  storageBucket:     "questmirror-server.firebasestorage.app",
  messagingSenderId: "248196878452",
  appId:             "1:248196878452:web:2c92315ea5e2edca5a0121"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// DOM
const loginScreen  = document.getElementById('login-screen');
const appEl        = document.getElementById('app');
const loginBtn     = document.getElementById('login-btn');
const logoutBtn    = document.getElementById('logout-btn');
const loginEmail   = document.getElementById('login-email');
const loginPass    = document.getElementById('login-pass');
const loginError   = document.getElementById('login-error');
const createBtn    = document.getElementById('create-btn');
const refreshBtn   = document.getElementById('refresh-btn');
const serversGrid  = document.getElementById('servers-grid');
const deleteModal  = document.getElementById('delete-modal');
const deleteSub    = document.getElementById('delete-modal-sub');
const deleteCancel = document.getElementById('delete-cancel');
const deleteConfirm= document.getElementById('delete-confirm');

let serversCache       = [];
let serversUnsubscribe = null;
let pendingDeleteId    = null;
let toastTimer;

// ── TOAST ──────────────────────────────────────────────────
function toast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = (type==='success'?'✓ ':'✕ ') + msg;
  el.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.className=''; }, 3000);
}

// ── AUTH ───────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    loginScreen.style.display = 'none';
    appEl.style.display = 'block';
    startListening();
  } else {
    loginScreen.style.display = 'flex';
    appEl.style.display = 'none';
    if (serversUnsubscribe) serversUnsubscribe();
  }
});

loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const pass  = loginPass.value;
  if (!email || !pass) return;
  loginBtn.textContent = 'Entrando...'; loginBtn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    loginError.style.display = 'none';
  } catch(e) {
    loginError.style.display = 'block';
    loginBtn.textContent = 'Entrar'; loginBtn.disabled = false;
  }
});
loginPass.addEventListener('keydown', e => { if(e.key==='Enter') loginBtn.click(); });
logoutBtn.addEventListener('click', () => signOut(auth));

// ── GENERATE ID ────────────────────────────────────────────
async function generateUniqueId() {
  const existing = new Set(serversCache.map(s => s.serverId));
  let id, attempts = 0;
  do { id = String(Math.floor(100000 + Math.random() * 900000)); attempts++; }
  while (existing.has(id) && attempts < 50);
  return id;
}

// ── CREATE ─────────────────────────────────────────────────
createBtn.addEventListener('click', async () => {
  const name     = document.getElementById('new-name').value.trim();
  const interval = parseInt(document.getElementById('new-interval').value);
  const maxS     = parseInt(document.getElementById('new-max').value);
  if (!name) { toast('Digite um nome para o server', 'error'); return; }
  createBtn.textContent = 'Criando...'; createBtn.disabled = true;
  try {
    const id = await generateUniqueId();
    await addDoc(collection(db, 'servers'), {
      serverId: id, name, rotationInterval: interval,
      maxSenders: maxS, active: true,
      createdAt: serverTimestamp(), currentSender: null
    });
    document.getElementById('new-name').value = '';
    toast(`Server "${name}" criado! ID: ${id}`);
  } catch(e) { toast('Erro: ' + e.message, 'error'); }
  createBtn.textContent = '+ Criar'; createBtn.disabled = false;
});

refreshBtn.addEventListener('click', () => {
  refreshBtn.style.transform = 'rotate(360deg)';
  refreshBtn.style.transition = 'transform 0.5s';
  setTimeout(()=>{ refreshBtn.style.transform=''; refreshBtn.style.transition=''; }, 500);
});

// ── REALTIME LISTENER ─────────────────────────────────────
function startListening() {
  const q = query(collection(db, 'servers'), orderBy('createdAt', 'desc'));
  serversUnsubscribe = onSnapshot(q, async snap => {
    serversCache = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    await renderServers();
  });
}

// ── RENDER ────────────────────────────────────────────────
async function renderServers() {
  const servers = serversCache;
  let totalQuests=0, totalReceivers=0, activeServers=0;

  const enriched = await Promise.all(servers.map(async s => {
    try {
      const sendSnap = await getDocs(collection(db, 'servers', s.docId, 'senders'));
      const senders  = sendSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const connected = senders.filter(x => x.connected);
      totalQuests += connected.length;
      if (connected.length > 0) activeServers++;
      const recvSnap  = await getDocs(collection(db, 'servers', s.docId, 'receivers'));
      totalReceivers += recvSnap.docs.filter(d => d.data().connected).length;
      return { ...s, senders, connectedSenders: connected };
    } catch { return { ...s, senders: [], connectedSenders: [] }; }
  }));

  document.getElementById('stat-total').textContent     = servers.length;
  document.getElementById('stat-active').textContent    = activeServers;
  document.getElementById('stat-quests').textContent    = totalQuests;
  document.getElementById('stat-receivers').textContent = totalReceivers;
  document.getElementById('topbar-count').textContent   = totalQuests + ' online';

  if (servers.length === 0) {
    serversGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">🥽</div><div class="empty-title">Nenhum server criado</div><div class="empty-sub">Crie um server acima para começar</div></div>`;
    return;
  }

  serversGrid.innerHTML = enriched.map(s => renderCard(s)).join('');
  bindCardEvents();
}

function renderCard(s) {
  const isOnline = s.connectedSenders.length > 0;
  const statusCls = isOnline ? 'online' : 'offline';
  const statusLbl = isOnline ? 'Online' : 'Offline';

  const sendersHtml = s.senders.length === 0
    ? `<div class="no-senders">Nenhum Quest conectado</div>`
    : s.senders.map(sender => {
        const on       = sender.connected;
        const isCurrent= s.currentSender === sender.id;
        const since    = sender.lastSeen?.toDate ? timeAgo(sender.lastSeen.toDate()) : '—';
        return `
          <div class="sender-row ${on?'connected':''} ${isCurrent?'is-active':''}">
            <div class="sender-name-wrap">
              <span class="sender-dot ${on?(isCurrent?'active-dot':'on'):''}"></span>
              ${esc(sender.questName||'Quest')}
              ${isCurrent ? '<span style="font-size:0.62rem;color:var(--accent2);margin-left:4px;">● ATIVO</span>' : ''}
            </div>
            <div class="sender-actions">
              <span class="sender-since">${on?'ao vivo':since}</span>
              ${on ? `<button class="btn-activate ${isCurrent?'is-current':''}"
                data-server="${s.docId}" data-sender="${sender.id}"
                data-current="${isCurrent}">
                ${isCurrent ? '✓ Exibindo' : 'Exibir'}
              </button>` : ''}
            </div>
          </div>`;
      }).join('');

  const intervalLbl = s.rotationInterval===0 ? 'Manual' : s.rotationInterval+'s';

  return `
    <div class="server-card ${isOnline?'active-card':''}">
      <div class="card-header">
        <div>
          <div class="card-name">${esc(s.name)}</div>
          <div class="card-id">${s.serverId}<button class="copy-btn" data-copy="${s.serverId}">⎘</button></div>
        </div>
        <div class="card-status ${statusCls}">
          <span class="status-dot ${isOnline?'pulse':''}"></span>${statusLbl}
        </div>
      </div>
      <div class="card-body">
        <div class="senders-title">Quests Conectados (${s.connectedSenders.length}/${s.maxSenders})</div>
        <div class="senders-list">${sendersHtml}</div>
        <div class="card-meta">
          <span class="meta-chip">${s.active?'✓ ativo':'✗ inativo'}</span>
          <div class="meta-edit">
            ↻
            <select data-edit-interval="${s.docId}">
              ${[5,10,15,30,60,0].map(v=>`<option value="${v}" ${s.rotationInterval==v?'selected':''}>${v===0?'Manual':v+'s'}</option>`).join('')}
            </select>
          </div>
          <div class="meta-edit">
            Quests
            <select data-edit-max="${s.docId}">
              ${[1,2,3,4,5,6].map(v=>`<option value="${v}" ${s.maxSenders==v?'selected':''}>${v}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <div style="display:flex;gap:8px;">
          <button class="btn-sm accent-btn" data-copy="${s.serverId}">Copiar ID</button>
          <button class="btn-sm" data-toggle="${s.docId}" data-active="${s.active}">${s.active?'Desativar':'Ativar'}</button>
        </div>
        <button class="btn-sm danger" data-delete="${s.docId}" data-name="${esc(s.name)}">Deletar</button>
      </div>
    </div>`;
}

function bindCardEvents() {
  serversGrid.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => { navigator.clipboard.writeText(btn.dataset.copy); toast('ID copiado: ' + btn.dataset.copy); });
  });

  serversGrid.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.delete, btn.dataset.name));
  });

  serversGrid.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const active = btn.dataset.active === 'true';
      await updateDoc(doc(db, 'servers', btn.dataset.toggle), { active: !active });
      toast(active ? 'Server desativado' : 'Server ativado');
    });
  });

  serversGrid.querySelectorAll('[data-sender]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (btn.dataset.current === 'true') return;
      await updateDoc(doc(db, 'servers', btn.dataset.server), { currentSender: btn.dataset.sender });
      toast('Quest trocado!');
    });
  });

  serversGrid.querySelectorAll('[data-edit-interval]').forEach(sel => {
    sel.addEventListener('change', async () => {
      const val = parseInt(sel.value);
      await updateDoc(doc(db, 'servers', sel.dataset.editInterval), { rotationInterval: val });
      toast('Intervalo atualizado: ' + (val===0?'Manual':val+'s'));
    });
  });

  serversGrid.querySelectorAll('[data-edit-max]').forEach(sel => {
    sel.addEventListener('change', async () => {
      const val = parseInt(sel.value);
      await updateDoc(doc(db, 'servers', sel.dataset.editMax), { maxSenders: val });
      toast('Máx. Quests atualizado: ' + val);
    });
  });
}

// ── DELETE MODAL ──────────────────────────────────────────
function openDeleteModal(docId, name) {
  pendingDeleteId = docId;
  deleteSub.textContent = `Deletar "${name}"? Esta ação não pode ser desfeita.`;
  deleteModal.classList.add('open');
}
deleteCancel.addEventListener('click', () => { deleteModal.classList.remove('open'); pendingDeleteId=null; });
deleteConfirm.addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  deleteConfirm.textContent = 'Deletando...';
  try { await deleteDoc(doc(db, 'servers', pendingDeleteId)); toast('Server deletado'); }
  catch(e) { toast('Erro ao deletar', 'error'); }
  deleteModal.classList.remove('open'); pendingDeleteId=null; deleteConfirm.textContent='Deletar';
});

// ── UTILS ─────────────────────────────────────────────────
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function timeAgo(d) {
  const s = Math.floor((Date.now()-d.getTime())/1000);
  if(s<60) return s+'s atrás';
  const m=Math.floor(s/60); if(m<60) return m+'min atrás';
  return Math.floor(m/60)+'h atrás';
}