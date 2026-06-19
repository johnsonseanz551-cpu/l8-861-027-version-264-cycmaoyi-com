import { H as Hls } from "./hls-vendor-dru42stk.js";

function initPlayer() {
  const video = document.querySelector("[data-player]");
  const layer = document.querySelector("[data-play-layer]");
  if (!video) {
    return;
  }
  const stream = video.getAttribute("data-stream");
  let hls = null;
  let ready = false;

  const attach = () => {
    if (ready || !stream) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
    ready = true;
  };

  const play = async () => {
    attach();
    video.controls = true;
    if (layer) {
      layer.hidden = true;
    }
    try {
      await video.play();
    } catch (error) {
      if (layer) {
        layer.hidden = false;
      }
    }
  };

  if (layer) {
    layer.addEventListener("click", play);
  }
  video.addEventListener("click", () => {
    if (!ready || video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => {
    if (layer) {
      layer.hidden = true;
    }
  });
  video.addEventListener("ended", () => {
    if (layer) {
      layer.hidden = false;
    }
  });
  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener("DOMContentLoaded", initPlayer);
