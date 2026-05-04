// -------------------- Year --------------------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// -------------------- Header scroll --------------------
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}, { passive: true });

// -------------------- Section speech messages --------------------
const sectionMessages = {
  'home':       'Hi there! Welcome to my data world 🌍',
  'about':      'Let me tell you about the human behind the data 🤖',
  'projects':   'Here\'s where the magic of analysis happens ✨',
  'dashboards': 'Crunching visuals... complete ✅',
  'courses':    'Always learning something new 📘',
  'resume':     'Plotting career trajectory 📈',
  'contact':    'Let\'s connect and collaborate 💬'
};

const speech    = document.getElementById('speech');
const robot     = document.getElementById('robot');
const robotWrap = document.getElementById('robotWrap');
const transitionOverlay = document.getElementById('transitionOverlay');
const trail     = document.getElementById('robotTrail');

// IntersectionObserver: update speech when section enters view
const sections = document.querySelectorAll('section[id]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const msg = sectionMessages[entry.target.id] || 'Hi — explore around!';
      setSpeech(msg);
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => io.observe(s));

function setSpeech(text) {
  speech.textContent = text;
  speech.classList.add('visible');
  clearTimeout(speech._timer);
  speech._timer = setTimeout(() => speech.classList.remove('visible'), 5000);
}

// -------------------- Robot interactions --------------------
robotWrap.addEventListener('mouseenter', () => {
  robot.classList.add('hover-glow', 'robot-waving');
  setSpeech("Hey! I’m Roz 👋");
  setTimeout(() => robot.classList.remove('robot-waving'), 900);
});
robotWrap.addEventListener('mouseleave', () => {
  robot.classList.remove('hover-glow');
});
robotWrap.addEventListener('click', () => {
  const greets = ['Analyzing smiles... ✔️', 'You look data-ready 😎', 'Ready to explore more?'];
  const g = greets[Math.floor(Math.random() * greets.length)];
  robot.classList.add('robot-waving');
  setSpeech(g);
  setTimeout(() => robot.classList.remove('robot-waving'), 900);
});

// -------------------- Animated counters --------------------
const statEls  = document.querySelectorAll('.stat .val');
const statWrap = document.querySelector('.stats');
if (statWrap && statEls.length) {
  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statEls.forEach(el => animateCounter(el, el.dataset.target));
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  statObserver.observe(statWrap);
}

function animateCounter(el, target) {
  const to  = parseInt(target, 10) || 0;
  let start = null;
  const dur = 1200;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min(1, (ts - start) / dur);
    el.textContent = Math.floor(easeOutCubic(p) * to);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// -------------------- Project staggered reveal --------------------
// REPLACE the existing project stagger + add button logic
const projectsTrack = document.getElementById('projectsTrack');
const projPrev      = document.getElementById('projPrev');
const projNext      = document.getElementById('projNext');

// Staggered reveal
document.querySelectorAll('.project').forEach((p) => {
  const delay = Number(p.dataset.delay || 0);
  setTimeout(() => {
    p.style.opacity = 1;
    p.style.transform = 'none';
  }, delay + 120);
});

// Scroll amount = one card width + gap
const CARD_WIDTH = 320 + 20;

function updateProjButtons() {
  if (!projectsTrack) return;
  projPrev.disabled = projectsTrack.scrollLeft <= 0;
  projNext.disabled = projectsTrack.scrollLeft + projectsTrack.clientWidth >= projectsTrack.scrollWidth - 1;
}

if (projPrev && projNext && projectsTrack) {
  projPrev.addEventListener('click', () => {
    projectsTrack.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' });
  });
  projNext.addEventListener('click', () => {
    projectsTrack.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
  });
  projectsTrack.addEventListener('scroll', updateProjButtons, { passive: true });
  updateProjButtons(); // set initial state
}

// -------------------- Timeline / bio / course reveal --------------------
// NOTE: .dash-frame is intentionally excluded here so clones created
//       by the carousel are not stuck invisible.
document.querySelectorAll('.tl-item, .bio, .course-item').forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(12px)';
  const o = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        el.style.opacity   = 1;
        el.style.transform = 'none';
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });
  o.observe(el);
});

// -------------------- Course expand/collapse --------------------
document.querySelectorAll('.course-item').forEach(item => {
  const detail = item.querySelector('.course-detail');
  const arrow  = item.querySelector('.arrow');
  let open = false;

  item.addEventListener('click',    () => toggle());
  item.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') toggle();
  });

  function toggle() {
    open = !open;
    if (open) {
      detail.style.maxHeight = (detail.scrollHeight + 24) + 'px';
      detail.setAttribute('aria-hidden', 'false');
      arrow.textContent = '▾';
      item.setAttribute('aria-expanded', 'true');
    } else {
      detail.style.maxHeight = '0';
      detail.setAttribute('aria-hidden', 'true');
      arrow.textContent = '▸';
      item.setAttribute('aria-expanded', 'false');
    }
  }
});

// -------------------- Nav flight animation --------------------
const navLinks = document.querySelectorAll('.navlink');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    transitionOverlay.classList.add('active');
    flyRobotToSection(targetId).then(() => {
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => transitionOverlay.classList.remove('active'), 700);
    });
  });
});

