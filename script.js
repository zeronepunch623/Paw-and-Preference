const TOTAL_CATS = 15;
const cardStack = document.getElementById('cardStack');
const dislikeBtn = document.getElementById('dislikeBtn');
const likeBtn = document.getElementById('likeBtn');
const summary = document.getElementById('summary');
const likedCountEl = document.getElementById('likedCount');
const totalCountEl = document.getElementById('totalCount');
const likedCatsEl = document.getElementById('likedCats');

let cards = [];
let likedCats = [];

async function loadCats() {
  const promises = [];
  for (let i = 0; i < TOTAL_CATS; i++) {
    const url = `https://cataas.com/cat?${Date.now() + i}`;
    promises.push(
      new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve('https://cataas.com/cat');
        img.src = url;
      })
    );
  }
  return Promise.all(promises);
}

function createCard(imageUrl, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${imageUrl}" class="cat-image" alt="Cat ${index + 1}" loading="lazy">
    <div class="overlay like-overlay">LIKE</div>
    <div class="overlay nope-overlay">NOPE</div>
  `;

  card.style.transform = `translateY(${index * 6}px) scale(${1 - index * 0.02}) rotate(${index % 2 === 0 ? -2 : 2}deg)`;
  card.style.zIndex = TOTAL_CATS - index;

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const likeOverlay = card.querySelector('.like-overlay');
  const nopeOverlay = card.querySelector('.nope-overlay');

  function onStart(e) {
    if (cards[0] !== card) return;
    isDragging = true;
    startX = (e.type.includes('touch') ? e.touches[0].clientX : e.clientX);
    card.style.transition = 'none';
  }

  function onMove(e) {
    if (!isDragging || cards[0] !== card) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    currentX = clientX - startX;

    const rotate = currentX / 10;
    card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

    const opacity = Math.abs(currentX) / 150;
    if (currentX > 0) {
      likeOverlay.style.opacity = opacity;
      nopeOverlay.style.opacity = 0;
    } else {
      nopeOverlay.style.opacity = opacity;
      likeOverlay.style.opacity = 0;
    }
  }

  function onEnd() {
    if (!isDragging || cards[0] !== card) return;
    isDragging = false;
    card.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)';

    const swipedRight = currentX > 120;
    const swipedLeft = currentX < -120;

    if (swipedRight) {
      finishSwipe(card, true);
    } else if (swipedLeft) {
      finishSwipe(card, false);
    } else {
      card.style.transform = `translateX(0) rotate(0)`;
      likeOverlay.style.opacity = 0;
      nopeOverlay.style.opacity = 0;
    }
  }

  card.addEventListener('mousedown', onStart);
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseup', onEnd);
  card.addEventListener('mouseleave', onEnd);
  card.addEventListener('touchstart', onStart, { passive: true });
  card.addEventListener('touchmove', onMove, { passive: false });
  card.addEventListener('touchend', onEnd);

  return card;
}

function finishSwipe(card, liked) {
  const offset = liked ? 800 : -800;
  card.style.transform = `translateX(${offset}px) rotate(${liked ? 30 : -30}deg)`;
  
  if (liked) {
    const img = card.querySelector('img').src;
    likedCats.push(img);
  }

  setTimeout(() => {
    card.remove();
    cards.shift();
    if (cards.length === 0) showSummary();
  }, 500);
}

dislikeBtn.onclick = () => {
  if (cards.length > 0) {
    const card = cards[0];
    card.style.transition = 'transform 0.5s';
    card.style.transform = 'translateX(-800px) rotate(-30deg)';
    finishSwipe(card, false);
  }
};

likeBtn.onclick = () => {
  if (cards.length > 0) {
    const card = cards[0];
    card.style.transition = 'transform 0.5s';
    card.style.transform = 'translateX(800px) rotate(30deg)';
    finishSwipe(card, true);
  }
};

function showSummary() {
  likedCountEl.textContent = likedCats.length;
  totalCountEl.textContent = TOTAL_CATS;
  
  if (likedCats.length === 0) {
    likedCatsEl.innerHTML = '<p style="grid-column: 1/-1; font-size: 1.2rem; opacity: 0.8;">You didn’t like any cats</p>';
  } else {
    likedCats.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'liked-cat';
      img.alt = 'Liked cat';
      likedCatsEl.appendChild(img);
    });
  }
  
  summary.classList.add('show');
}

(async () => {
  const catUrls = await loadCats();
  catUrls.forEach((url, i) => {
    const card = createCard(url, i);
    cards.push(card);
    cardStack.appendChild(card);
  });
})();