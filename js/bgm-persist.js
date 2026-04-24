(function () {
  var STORAGE_KEY = 'letter1_bgm_state';

  var audio = document.getElementById('bgmMusic');
  if (!audio) return;

  function readState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeState() {
    try {
      if (audio.readyState < 1) return;
      var t = audio.currentTime;
      if (isNaN(t) || t < 0) return;
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ t: t, paused: audio.paused })
      );
    } catch (e) {}
  }

  var state = readState();
  var resumeHandled = false;

  function tryResume() {
    if (resumeHandled) return;
    if (!state || typeof state.t !== 'number' || state.t < 0.25) {
      var p0 = audio.play();
      if (p0 && p0.catch) p0.catch(function () {});
      resumeHandled = true;
      return;
    }
    var max = audio.duration;
    if (max && !isNaN(max) && state.t >= max - 0.2) {
      state = null;
      var p1 = audio.play();
      if (p1 && p1.catch) p1.catch(function () {});
      resumeHandled = true;
      return;
    }
    try {
      audio.currentTime = state.t;
    } catch (e) {
      var p2 = audio.play();
      if (p2 && p2.catch) p2.catch(function () {});
      resumeHandled = true;
      return;
    }
    if (state.paused) {
      audio.pause();
    } else {
      var p3 = audio.play();
      if (p3 && p3.catch) p3.catch(function () {});
    }
    resumeHandled = true;
  }

  audio.addEventListener('loadedmetadata', function onMeta() {
    audio.removeEventListener('loadedmetadata', onMeta);
    tryResume();
  });

  if (audio.readyState >= 1) {
    tryResume();
  } else if (!state) {
    var p = audio.play();
    if (p && p.catch) p.catch(function () {});
  }

  var lastSave = 0;
  audio.addEventListener('timeupdate', function () {
    var n = Date.now();
    if (n - lastSave < 800) return;
    lastSave = n;
    writeState();
  });

  audio.addEventListener('play', writeState);
  audio.addEventListener('pause', writeState);
  window.addEventListener('pagehide', writeState);
  window.addEventListener('beforeunload', writeState);
})();
