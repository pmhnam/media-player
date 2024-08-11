document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('video');
    const loadVideoBtn = document.getElementById('loadVideoBtn');
    const addSubtitleBtn = document.getElementById('addSubtitleBtn');
    const loadVideoPopup = document.getElementById('loadVideoPopup');
    const addSubtitlePopup = document.getElementById('addSubtitlePopup');
    const confirmSaveVideoPopup = document.getElementById('confirmSaveVideoPopup');
    const enterTitlePopup = document.getElementById('enterTitlePopup');
    const closeLoadVideoPopup = document.getElementById('closeLoadVideoPopup');
    const closeAddSubtitlePopup = document.getElementById('closeAddSubtitlePopup');
    const closeEnterTitlePopup = document.getElementById('closeEnterTitlePopup');
    const loadVideoSubmit = document.getElementById('loadVideoSubmit');
    const addSubtitleSubmit = document.getElementById('addSubtitleSubmit');
    const confirmSaveYes = document.getElementById('confirmSaveYes');
    const confirmSaveNo = document.getElementById('confirmSaveNo');
    const saveVideoWithTitle = document.getElementById('saveVideoWithTitle');
    const videoUrlInput = document.getElementById('videoUrl');
    const subtitleUrlInput = document.getElementById('subtitleUrl');
    const videoTitleInput = document.getElementById('videoTitle');
    const videoList = document.getElementById('videoListItems');

    let videoUrlToSave = '';
    let hls;
    let saveInterval;

    // Restore video state if available
    const savedVideoUrl = localStorage.getItem('videoUrl');
    const savedVideoTime = localStorage.getItem('videoTime');
    const savedVideoUrlInput = localStorage.getItem('videoUrlInput');
    if (savedVideoUrl) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(savedVideoUrl);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                videoElement.currentTime = savedVideoTime ? parseFloat(savedVideoTime) : 0;
                videoElement.play();
            });
        } else {
            videoElement.src = savedVideoUrl;
            videoElement.load();
            videoElement.currentTime = savedVideoTime ? parseFloat(savedVideoTime) : 0;
            videoElement.play();
        }
    }

    if (savedVideoUrlInput) {
        videoUrlInput.value = savedVideoUrlInput; // Restore the input value
    }


    function clearAllInterval() {
        const interval_id = window.setInterval(function () { }, Number.MAX_SAFE_INTEGER);

        // Clear any timeout/interval up to that id
        for (let i = 1; i < interval_id; i++) {
            window.clearInterval(i);
        }
    }

    // Save video state periodically
    function saveVideoState() {
        let videoUrlInput = localStorage.getItem('videoUrlInput');
        if (videoUrlInput) {
            localStorage.setItem('videoUrl', videoUrlInput);
            localStorage.setItem('videoTime', videoElement.currentTime);

            let listOfVideos = JSON.parse(localStorage.getItem('listOfVideos'));
            listOfVideos[videoUrlInput] = listOfVideos[videoUrlInput] || { url: videoUrlInput, title: 'Untitled', time: videoElement.currentTime };
            listOfVideos[videoUrlInput].time = videoElement.currentTime;
            localStorage.setItem('listOfVideos', JSON.stringify(listOfVideos));

            console.log(`saving video: ${videoUrlInput}, title: ${listOfVideos[videoUrlInput].title}, time: ${videoElement.currentTime}`);
            console.log(JSON.parse(localStorage.getItem('listOfVideos'))[videoUrlInput]);

        }
    }

    clearAllInterval();
    saveInterval = setInterval(saveVideoState, 5000); // Save every 5 seconds

    window.addEventListener('beforeunload', () => {
        clearInterval(saveInterval); // Clear interval when leaving
        clearAllInterval();
        saveVideoState(); // Ensure the latest state is saved
    });

    loadVideoBtn.addEventListener('click', () => {
        loadVideoPopup.style.display = 'flex';
    });

    addSubtitleBtn.addEventListener('click', () => {
        addSubtitlePopup.style.display = 'flex';
    });

    closeLoadVideoPopup.addEventListener('click', () => {
        loadVideoPopup.style.display = 'none';
    });

    closeAddSubtitlePopup.addEventListener('click', () => {
        addSubtitlePopup.style.display = 'none';
    });

    closeEnterTitlePopup.addEventListener('click', () => {
        enterTitlePopup.style.display = 'none';
    });

    loadVideoSubmit.addEventListener('click', () => {
        videoUrlToSave = videoUrlInput.value;
        if (videoUrlToSave) {
            // Save the input value
            localStorage.setItem('videoUrlInput', videoUrlToSave);

            if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(videoUrlToSave);
                hls.attachMedia(videoElement);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    videoElement.play();
                });
            } else {
                videoElement.src = videoUrlToSave;
                videoElement.load();
                videoElement.play();
            }

            loadVideoPopup.style.display = 'none';
            confirmSaveVideoPopup.style.display = 'flex'; // Show confirmation popup
        }
    });

    addSubtitleSubmit.addEventListener('click', () => {
        const subtitleUrl = subtitleUrlInput.value;
        if (subtitleUrl) {
            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.src = subtitleUrl;
            track.srclang = 'en';
            track.label = 'English';
            videoElement.appendChild(track);
            subtitleUrlInput.value = ''; // Clear input
        }
        addSubtitlePopup.style.display = 'none';
    });

    confirmSaveYes.addEventListener('click', () => {
        enterTitlePopup.style.display = 'flex'; // Show title input popup
        confirmSaveVideoPopup.style.display = 'none'; // Hide confirmation popup
    });

    confirmSaveNo.addEventListener('click', () => {
        confirmSaveVideoPopup.style.display = 'none'; // Hide confirmation popup
    });

    saveVideoWithTitle.addEventListener('click', () => {
        const videoTitle = videoTitleInput.value || 'Untitled Video';
        if (videoUrlToSave) {
            saveVideoLink(videoUrlToSave, videoTitle);
            videoUrlInput.value = ''; // Clear input
            videoTitleInput.value = ''; // Clear title input
        }
        enterTitlePopup.style.display = 'none'; // Hide title input popup
    });

    function saveVideoLink(url, title) {
        const listItem = document.createElement('li');
        const btn = document.createElement('button');
        btn.classList.add('btn');
        btn.textContent = title;
        btn.id = url;
        listItem.appendChild(btn);
        videoList.appendChild(listItem);
        let listOfVideos = JSON.parse(localStorage.getItem('listOfVideos'));
        listOfVideos = listOfVideos || {};
        listOfVideos[url] = { url, title, time: videoElement.currentTime };
        localStorage.setItem('listOfVideos', JSON.stringify(listOfVideos));
        btn.addEventListener('click', () => {
            const savedVideoUrl = btn.id;
            if (Hls.isSupported()) {
                if (hls) {
                    hls.destroy(); // Destroy existing HLS instance if present
                }
                hls = new Hls();
                hls.loadSource(savedVideoUrl);
                hls.attachMedia(videoElement);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    videoElement.play();
                });
            } else {
                videoElement.src = savedVideoUrl;
                videoElement.load();
                videoElement.currentTime = 0;
                videoElement.play();
            }
            // save video state periodically every 5 seconds and update listOfVideos
            clearAllInterval();
            saveInterval = setInterval(saveVideoState, 5000);
        });
    }

    function loadSavedVideos() {
        const listOfVideos = JSON.parse(localStorage.getItem('listOfVideos'));
        if (listOfVideos) {
            Object.values(listOfVideos).forEach((video) => {
                console.log(`Video: ${video.url}, Title: ${video.title}, Time: ${video.time}`);

                const listItem = document.createElement('li');
                const btn = document.createElement('button');
                btn.classList.add('btn');
                btn.textContent = video.title;
                btn.id = video.url;
                listItem.appendChild(btn);
                videoList.appendChild(listItem);
                btn.addEventListener('click', () => {


                    const savedVideoUrl = btn.id;
                    if (Hls.isSupported()) {
                        if (hls) {
                            hls.destroy(); // Destroy existing HLS instance if present
                        }
                        hls = new Hls();
                        hls.loadSource(savedVideoUrl);
                        hls.attachMedia(videoElement);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            const videos = JSON.parse(localStorage.getItem('listOfVideos'));
                            localStorage.setItem('videoUrl', btn.id);
                            console.log(`setting videoUrl to: ${btn.id}`);
                            const currentVideo = videos[savedVideoUrl];
                            videoElement.currentTime = currentVideo.time ? parseFloat(currentVideo.time) : 0;
                            videoElement.play();
                        });
                    } else {
                        videoElement.src = savedVideoUrl;
                        videoElement.load();
                        videoElement.currentTime = 0;
                        videoElement.play();
                    }
                    clearAllInterval();
                    saveInterval = setInterval(saveVideoState, 5000);
                });
            });
        }
    }


    // Function to get query parameter
    function getQueryParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Get video URL from query parameter
    const videoUrlFromQuery = getQueryParameter('v');
    if (videoUrlFromQuery) {
        videoUrlInput.value = videoUrlFromQuery;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(videoUrlFromQuery);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                videoElement.play();
            });
        } else {
            videoElement.src = videoUrlFromQuery;
            videoElement.load();
            videoElement.play();
        }
    }

    loadSavedVideos();
});
