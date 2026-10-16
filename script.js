const database = {
    "No.1": {
        image: "https://imglink.cc/cdn/ps1VZbADCU.jpeg",
        songs: [
            { name: "Bol Pantolon ve 70'lik", audio: "https://mp3tourl.com/audio/1791128905186-33746bc8-1370-4945-ae59-ae9e9a6b427b.mp3" },
            { name: "Çiçeklerde Bir Telaş Var", audio: "https://mp3tourl.com/audio/1791128366485-6a2343b3-cb15-4b1a-b37a-b4154a64a6c8.mp3" },
            { name: "Yarım Kalan Sigara", audio: "https://mp3tourl.com/audio/1791125222684-2b63db1d-5683-4c35-bf87-a2fe5098becc.mp3" },
            { name: "Ellere Bıraktın", audio: "https://mp3tourl.com/audio/1791126859157-efab78f5-b882-4826-a67c-056970fece43.mp3" },
            { name: "Böyle İyi", audio: "https://mp3tourl.com/audio/1791126909945-3c0fe5ae-c504-4586-bdf7-786977c5ed0c.mp3" },
            { name: "Koyu Siyah", audio: "https://mp3tourl.com/audio/1791129154917-8e8e41c5-3335-4da8-b9ee-dc58f43489a0.mp3" }
        ]
    },
    "Era7capone": {
        image: "https://i.scdn.co/image/ab6761610000e5ebad2f9bccbaebf444948d449c",
        songs: [
            { name: "ÜZÜLECEKSİN 2.0", audio: "https://mp3tourl.com/audio/1791822697888-88ca68c9-ccd3-4ce5-bd58-8592d6b599d1.mp3" },
            { name: "Bana Sor", audio: "" }
        ]
    },
    "Stabil": {
        image: "https://imglink.cc/cdn/XDWRXNsFwg.jpeg",
        songs: [
            { name: "Lavanta", audio: "https://mp3tourl.com/audio/1791129301842-41e070e4-ee48-41a1-ac6b-7f03ffa15f48.mp3" }
        ]
    },
    "Sezen Aksu": {
        image: "https://cdn-images.dzcdn.net/images/artist/9c62f746db8e41bb49eb13a3c254f597/500x500.jpg",
        songs: [
            { name: "Ben Sende Tutuklu Kaldım", audio: "" },
            { name: "Zalim", audio: "" },
            { name: "Biliyorsun", audio: "" },
            { name: "Vazgeçtim", audio: "" }
        ]
    },
    "Ahmet Kaya": {
        image: "https://images.genius.com/e65bb72e3247e0e9ba8bbe9738de129a.560x420x1.jpg",
        songs: []
    },
    "Ferdi Tayfur": {
        image: "https://images.genius.com/f2ab0d534280af3e32355a81983d4418.388x388x1.jpg",
        songs: []
    },
    "Yıldız Tilbe": {
        image: "https://cdn-images.dzcdn.net/images/artist/6f73d7f50a473debb377286e0badd55b/1900x1900-000000-80-0-0.jpg",
        songs: [
            { name: "Emi", audio: "" },
            { name: "Çat Kapı", audio: "" },
            { name: "Çabuk Olalım Aşkım", audio: "" }
        ]
    },
    "Blok3": {
        image: "https://i.scdn.co/image/ab6761610000e5eb5629f9e98419614c7185ae1e",
        songs: [
            { name: "Keşke", audio: "" }
        ]
    },
    "Ati242": {
        image: "https://images.genius.com/f1d535c69dec4c0647d28216e671b65c.1000x1000x1.png",
        songs: [
            { name: "Keşke", audio: "" },
            { name: "Değişmene Rağmen", audio: "" }
        ]
    },
    "Şam": {
        image: "https://images.genius.com/37f0ceb12017f3e66031553de94c583b.1000x1000x1.png",
        songs: [
            { name: "Sudan Pantolon", audio: "" },
            { name: "Bana Sor", audio: "" }
        ]
    }
};

const artists = Object.keys(database).map(name => ({ name, image: database[name].image }));
let currentSongs = [];
let activeArtist = null;
let currentPlayingKey = '';
let currentSongIndex = 0;
let isPlaying = false;
let globalAudio = null;
let isActionLocked = false;