let isFlying = false;
async function flyRobotToSection(targetId) {
  if (isFlying) return;
  isFlying = true;

  const startRect = robotWrap.getBoundingClientRect();
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top  + startRect.height / 2;

  const targetEl   = document.getElementById(targetId);
  if (!targetEl) { isFlying = false; return; }
  const targetRect = targetEl.getBoundingClientRect();
  const destX = targetRect.left + targetRect.width * 0.75;
  const destY = targetRect.top  + 60;

  const deltaX = destX - startX;
  const deltaY = destY - startY;

  robot.classList.add('robot-fly');
  robot.classList.remove('robot-idle');
  robotWrap.style.zIndex     = '3000';
  robotWrap.style.transition = 'transform 900ms cubic-bezier(.22,.9,.26,1), opacity 700ms';
  robotWrap.style.transform  = `translate(${deltaX}px, ${deltaY}px) rotate(12deg) scale(1.05)`;

  if (trail) {
    trail.style.opacity    = '1';
    trail.style.transition = 'opacity 400ms';
  }

  robot.classList.add('hover-glow');
  setTimeout(() => robot.classList.add('robot-waving'), 200);
  setTimeout(() => robot.classList.remove('robot-waving'), 800);

  await new Promise(res => setTimeout(res, 920));

  if (trail) trail.style.opacity = '0';
  robotWrap.style.transform  = 'translate(0px, 0px) rotate(0deg) scale(1)';
  robotWrap.style.transition = 'transform 800ms cubic-bezier(.22,.9,.26,1), opacity 400ms';

  setTimeout(() => {
    robot.classList.remove('robot-fly');
    robot.classList.add('robot-idle');
    robot.classList.remove('hover-glow');
    robotWrap.style.zIndex = '110';
    isFlying = false;
  }, 820);
}

// -------------------- "See projects" button --------------------
const seeProjectsBtn = document.getElementById('seeProjectsBtn');
if (seeProjectsBtn) {
  seeProjectsBtn.addEventListener('click', () => {
    transitionOverlay.classList.add('active');
    flyRobotToSection('projects').then(() => {
      document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => transitionOverlay.classList.remove('active'), 700);
    });
  });
}

// -------------------- Keyboard easter egg --------------------
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') {
    robot.classList.add('robot-waving');
    setSpeech('Robo-wave activated 🤖');
    setTimeout(() => robot.classList.remove('robot-waving'), 900);
  }
});

// Click anywhere outside speech to dismiss it
document.addEventListener('click', (ev) => {
  if (!speech.contains(ev.target) && !robotWrap.contains(ev.target)) {
    speech.classList.remove('visible');
  }
});

// -------------------- Reduced motion --------------------
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mq && mq.matches) {
  transitionOverlay.style.display = 'none';
  robot.classList.remove('robot-idle');
}

// -------------------- Initial speech --------------------
setTimeout(() => setSpeech(sectionMessages['home']), 700);

// -------------------- Profile Picture Portal --------------------
const profilePic       = document.getElementById('profilePic');
const portalText       = document.getElementById('portalText');
const profileContainer = document.getElementById('profileContainer');

if (profilePic && portalText && profileContainer) {
  profilePic.addEventListener('click', () => {
    profilePic.classList.add('spin-portal');
    profileContainer.classList.add('active');
    setTimeout(() => portalText.classList.add('visible'), 400);
    setTimeout(() => {
      portalText.classList.remove('visible');
      profilePic.classList.remove('spin-portal');
      profileContainer.classList.remove('active');
    }, 2200);
  });
}

// -------------------- Dashboard Image Modal --------------------
// Uses the HTML #imgModal instead of creating a new element every click.
const imgModal  = document.getElementById('imgModal');
const modalImg  = document.getElementById('modalImg');
const modalClose = document.getElementById('modalClose');

function openModal(src, alt) {
  modalImg.src = src;
  modalImg.alt = alt || '';
  imgModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  imgModal.classList.remove('open');
  document.body.style.overflow = '';
  // Clear src so previous image doesn't flash on next open
  setTimeout(() => { modalImg.src = ''; }, 300);
}

// Delegated click listener — works on original AND cloned dash-imgs
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('dash-img')) {
    openModal(e.target.src, e.target.alt);
  }
});

// Close on backdrop click or close button
imgModal.addEventListener('click', (e) => {
  if (e.target === imgModal || e.target === modalClose) closeModal();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && imgModal.classList.contains('open')) closeModal();
});

// -------------------- Dashboard Carousel (Infinite Auto Scroll) --------------------
const carousel = document.getElementById('carousel');

if (carousel) {
  const speed = 0.5;
  let isPaused = false;

  // Duplicate items for seamless infinite loop
  const items = Array.from(carousel.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    carousel.appendChild(clone);
  });

  function autoScrollCarousel() {
    if (!isPaused) {
      carousel.scrollLeft += speed;
      // Reset to start when we've scrolled through the first set
      if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
        carousel.scrollLeft = 0;
      }
    }
    requestAnimationFrame(autoScrollCarousel);
  }

  carousel.addEventListener('mouseenter', () => { isPaused = true; });
  carousel.addEventListener('mouseleave', () => { isPaused = false; });

  // Touch support for mobile
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    isPaused = true;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  carousel.addEventListener('touchend', () => {
    setTimeout(() => { isPaused = false; }, 1500);
  }, { passive: true });

  autoScrollCarousel();
}
