// public/app.js
const landingState = document.getElementById('landing-state');
const loadingState = document.getElementById('loading-state');
const previewState = document.getElementById('preview-state');
const errorState = document.getElementById('error-state');

const repoUrlInput = document.getElementById('repo-url-input');
const analyzeBtn = document.getElementById('analyze-btn');
const cardsContainer = document.getElementById('cards-container');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');

let currentAnalysisId = null;

// Analyze button click
analyzeBtn.addEventListener('click', () => analyzeRepo());
repoUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') analyzeRepo();
});

// Retry button click
retryBtn.addEventListener('click', () => {
  showState('landing');
  repoUrlInput.value = '';
});

async function analyzeRepo() {
  const repoUrl = repoUrlInput.value.trim();

  if (!repoUrl) {
    showError('Please enter a GitHub repository URL');
    return;
  }

  showState('loading');

  try {
    const response = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }

    const data = await response.json();
    currentAnalysisId = data.analysisId;

    renderCards(data.cards);
    showState('preview');
  } catch (error) {
    showError(error.message);
  }
}

function renderCards(cards) {
  cardsContainer.innerHTML = '';

  cards.forEach((card) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.innerHTML = `
      <div class="card-dimension">${card.dimension}</div>
      <div class="card-score">${card.score}</div>
      <div class="card-evidence">${card.evidence}</div>
    `;
    cardsContainer.appendChild(cardEl);
  });
}

function showState(state) {
  landingState.classList.add('hidden');
  loadingState.classList.add('hidden');
  previewState.classList.add('hidden');
  errorState.classList.add('hidden');

  if (state === 'landing') landingState.classList.remove('hidden');
  if (state === 'loading') loadingState.classList.remove('hidden');
  if (state === 'preview') previewState.classList.remove('hidden');
  if (state === 'error') errorState.classList.remove('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  showState('error');
}

const emailInput = document.getElementById('email-input');
const unlockBtn = document.getElementById('unlock-btn');

unlockBtn.addEventListener('click', () => unlockFullReading());

async function unlockFullReading() {
  const email = emailInput.value.trim();
  const repoUrl = repoUrlInput.value.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  unlockBtn.disabled = true;
  unlockBtn.textContent = 'Unlocking...';

  try {
    const response = await fetch('/api/full-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, email, analysisId: currentAnalysisId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unlock');
    }

    const data = await response.json();

    // Render all 10 cards
    renderCards(data.cards);

    // Hide email gate
    document.querySelector('.email-gate').style.display = 'none';
  } catch (error) {
    alert(error.message);
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.textContent = 'Unlock Full Reading';
  }
}