const audioCache = {};

function preloadImages() {
    for (let artist in database) {
        const img = new Image();
        img.src = database[artist].image;
    }
}
preloadImages();

window.addEventListener('load', () => {
    setTimeout(() => {
        const intro = document.getElementById('introScreen');
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.style.display = 'none';
            document.getElementById('artistScreen').classList.add('active');
        }, 200);
    }, 800);
});

class WheelPicker {
    constructor(containerEl, listEl, getDataFn) {
        this.container = containerEl;
        this.list = listEl;
        this.getData = getDataFn;
        this.offset = 0;
        this.targetOffset = 0;
        this.isDragging = false;
        this.startY = 0;
        this.velocity = 0;
        this.itemHeight = 52;
        this.visibleRange = 5;
        this.initDOM();
        this.initEvents();
    }

    initDOM() {
        this.list.innerHTML = '';
        this.items = [];
        for (let i = 0; i < this.visibleRange; i++) {
            const el = document.createElement('div');
            el.className = 'picker-wheel-item';
            el.innerHTML = '<span class="font-semibold tracking-tight"></span>';
            
            const index = i;
            el.addEventListener('click', () => {
                if (this.isDragging) return;
                const center = Math.floor(this.visibleRange / 2);
                let target = Math.round(this.offset) + (index - center);
                const data = this.getData();
                this.targetOffset = Math.max(0, Math.min(target, data.length - 1));
            });
            this.list.appendChild(el);
            this.items.push(el);
        }
    }

    update() {
        const data = this.getData();
        const len = data.length;
        if (len === 0) return;

        if (!this.isDragging) {
            this.targetOffset += this.velocity;
            this.velocity *= 0.50;
            if (Math.abs(this.velocity) < 0.001) {
                const nearest = Math.round(this.targetOffset);
                this.targetOffset += (nearest - this.targetOffset) * 0.12;
            }
        }

        this.offset += (this.targetOffset - this.offset) * 0.12;
        const maxOffset = len - 1;
        this.targetOffset = Math.max(0, Math.min(this.targetOffset, maxOffset));
        this.offset = Math.max(0, Math.min(this.offset, maxOffset));

        const baseIndex = Math.round(this.offset) - Math.floor(this.visibleRange / 2);

        for (let i = 0; i < this.visibleRange; i++) {
            const itemIndex = baseIndex + i;
            const distance = itemIndex - this.offset;
            const yPos = distance * this.itemHeight;
            const absDist = Math.abs(distance);

            const el = this.items[i];
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
            const span = el.querySelector('span');

            if (itemIndex < 0 || itemIndex >= len) {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                span.textContent = '';
            } else {
                const calculatedOpacity = Math.max(0, 1 - (absDist / 2.2));
                el.style.opacity = calculatedOpacity;
                el.style.zIndex = Math.round(20 - absDist * 2);
                el.style.pointerEvents = calculatedOpacity > 0.1 ? 'auto' : 'none';

                const itemObj = data[itemIndex];
                span.textContent = typeof itemObj === 'string' ? itemObj : itemObj.name;

                if (absDist < 0.3) {
                    span.style.color = '#fafafa';
                    span.style.fontSize = '1.3rem';
                    span.style.textShadow = '0 0 16px rgba(255, 255, 255, 0.15)';
                } else {
                    span.style.color = '#71717a';
                    span.style.fontSize = '1.05rem';
                    span.style.textShadow = 'none';
                }
            }
        }
    }

    getSelectedIndex() {
        const data = this.getData();
        const len = data.length;
        return data[Math.max(0, Math.min(Math.round(this.offset), len - 1))];
    }

    initEvents() {
        const start = (y) => { 
            this.isDragging = true; 
            this.startY = y; 
            this.velocity = 0; 
        };
        
        const move = (y) => {
            if (!this.isDragging) return;
            const delta = y - this.startY;
            this.startY = y;
            const factor = 75; 
            this.targetOffset -= delta / factor;
            this.velocity = -delta / factor;
        };
        
        const end = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            const data = this.getData();
            this.targetOffset = Math.max(0, Math.min(Math.round(this.targetOffset), data.length - 1));
        };

