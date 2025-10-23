let consentGiven = localStorage.getItem('cookieConsent') === 'true';

if (!consentGiven) {
  document.getElementById('consentModal').style.display = 'flex';
  document.getElementById('mainContent').style.display = 'none';
} else {
  document.getElementById('consentModal').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  initApp();
}

function acceptConsent() {
  localStorage.setItem('cookieConsent', 'true');
  document.getElementById('consentModal').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  initApp();
}

function initApp() {
  if (document.cookie.includes('admin=true')) {
    document.querySelector('h1').innerHTML += ' <span style="font-size:0.6em;">(Admin Mode)</span>';
  }
  const form = document.getElementById('entryForm');
  const loadEntry = async () => {
    const res = await fetch('/api/entry');
    const data = await res.json();
    if (data.song) {
      document.getElementById('song').value = data.song;
      document.getElementById('name').value = data.name;
      document.getElementById('link').value = data.link;
    }
  };
  loadEntry();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const song = document.getElementById('song').value;
    const name = document.getElementById('name').value;
    const link = document.getElementById('link').value;
    const res = await fetch('/api/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song, name, link })
    });
    if (res.ok) alert('Saved! 🎵');
  });
}

function clearCookie() {
  document.cookie = 'uuid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  location.reload();
}
