(function () {
    var current = document.currentScript;
    var base = current ? new URL(".", current.src).href : "";

    function canUseNative(video) {
        return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
    }

    function localHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (!base) {
            return Promise.resolve(null);
        }
        return import(new URL("hls-vendor-dru42stk.js", base).href).then(function (module) {
            return module.H || null;
        }).catch(function () {
            return null;
        });
    }

    function attach(video, src) {
        if (video.__attachedStream === src) {
            return Promise.resolve();
        }
        video.__attachedStream = src;
        if (canUseNative(video)) {
            video.src = src;
            return Promise.resolve();
        }
        return localHls().then(function (Hls) {
            if (Hls && Hls.isSupported && Hls.isSupported()) {
                if (video.__hlsInstance) {
                    video.__hlsInstance.destroy();
                }
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                video.__hlsInstance = hls;
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        });
    }

    function play(video, overlay, src) {
        attach(video, src).then(function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    window.MoviePlayer = {
        init: function (videoId, overlayId, src) {
            var video = document.getElementById(videoId);
            var overlay = document.getElementById(overlayId);
            if (!video || !src) {
                return;
            }
            if (overlay) {
                overlay.addEventListener("click", function () {
                    play(video, overlay, src);
                });
            }
            video.addEventListener("click", function () {
                if (!video.__attachedStream) {
                    play(video, overlay, src);
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay && video.currentTime === 0) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };
})();
