/* ================================================
   UNDANGAN PERNIKAHAN - JAVASCRIPT
   Interactivity: Countdown, Audio, Clipboard, RSVP
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== INIT AOS ==========
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });

  // ========== DYNAMIC GUEST NAME ==========
  const params = new URLSearchParams(window.location.search);
  const guestParam = params.get('to');
  const guestNameEl = document.getElementById('guestName');
  if (guestParam && guestNameEl) {
    guestNameEl.textContent = decodeURIComponent(guestParam.replace(/\+/g, ' '));
  }

  // ========== COVER MODAL & OPEN INVITATION ==========
  const coverModal = document.getElementById('coverModal');
  const openBtn = document.getElementById('openInvitation');
  const mainContent = document.getElementById('mainContent');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  let isMusicPlaying = false;

  // ========== AUTO SLIDES ==========
  const slides = Array.from(mainContent.children).filter(child =>
    child.matches('.section, .footer-section')
  );
  let activeSlide = 0;
  let slideTimer;

  slides.forEach(slide => slide.classList.add('slide'));

  function fitSlides() {
    slides.forEach(slide => {
      slide.style.setProperty('--slide-scale', '1');
      const availableHeight = Math.max(1, slide.clientHeight - 32);
      const contentHeight = Math.max(
        slide.scrollHeight,
        slide.firstElementChild ? slide.firstElementChild.scrollHeight : 0
      );
      const scale = Math.min(1, availableHeight / Math.max(1, contentHeight));
      slide.style.setProperty('--slide-scale', String(scale));
    });
  }

  function showSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    requestAnimationFrame(fitSlides);
    AOS.refreshHard();
  }

  function startSlideShow() {
    fitSlides();
    showSlide(0);
    slideTimer = setInterval(() => showSlide(activeSlide + 1), 10000);
  }

  window.addEventListener('resize', fitSlides);
  window.addEventListener('load', fitSlides);
  if (document.fonts) document.fonts.ready.then(fitSlides);

  openBtn.addEventListener('click', () => {
    coverModal.classList.add('hidden');
    mainContent.classList.add('visible');
    musicToggle.classList.add('visible');
    startSlideShow();

    // Try to play music
    setTimeout(() => {
      bgMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicUI();
      }).catch(() => {
        // Autoplay blocked - user needs to tap music toggle
        isMusicPlaying = false;
        updateMusicUI();
      });
    }, 500);
  });

  // ========== MUSIC TOGGLE ==========
  const musicIcon = document.getElementById('musicIcon');

  musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
    } else {
      bgMusic.play().then(() => {
        isMusicPlaying = true;
      }).catch(() => {});
    }
    updateMusicUI();
  });

  function updateMusicUI() {
    if (isMusicPlaying) {
      musicIcon.textContent = '🔊';
      musicToggle.classList.add('playing');
    } else {
      musicIcon.textContent = '🔇';
      musicToggle.classList.remove('playing');
    }
  }

  // Sync music play/pause button in player card
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
      } else {
        bgMusic.play().then(() => {
          isMusicPlaying = true;
        }).catch(() => {});
      }
      updateMusicUI();
      updatePlayPauseBtn();
    });
  }

  function updatePlayPauseBtn() {
    const btn = document.getElementById('playPauseBtn');
    if (!btn) return;
    if (isMusicPlaying) {
      btn.textContent = '⏸';
      btn.classList.add('playing');
    } else {
      btn.textContent = '▶';
      btn.classList.remove('playing');
    }
  }

  // Update progress bar for music
  bgMusic.addEventListener('timeupdate', () => {
    const fill = document.getElementById('progressFill');
    if (fill && bgMusic.duration) {
      const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
      fill.style.width = pct + '%';
    }
    updatePlayPauseBtn();
  });

  bgMusic.addEventListener('ended', () => {
    isMusicPlaying = false;
    updateMusicUI();
    updatePlayPauseBtn();
  });

  // ========== COUNTDOWN TIMER ==========
  // Wedding date: 05 Oktober 2026 08:00 WIB (UTC+7 = 01:00 UTC)
  const weddingDate = new Date('2026-10-05T01:00:00Z');

  function updateCountdown() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('countDays').textContent = '00';
      document.getElementById('countHours').textContent = '00';
      document.getElementById('countMinutes').textContent = '00';
      document.getElementById('countSeconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minutesEl = document.getElementById('countMinutes');
    const secondsEl = document.getElementById('countSeconds');

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ========== COPY REKENING ==========
  const copyBtns = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rekening = btn.getAttribute('data-rekening');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rekening).then(() => {
          showToast('Nomor rekening berhasil disalin!');
          btn.textContent = '✅ Tersalin!';
          setTimeout(() => {
            btn.textContent = '📋 Salin No. Rekening';
          }, 2000);
        }).catch(() => {
          fallbackCopy(rekening, btn);
        });
      } else {
        fallbackCopy(rekening, btn);
      }
    });
  });

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Nomor rekening berhasil disalin!');
      btn.textContent = '✅ Tersalin!';
      setTimeout(() => {
        btn.textContent = '📋 Salin No. Rekening';
      }, 2000);
    } catch (e) {
      showToast('Gagal menyalin. Silakan salin manual.');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ========== RSVP FORM ==========
  const rsvpForm = document.getElementById('rsvpForm');
  const guestInput = document.getElementById('guestInput');
  const ucapanInput = document.getElementById('ucapanInput');
  const rsvpOptionBtns = document.querySelectorAll('.rsvp-option-btn');
  const guestWall = document.getElementById('guestWall');
  const wallEmpty = document.getElementById('wallEmpty');

  let selectedAttendance = 'hadir';

  rsvpOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rsvpOptionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAttendance = btn.getAttribute('data-value');
    });
  });

  // Load saved messages
  let messages = [];
  try {
    const saved = localStorage.getItem('wedding_messages');
    if (saved) messages = JSON.parse(saved);
  } catch (e) {}

  renderMessages();

  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = guestInput.value.trim();
    const message = ucapanInput.value.trim();

    if (!name) {
      showToast('Silakan masukkan nama lengkap');
      return;
    }

    const attendanceLabels = {
      'hadir': '🎉 Akan Hadir',
      'tidak_hadir': '😢 Tidak Bisa Hadir',
      'masih_ragu': '🤔 Masih Ragu'
    };

    const newMsg = {
      name: name,
      status: attendanceLabels[selectedAttendance] || '🎉 Akan Hadir',
      text: message || 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah. 🤍',
      time: new Date().toLocaleString('id-ID')
    };

    messages.unshift(newMsg);

    try {
      localStorage.setItem('wedding_messages', JSON.stringify(messages));
    } catch (e) {}

    renderMessages();

    // Reset form
    guestInput.value = '';
    ucapanInput.value = '';
    rsvpOptionBtns.forEach(b => b.classList.remove('active'));
    rsvpOptionBtns[0].classList.add('active');
    selectedAttendance = 'hadir';

    showToast('Ucapan berhasil dikirim! 🤍');
  });

  function renderMessages() {
    if (!guestWall) return;

    if (messages.length === 0) {
      if (wallEmpty) wallEmpty.style.display = 'block';
      return;
    }

    if (wallEmpty) wallEmpty.style.display = 'none';

    // Keep the wallEmpty element but remove all message divs
    const existingMsgs = guestWall.querySelectorAll('.wall-message');
    existingMsgs.forEach(el => el.remove());

    messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'wall-message';
      div.innerHTML = `
        <p class="wall-message-name">${escapeHtml(msg.name)}</p>
        <p class="wall-message-status">${escapeHtml(msg.status)}</p>
        <p class="wall-message-text">${escapeHtml(msg.text)}</p>
      `;
      guestWall.appendChild(div);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========== SCROLL ANIMATIONS ==========
  // Show music toggle after scrolling
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    lastScroll = scrollTop;
  });

  // ========== TIMELINE ANIMATION ON SCROLL ==========
  const timelineItems = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.2 });

  timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    if (item.querySelector('.timeline-content')?.closest('.timeline-item') === item) {
      const isLeft = item.getAttribute('data-aos') === 'fade-left';
      item.style.transform = isLeft ? 'translateX(30px)' : 'translateX(-30px)';
    }
    observer.observe(item);
  });

  // ========== SPARKLE CURSOR EFFECT ==========
  let sparkleThrottle = false;
  document.addEventListener('click', (e) => {
    if (sparkleThrottle) return;
    sparkleThrottle = true;
    setTimeout(() => { sparkleThrottle = false; }, 200);

    for (let i = 0; i < 6; i++) {
      const sparkle = document.createElement('div');
      sparkle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 4px;
        height: 4px;
        background: ${['#C9A96E', '#6B1436', '#C0392B', '#4A6741'][Math.floor(Math.random() * 4)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        transition: all 0.6s ease;
      `;
      document.body.appendChild(sparkle);

      const angle = (Math.PI * 2 * i) / 6;
      const dist = 20 + Math.random() * 30;
      requestAnimationFrame(() => {
        sparkle.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
        sparkle.style.opacity = '0';
      });

      setTimeout(() => sparkle.remove(), 700);
    }
  });

});
