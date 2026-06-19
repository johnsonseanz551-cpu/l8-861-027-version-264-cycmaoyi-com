import { H as Hls } from "./hls-vendor.js";

export function setupMoviePlayer(options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const message = document.getElementById(options.messageId);
    let initialized = false;
    let hls = null;

    if (!video || !options.source) {
        return;
    }

    function showError() {
        if (message) {
            message.textContent = "视频暂时无法播放，请稍后重试";
        }
    }

    function attachSource(autoplay) {
        if (initialized) {
            if (autoplay) {
                const currentPlay = video.play();
                if (currentPlay && currentPlay.catch) {
                    currentPlay.catch(function () {});
                }
            }
            return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
            if (autoplay) {
                const nativePlay = video.play();
                if (nativePlay && nativePlay.catch) {
                    nativePlay.catch(function () {});
                }
            }
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(options.source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (autoplay) {
                    const hlsPlay = video.play();
                    if (hlsPlay && hlsPlay.catch) {
                        hlsPlay.catch(function () {});
                    }
                }
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError();
                }
            });
            return;
        }

        video.src = options.source;
        if (autoplay) {
            const fallbackPlay = video.play();
            if (fallbackPlay && fallbackPlay.catch) {
                fallbackPlay.catch(function () {});
            }
        }
    }

    function startPlayback() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        attachSource(true);
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("error", showError);
}
