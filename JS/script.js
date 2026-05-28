/* =====================================================
   script.js — Tablero Estético Personal
   Lógica de interactividad:
   · Pantalla de carga
   · Partículas flotantes de fondo
   · Reproductor de música (play/pausa/stop)
   · Barra de progreso de audio
   · Botón de silencio
   · Año en footer
===================================================== */


/* =====================================================
   CUANDO LA PÁGINA TERMINA DE CARGARSE completamente
   (HTML + CSS + imágenes), ejecuta todo el código.
   Esto evita errores de "elemento no encontrado".
===================================================== */
document.addEventListener('DOMContentLoaded', () => {


  /* ==================================================
     MÓDULO 1: PANTALLA DE CARGA
     Muestra la pantalla de carga brevemente y la oculta
  ================================================== */

  const loadingScreen = document.getElementById('loading-screen');

  if (loadingScreen) {
    // Espera 1.5 segundos y luego oculta la pantalla de carga
    // CAMBIA el número 1500 para hacer la espera más larga o corta (en milisegundos)
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 1500);
  }


  /* ==================================================
     MÓDULO 2: PARTÍCULAS FLOTANTES (corazoncitos ♡)
     Genera pequeños corazones que flotan desde abajo
  ================================================== */

  const sparklesContainer = document.getElementById('sparkles-container');

  // Símbolos que pueden aparecer como partículas
  // CAMBIA O AGREGA símbolos aquí si quieres diferentes emojis
  const sparkleSymbols = ['♡', '✦', '✧', '✿', '◌', '✽'];

  // Número total de partículas flotando a la vez
  // CAMBIA este número: más = más saturado, menos = más sutil
  const SPARKLE_COUNT = 20;

  // Función que crea una sola partícula
  function createSparkle() {
    const el = document.createElement('span');
    el.className = 'sparkle';

    // Símbolo aleatorio del arreglo de arriba
    el.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];

    // Posición horizontal aleatoria (de 0% a 100% del ancho)
    el.style.left = Math.random() * 100 + '%';

    // Empieza desde abajo
    el.style.bottom = '-20px';

    // Tamaño aleatorio entre 10px y 20px
    el.style.fontSize = (10 + Math.random() * 10) + 'px';

    // Duración de la animación aleatoria (entre 6 y 12 segundos)
    el.style.animationDuration = (6 + Math.random() * 6) + 's';

    // Retraso aleatorio para que no todas aparezcan al mismo tiempo
    el.style.animationDelay = (Math.random() * 8) + 's';

    // Opacidad base aleatoria
    el.style.opacity = 0.3 + Math.random() * 0.4;

    sparklesContainer.appendChild(el);

    // Cuando la animación termina, se elimina y se crea una nueva
    el.addEventListener('animationend', () => {
      el.remove();
      createSparkle(); // ♻️ Recrear para efecto continuo
    });
  }

  // Crear todas las partículas iniciales
  if (sparklesContainer) {
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      createSparkle();
    }
  }


  /* ==================================================
     MÓDULO 3: REPRODUCTOR DE MÚSICA
     Maneja el play/pausa de las portadas de discos
  ================================================== */

  // El elemento <audio> que está en el HTML (invisible)
  const audioPlayer = document.getElementById('main-audio');

  // Selecciona TODAS las tarjetas de música
  const musicCards = document.querySelectorAll('.music-card');

  // Esta variable guarda la tarjeta que está sonando actualmente
  // null = ninguna canción está sonando
  let currentCard = null;

  // La barra "Ahora reproduciendo"
  const npTitle    = document.getElementById('np-title');
  const npProgress = document.getElementById('progress-fill');
  const muteBtn    = document.getElementById('mute-btn');


  /* ------------------------------------------------
     Para cada tarjeta de música, escuchar el clic
  ------------------------------------------------ */
  musicCards.forEach((card) => {

    // También permite activar con la tecla Enter (accesibilidad)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    card.addEventListener('click', () => {

      // Obtiene la URL del audio de este card
      // (del atributo data-audio="..." en el HTML)
      const audioSrc = card.dataset.audio;

      // Obtiene el nombre de la canción y artista para la barra
      const title  = card.querySelector('.music-title')?.textContent || 'desconocida';
      const artist = card.querySelector('.music-artist')?.textContent || '';

      /* ---- CASO 1: Esta tarjeta ya está sonando → PAUSAR ---- */
      if (currentCard === card && !audioPlayer.paused) {
        audioPlayer.pause();
        card.classList.remove('playing');
        // Actualiza la barra de "ahora reproduciendo"
        if (npTitle) npTitle.textContent = '⏸ ' + title;
        return;   // Salir de la función
      }

      /* ---- CASO 2: Esta tarjeta estaba pausada → REANUDAR ---- */
      if (currentCard === card && audioPlayer.paused) {
        audioPlayer.play().catch(handleAudioError);
        card.classList.add('playing');
        if (npTitle) npTitle.textContent = '♫ ' + title + ' · ' + artist;
        return;
      }

      /* ---- CASO 3: Otra tarjeta estaba sonando → CAMBIAR ---- */
      if (currentCard && currentCard !== card) {
        // Quitamos el estado "playing" de la tarjeta anterior
        currentCard.classList.remove('playing');
      }

      // Verificar que el audio tiene una URL real configurada
      // Si aún dice "TU_CANCION_X.mp3", mostrar aviso amigable
      if (audioSrc.startsWith('TU_CANCION') || audioSrc === '') {
        showMusicHint(card);
        return;
      }

      // Cargar la nueva canción en el elemento <audio>
      audioPlayer.src = audioSrc;

      // Reproducir la canción (retorna una promesa)
      audioPlayer.play().catch(handleAudioError);

      // Marcar esta tarjeta como la activa
      card.classList.add('playing');
      currentCard = card;

      // Actualizar la barra "ahora reproduciendo"
      if (npTitle) npTitle.textContent = '♫ ' + title + ' · ' + artist;

    }); // fin click

  }); // fin forEach


  /* ------------------------------------------------
     EVENTO: Cuando la canción termina sola
  ------------------------------------------------ */
  audioPlayer.addEventListener('ended', () => {
    if (currentCard) {
      currentCard.classList.remove('playing');
    }
    currentCard = null;
    if (npTitle) npTitle.textContent = 'sin reproducir';
    if (npProgress) npProgress.style.width = '0%';
  });


  /* ------------------------------------------------
     EVENTO: Actualizar barra de progreso mientras suena
  ------------------------------------------------ */
  audioPlayer.addEventListener('timeupdate', () => {
    if (!npProgress || !audioPlayer.duration) return;

    // Calcula qué porcentaje de la canción ha pasado
    const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    npProgress.style.width = pct + '%';
  });


  /* ------------------------------------------------
     BOTÓN DE SILENCIO
  ------------------------------------------------ */
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      audioPlayer.muted = !audioPlayer.muted;
      // Cambia el ícono según el estado
      muteBtn.textContent = audioPlayer.muted ? '🔇' : '🔊';
    });
  }


  /* ------------------------------------------------
     Función auxiliar: manejo de errores de audio
     Aparece cuando el archivo no existe o no carga
  ------------------------------------------------ */
  function handleAudioError(err) {
    console.warn('⚠️ No se pudo reproducir el audio:', err);
    // Quitar estado de reproducción de la tarjeta
    if (currentCard) {
      currentCard.classList.remove('playing');
    }
    if (npTitle) npTitle.textContent = '⚠️ error al cargar el audio';
    currentCard = null;
  }


  /* ------------------------------------------------
     Función: muestra una nota cuando el audio no está
     configurado todavía (modo placeholder)
  ------------------------------------------------ */
  function showMusicHint(card) {
    // Resaltar brevemente la tarjeta
    card.style.outline = '3px dashed var(--color-pink-deep)';
    card.style.outlineOffset = '4px';
    if (npTitle) npTitle.textContent = '📎 configura tu canción en index.html';
    setTimeout(() => {
      card.style.outline = '';
      card.style.outlineOffset = '';
    }, 2500);
  }


  /* ==================================================
     MÓDULO 4: AÑO ACTUAL EN EL FOOTER
     Se actualiza solo, no tienes que cambiarlo nunca
  ================================================== */
  const footerYear = document.querySelector('.footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }


  /* ==================================================
     MÓDULO 5: ANIMACIÓN DE APARICIÓN AL HACER SCROLL
     Las secciones aparecen suavemente al desplazarse
     (usa IntersectionObserver, nativo del navegador)
  ================================================== */

  // Selecciona todos los bloques de sección
  const sectionBlocks = document.querySelectorAll('.section-block');

  // Configuración: la animación se dispara cuando el elemento
  // es al menos 10% visible en la pantalla
  const observerConfig = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Elemento visible: agregar clase para animar
        entry.target.classList.add('visible');
        // Una vez visible, dejar de observar (eficiencia)
        observer.unobserve(entry.target);
      }
    });
  }, observerConfig);

  // Inicialmente ocultar las secciones y observarlas
  sectionBlocks.forEach((block, index) => {
    // Retraso escalonado: cada sección aparece un poco después
    block.style.transitionDelay = (index * 0.08) + 's';
    observer.observe(block);
  });


  /* ==================================================
     MÓDULO 6: EFECTO DE SEGUIMIENTO DEL CURSOR
     Corazoncito que sigue al mouse por la pantalla
     (sutil, no interfiere con la interacción)
  ================================================== */
  const cursorDot = document.createElement('div');
  cursorDot.id = 'cursor-dot';
  cursorDot.setAttribute('aria-hidden', 'true');
  // Aplicar estilos directamente
  Object.assign(cursorDot.style, {
    position: 'fixed',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--color-pink-deep)',
    pointerEvents: 'none',
    zIndex: '9998',
    opacity: '0.6',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 0.3s ease',
    boxShadow: '0 0 8px rgba(212, 132, 143, 0.8)'
  });
  document.body.appendChild(cursorDot);

  // Mover el punto al cursor
  document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top  = e.clientY + 'px';
  });

  // Ocultar el punto cuando el mouse sale de la ventana
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '0.6';
  });


  // =====================================================
  // FIN DEL SCRIPT
  // Si quieres agregar funcionalidad, hazlo aquí arriba ↑
  // =====================================================

}); // fin DOMContentLoaded