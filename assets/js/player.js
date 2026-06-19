import { H as Hls } from './hls-vendor-dru42stk.js';

function initHlsPlayer() {
  const video = document.querySelector('[data-hls-src]');
  const startButton = document.querySelector('[data-player-start]');
  const status = document.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-hls-src');
  let hlsInstance = null;
  let loaded = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function loadSource() {
    if (loaded || !source) {
      return;
    }

    loaded = true;

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已加载，可以开始观看。');
      });
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，正在重新连接播放源。');
          hlsInstance.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在尝试恢复。');
          hlsInstance.recoverMediaError();
        } else {
          setStatus('播放源暂时无法打开，请稍后重试。');
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('已使用浏览器原生 HLS 播放能力。');
    } else {
      setStatus('当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
    }
  }

  async function startPlayback() {
    loadSource();
    try {
      await video.play();
      if (startButton) {
        startButton.hidden = true;
      }
    } catch (error) {
      setStatus('播放源已就绪，请再次点击播放器开始播放。');
    }
  }

  if (startButton) {
    startButton.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    loadSource();
    if (startButton) {
      startButton.hidden = true;
    }
  });

  video.addEventListener('pause', function () {
    if (startButton && video.currentTime === 0) {
      startButton.hidden = false;
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', initHlsPlayer);
