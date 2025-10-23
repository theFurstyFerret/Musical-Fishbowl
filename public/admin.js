async function authAdmin() {
  const pass = document.getElementById('password').value;
  const res = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass })
  });
  if (res.ok) {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('masterList').style.display = 'block';
    loadEntries();
  } else {
    alert('Wrong password');
  }
}

async function loadEntries() {
  const res = await fetch('/api/admin/entries');
  const entries = await res.json();
  const list = document.getElementById('entriesList');
  list.innerHTML = entries.map(entry => `
    <li>
      <strong>${entry.song}</strong> 
      <button class="name-toggle" onclick="toggleName(this)">👁️ Show Name</button>
      <a href="${entry.link}" target="_blank" class="play-btn">▶️ Play</a>
      <span class="name hidden" style="margin-left:10px;">by ${entry.name}</span>
    </li>
  `).join('');
}

function toggleName(btn) {
  const nameSpan = btn.nextElementSibling;
  nameSpan.classList.toggle('hidden');
  btn.textContent = nameSpan.classList.contains('hidden') ? '👁️ Show Name' : '🙈 Hide Name';
}
