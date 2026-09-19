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
  const previewModal = document.getElementById('previewModal');
  const openDetailBtn = document.getElementById('openDetailInvitation');
  const mainContent = document.getElementById('mainContent');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  let isMusicPlaying = false;

  // ========== FULLSCREEN SLIDE SECTIONS ==========
  let slideSections = [];
  let currentSlide = 0;
  let slideNav = null;
  let prevBtn = null;
  let nextBtn = null;
  let dotsWrap = null;

  function startSlideShow() {
    initSlideSystem();
  }

  function initSlideSystem() {
    slideSections = Array.from(document.querySelectorAll('.main-content > section'));
    if (slideSections.length === 0) return;

    slideNav = document.getElementById('slideNav');
    prevBtn  = document.getElementById('prevSlide');
    nextBtn  = document.getElementById('nextSlide');
    dotsWrap = document.getElementById('slideDots');

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slideSections.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'dot';
        d.setAttribute('aria-label', 'Bagian ' + (i + 1));
        d.addEventListener('click', function () { goToSlide(i); });
        dotsWrap.appendChild(d);
      });
    }

    fitAllSlides();
    goToSlide(0);

    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); });

    if (slideNav) slideNav.classList.remove('hidden');

    bindSlideKeyNav();
    bindSlideWheel();
    bindSlideSwipe();

    // Refit when any image inside the frame finishes loading
    var refitPending = false;
    function refitSoon() {
      if (refitPending) return;
      refitPending = true;
      window.requestAnimationFrame(function () {
        refitPending = false;
        if (!slideSections.length) return;
        fitAllSlides();
        goToSlide(currentSlide);
      });
    }
    document.querySelectorAll('.main-content img').forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load', refitSoon);
      img.addEventListener('error', refitSoon);
    });

    window.addEventListener('resize', function () {
      if (!slideSections.length) return;
      fitAllSlides();
      goToSlide(currentSlide);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!slideSections.length) return;
        fitAllSlides();
        goToSlide(currentSlide);
      });
    }

    window.addEventListener('load', function () {
      if (!slideSections.length) return;
      fitAllSlides();
      goToSlide(currentSlide);
    });

    // Safety net: guarantee AOS / timeline content is visible
    // inside locked (non-scrollable) slides.
    window.setTimeout(function () {
      document.querySelectorAll('.main-content [data-aos]').forEach(function (el) {
        el.classList.add('aos-animate');
      });
      document.querySelectorAll('.main-content .timeline-item').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'translateX(0)';
      });
      fitAllSlides();
      goToSlide(currentSlide);
    }, 1200);
  }

  function fitSlide(section) {
    if (!section) return;
    var parent = section.parentElement;
    var availH = parent ? parent.clientHeight : window.innerHeight;
    var availW = parent ? parent.clientWidth : window.innerWidth;

    var savedH = section.style.height;
    var savedT = section.style.top;
    var savedB = section.style.bottom;
    var savedV = section.style.visibility;
    var savedTr = section.style.transition;

    section.style.transition = 'none';
    section.style.visibility = 'hidden';
    section.style.height = 'auto';
    section.style.top = 'auto';
    section.style.bottom = 'auto';

    var natH = section.offsetHeight || section.scrollHeight;
    var natW = section.offsetWidth  || section.scrollWidth;

    section.style.height = savedH;
    section.style.top    = savedT;
    section.style.bottom = savedB;
    section.style.visibility = savedV;
    section.style.transition = savedTr;

    var scaleH = natH > availH ? (availH - 2) / natH : 1;
    var scaleW = natW > availW ? (availW - 2) / natW : 1;
    var scale  = Math.max(0.2, Math.min(scaleH, scaleW, 1));

    section.style.setProperty('--fit-scale', scale.toFixed(4));
  }

  function fitAllSlides() {
    slideSections.forEach(fitSlide);
  }

  function goToSlide(index) {
    if (!slideSections.length) return;
    var total = slideSections.length;
    currentSlide = Math.max(0, Math.min(total - 1, index));

    slideSections.forEach(function (sec, i) {
      if (i === currentSlide) {
        sec.classList.add('active');
        sec.style.zIndex = '2';
        sec.style.transform = 'translateX(0) scale(var(--fit-scale, 1))';
      } else {
        sec.classList.remove('active');
        sec.style.zIndex = '1';
        sec.style.transform =
          (i < currentSlide ? 'translateX(-14px)' : 'translateX(14px)') +
          ' scale(var(--fit-scale, 1))';
      }
    });

    if (dotsWrap) {
      var dots = dotsWrap.querySelectorAll('.dot');
      dots.forEach(function (d, i) { d.classList.toggle('active', i === currentSlide); });
    }
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === total - 1;
  }

  function bindSlideKeyNav() {
    document.addEventListener('keydown', function (e) {
      if (!mainContent.classList.contains('visible')) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(slideSections.length - 1);
      }
    });
  }

  function bindSlideWheel() {
    var wheelLock = false;
    document.addEventListener('wheel', function (e) {
      if (!mainContent.classList.contains('visible')) return;
      if (e.target && e.target.closest && e.target.closest('.wall-list, .rsvp-form-card, textarea, input, .slide-nav, .section-rsvp')) return;
      if (wheelLock) return;
      var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 15) return;
      wheelLock = true;
      if (delta > 0) goToSlide(currentSlide + 1);
      else goToSlide(currentSlide - 1);
      setTimeout(function () { wheelLock = false; }, 900);
    }, { passive: true });
  }

  function bindSlideSwipe() {
    var touchStartX = 0, touchStartY = 0;
    mainContent.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    mainContent.addEventListener('touchend', function (e) {
      if (!mainContent.classList.contains('visible')) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        goToSlide(currentSlide + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  openBtn.addEventListener('click', () => {
    coverModal.classList.add('hidden');
    if (previewModal) {
      previewModal.classList.add('visible');
      previewModal.setAttribute('aria-hidden', 'false');
    }
  });

  openDetailBtn.addEventListener('click', () => {
    if (previewModal) {
      previewModal.classList.remove('visible');
      previewModal.setAttribute('aria-hidden', 'true');
    }
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
    const daysEl = document.getElementById('countDays');
    if (!daysEl) return;

    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      document.getElementById('countHours').textContent = '00';
      document.getElementById('countMinutes').textContent = '00';
      document.getElementById('countSeconds').textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const hoursEl = document.getElementById('countHours');
    const minutesEl = document.getElementById('countMinutes');
    const secondsEl = document.getElementById('countSeconds');

    daysEl.textContent = String(days).padStart(2, '0');
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
          btn.textContent = 'Tersalin!';
          setTimeout(() => {
            btn.textContent = 'Salin';
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
      btn.textContent = 'Tersalin!';
      setTimeout(() => {
        btn.textContent = 'Salin';
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

    // Bawa pandangan ke kolom ucapan agar pesan baru terlihat
    const rsvpContainer = document.querySelector('.section-rsvp > .container');
    const wallTitle = document.querySelector('.guest-wall .wall-title');
    if (rsvpContainer && wallTitle) {
      const target = wallTitle.offsetTop - 12;
      if (typeof rsvpContainer.scrollTo === 'function') {
        rsvpContainer.scrollTo({ top: target, behavior: 'smooth' });
      } else {
        rsvpContainer.scrollTop = target;
      }
    }
  });

  function renderMessages() {
    if (!guestWall) return;

    const wallCount = document.getElementById('wallCount');
    if (wallCount) wallCount.textContent = messages.length;

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
        <div class="wall-message-head">
          <p class="wall-message-name">${escapeHtml(msg.name)}</p>
          <span class="wall-message-time">${escapeHtml(msg.time || '')}</span>
        </div>
        <span class="wall-message-status">${escapeHtml(msg.status)}</span>
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
