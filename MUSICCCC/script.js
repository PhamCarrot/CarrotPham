document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio();
    const elements = {
        albumCover: document.getElementById('album-cover'),
        body: document.body,
        playlistItems: document.querySelectorAll('#playlist li'),
        playPauseBtn: document.getElementById('play-pause'),
        shuffleBtn: document.getElementById('shuffle'),
        repeatBtn: document.getElementById('repeat'),
        nextBtn: document.getElementById('next'),
        prevBtn: document.getElementById('prev'),
        progressBar: document.querySelector('.progress-bar'),
        progressContainer: document.querySelector('.progress-container'),
        currentTimeDisplay: document.getElementById('current-time'),
        totalTimeDisplay: document.getElementById('total-time'),
        volumeBtn: document.getElementById('volume-btn'),
        volumeSlider: document.getElementById('volume-slider'),
        playlist: document.querySelector('.playlist'),
        songNameElement: document.querySelector('.song-name'),
        songArtistElement: document.querySelector('.song-artist')
    };

    let isShuffle = false, isRepeat = false, queue = [], currentIndex = 0;

    const formatTime = time => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

    const updateAlbumCover = coverUrl => {
        elements.albumCover.src = coverUrl;
        elements.albumCover.onload = () => {
            const colorThief = new ColorThief();
            const palette = colorThief.getPalette(elements.albumCover, 2);
            elements.body.style.background = `linear-gradient(to bottom right, rgb(${palette[0].join(',')}), rgb(${palette[1].join(',')}))`;
        };
    };

    const playSong = index => {
        const song = queue[index];
        if (song) {
            audio.src = song.src;
            updateAlbumCover(song.cover);
            audio.play();
            elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            currentIndex = index;
            elements.songNameElement.textContent = song.name;
            elements.songArtistElement.textContent = song.artist;
            elements.songNameElement.classList.toggle('marquee', elements.songNameElement.scrollWidth > elements.songNameElement.clientWidth);
        }
    };

    const initializeQueue = () => {
        queue = Array.from(elements.playlistItems).map(item => ({
            src: item.getAttribute('data-src'),
            cover: item.getAttribute('data-cover'),
            name: item.querySelector('.song-name').textContent,
            artist: item.querySelector('.song-artist').textContent
        }));
    };

    const applyMarqueeToAllSongs = () => {
        document.querySelectorAll('.song-name').forEach(songNameElement => {
            songNameElement.classList.toggle('marquee', songNameElement.scrollWidth > songNameElement.clientWidth);
        });
    };

    elements.playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (!audio.paused) audio.pause();
            playSong(index);
        });
    });

    elements.playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    elements.shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        elements.shuffleBtn.classList.toggle('active', isShuffle);
    });

    elements.repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        elements.repeatBtn.classList.toggle('active', isRepeat);
    });

    elements.nextBtn.addEventListener('click', () => {
        playSong(isShuffle ? Math.floor(Math.random() * queue.length) : (currentIndex + 1) % queue.length);
    });

    elements.prevBtn.addEventListener('click', () => {
        playSong(isShuffle ? Math.floor(Math.random() * queue.length) : (currentIndex - 1 + queue.length) % queue.length);
    });

    audio.addEventListener('ended', () => {
        playSong(isRepeat ? currentIndex : isShuffle ? Math.floor(Math.random() * queue.length) : (currentIndex + 1) % queue.length);
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isNaN(audio.duration)) {
            elements.progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
            elements.currentTimeDisplay.textContent = formatTime(audio.currentTime);
            elements.totalTimeDisplay.textContent = formatTime(audio.duration);
        }
    });

    elements.progressContainer.addEventListener('click', e => {
        if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = (e.offsetX / elements.progressContainer.clientWidth) * audio.duration;
        }
    });

    audio.addEventListener('loadedmetadata', () => console.log('Duration:', audio.duration));

    const savedVolume = localStorage.getItem('volume');
    audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 1;
    elements.volumeSlider.value = audio.volume;

    const updateVolumeIcon = () => {
        elements.volumeBtn.innerHTML = audio.volume === 0 ? '<i class="fas fa-volume-mute"></i>' : audio.volume < 0.5 ? '<i class="fas fa-volume-down"></i>' : '<i class="fas fa-volume-up"></i>';
    };

    elements.volumeSlider.addEventListener('input', () => {
        audio.volume = elements.volumeSlider.value;
        localStorage.setItem('volume', elements.volumeSlider.value);
        updateVolumeIcon();
    });

    elements.volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            localStorage.setItem('lastVolume', audio.volume);
            audio.volume = 0;
            elements.volumeSlider.value = 0;
        } else {
            const lastVolume = localStorage.getItem('lastVolume') || 1;
            audio.volume = parseFloat(lastVolume);
            elements.volumeSlider.value = lastVolume;
        }
        updateVolumeIcon();
    });

    initializeQueue();
    applyMarqueeToAllSongs();
    elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});