        this.container.addEventListener('mousedown', (e) => {
            if (e.target.closest('button') || e.target.closest('#bottomMiniPlayer')) return;
            start(e.clientY);
        });
        window.addEventListener('mousemove', (e) => move(e.clientY));
        window.addEventListener('mouseup', end);

        this.container.addEventListener('touchstart', (e) => {
            if (e.target.closest('button') || e.target.closest('#bottomMiniPlayer')) return;
            if (e.touches.length) start(e.touches[0].clientY);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => { 
            if (e.touches.length) move(e.touches[0].clientY); 
        }, { passive: true });

        window.addEventListener('touchend', end);

        this.container.addEventListener('wheel', (e) => {
            if (e.target.closest('button') || e.target.closest('#bottomMiniPlayer')) return;
            e.preventDefault();
            const data = this.getData();
            this.targetOffset += e.deltaY * 0.0018;
            this.targetOffset = Math.max(0, Math.min(Math.round(this.targetOffset), data.length - 1));
        }, { passive: false });
    }
}

const artistWheel = new WheelPicker(
    document.getElementById('artistWheelArea'),
    document.getElementById('artistList'),
    () => artists
);

let songWheel = null;

function handleSafeClick(callback, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (isActionLocked) return;
    isActionLocked = true;
    callback();
    setTimeout(() => { isActionLocked = false; }, 100);
}

document.addEventListener('dblclick', (e) => { e.preventDefault(); }, { passive: false });

document.getElementById('miniPlayBtn').addEventListener('click', (e) => {
    handleSafeClick(togglePlayPause, e);
});

document.getElementById('miniAddBtn').addEventListener('click', () => {
    alert("Şarkı eklendi!");
});

function updatePlayerUI() {
    const bottomMiniPlayer = document.getElementById('bottomMiniPlayer');
    const miniImg = document.getElementById('miniPlayerImg');
    const miniSong = document.getElementById('miniPlayerSongTitle');
    const miniArtist = document.getElementById('miniPlayerArtistTitle');
    const miniPlayIcon = document.getElementById('miniPlayerPlayIcon');
    const actionBtnIcon = document.getElementById('actionBtnIcon');

    const playSvg = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z"/></svg>`;
    const pauseSvg = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    
    const miniPlaySvg = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z"/></svg>`;
    const miniPauseSvg = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    if (songWheel && document.getElementById('songScreen').classList.contains('active')) {
        const selectedSongObj = songWheel.getSelectedIndex();
        if (selectedSongObj) {
            const songName = typeof selectedSongObj === 'string' ? selectedSongObj : selectedSongObj.name;
            const targetKey = `${activeArtist}_${songName}`;
            actionBtnIcon.innerHTML = (currentPlayingKey === targetKey && isPlaying) ? pauseSvg : playSvg;
        }
    }

    if (currentPlayingKey && currentPlayingKey.includes('_')) {
        const parts = currentPlayingKey.split('_');
        const artistName = parts[0];
        const songName = parts.slice(1).join('_');
        const artistImg = database[artistName]?.image || '';

        miniImg.src = artistImg;
        miniSong.textContent = songName;
        miniArtist.textContent = artistName;

        bottomMiniPlayer.classList.add('visible');
        miniPlayIcon.innerHTML = isPlaying ? miniPauseSvg : miniPlaySvg;
    } else {
        bottomMiniPlayer.classList.remove('visible');
    }
}

function renderLoop() {
    if (document.getElementById('artistScreen').classList.contains('active')) {
        artistWheel.update();
        const selected = artistWheel.getSelectedIndex();
        if (selected?.image) {
            const avatarImg = document.getElementById('artistAvatar');
            if (avatarImg.src !== selected.image) avatarImg.src = selected.image;
            const headerTitle = document.getElementById('artistHeaderTitle');
            if (headerTitle.textContent !== selected.name) headerTitle.textContent = selected.name;
        }
    } else if (document.getElementById('songScreen').classList.contains('active') && songWheel) {
        songWheel.update();
    }
    updatePlayerUI();
    requestAnimationFrame(renderLoop);
}

