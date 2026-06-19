(function () {
  var card = document.querySelector('[data-player]');

  if (!card) {
    return;
  }

  var video = card.querySelector('video');
  var playButton = card.querySelector('[data-play]');
  var config = window.__PLAYER__ || {};
  var source = config.source;
  var hls = null;
  var attached = false;

  function fail() {
    card.classList.add('is-error');
  }

  function attach() {
    if (attached) {
      return true;
    }

    if (!video || !source) {
      fail();
      return false;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          fail();
        }
      });
      attached = true;
      return true;
    }

    fail();
    return false;
  }

  function start() {
    if (!attach()) {
      return;
    }

    card.classList.add('is-started');
    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.preventDefault();
      start();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      card.classList.add('is-started');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