function onArtistSelected() {
    const selectedObj = artistWheel.getSelectedIndex();
    activeArtist = selectedObj.name;
    currentSongs = database[activeArtist].songs || [];
    
    document.getElementById('selectedArtistTitle').textContent = activeArtist;
    document.getElementById('songArtistAvatar').src = selectedObj.image;

    if (!songWheel) {
        songWheel = new WheelPicker(
            document.getElementById('songWheelArea'),
            document.getElementById('songList'),
            () => currentSongs
        );
    } else {
        songWheel.initDOM();
        songWheel.offset = 0;
        songWheel.targetOffset = 0;
    }

    document.getElementById('artistScreen').classList.remove('active');
    document.getElementById('songScreen').classList.add('active');
}

function goToArtistScreen() {
    document.getElementById('songScreen').classList.remove('active');
    document.getElementById('artistScreen').classList.add('active');
}

function onSearchButtonClicked() {
    alert("Arama özelliği yakında eklenecek!");
}

function togglePlayPause() {
    if (!globalAudio) { onSongActionClicked(); return; }
    if (isPlaying) { 
        globalAudio.pause(); 
        isPlaying = false; 
    } else { 
        globalAudio.play().then(() => { isPlaying = true; }).catch(err => {
            globalAudio.load();
            globalAudio.play().then(() => { isPlaying = true; }).catch(e => console.log(e));
        }); 
    }
}

function setupMediaSession(songName, artistName, artworkUrl) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: songName,
            artist: artistName,
            album: "Hayat Müzik",
            artwork: [
                { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
                { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
                { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
                { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => { togglePlayPedal ? togglePlayPause() : togglePlayPause(); });
        navigator.mediaSession.setActionHandler('pause', () => { togglePlayPause(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { playSongAtIndex(currentSongIndex - 1); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { playNextSong(); });
    }
}

function playSongAtIndex(index) {
    if (!currentSongs || currentSongs.length === 0) return;
    currentSongIndex = (index + currentSongs.length) % currentSongs.length;
    const selectedSongObj = currentSongs[currentSongIndex];
    const songName = selectedSongObj.name;
    const songAudioUrl = selectedSongObj.audio;

    if (!songAudioUrl || songAudioUrl.trim() === '') {
        alert("Bu şarkı yakında eklenecek!");
        return;
    }

    const artistImg = database[activeArtist]?.image || '';
    currentPlayingKey = `${activeArtist}_${songName}`;

    if (songWheel) {
        songWheel.targetOffset = currentSongIndex;
    }

    if (globalAudio) { 
        globalAudio.pause(); 
        globalAudio.currentTime = 0;
    }

    if (audioCache[songAudioUrl]) {
        globalAudio = audioCache[songAudioUrl];
    } else {
        globalAudio = new Audio(songAudioUrl);
        audioCache[songAudioUrl] = globalAudio;
    }
    
    globalAudio.currentTime = 0;
    globalAudio.play().then(() => { 
        isPlaying = true;
        setupMediaSession(songName, activeArtist, artistImg);
    }).catch(() => { 
        isPlaying = false; 
        globalAudio.load();
        globalAudio.play().then(() => { 
            isPlaying = true; 
            setupMediaSession(songName, activeArtist, artistImg);
        }).catch(e => console.log(e));
    });
    
    globalAudio.onended = () => { playNextSong(); };
}

function playNextSong() {
    playSongAtIndex(currentSongIndex + 1);
}

function onSongActionClicked() {
    if (!songWheel) return;
    const selectedSongObj = songWheel.getSelectedIndex();
    if (!selectedSongObj) return;

    if (!selectedSongObj.audio || selectedSongObj.audio.trim() === '') {
        alert("Bu şarkı yakında eklenecek!");
        return;
    }

    const songName = selectedSongObj.name;
    const newPlayingKey = `${activeArtist}_${songName}`;

    if (currentPlayingKey === newPlayingKey && globalAudio) {
        togglePlayPause();
        return;
    }

    currentSongIndex = currentSongs.findIndex(s => s.name === songName);
    playSongAtIndex(currentSongIndex >= 0 ? currentSongIndex : 0);
}

requestAnimationFrame(renderLoop);
