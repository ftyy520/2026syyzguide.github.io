/* ============================================
   音乐播放器模块
   ============================================ */

const MusicPlayer = (() => {
    const audio = document.getElementById('bg-music');
    const playerPanel = document.getElementById('music-player');
    const toggleBtn = document.getElementById('music-toggle-btn');
    const playBtn = document.getElementById('music-play');
    const prevBtn = document.getElementById('music-prev');
    const nextBtn = document.getElementById('music-next');
    const volumeSlider = document.getElementById('music-volume');
    const selector = document.getElementById('music-selector');
    const titleDisplay = document.getElementById('music-title');
    const closeBtn = document.getElementById('music-player-close');

    let isPlaying = false;
    let currentIndex = 0;

    // 音乐列表
    const playlist = [
        { src: 'music/track1.mp3', title: '轻音乐 - 清晨阳光' },
        { src: 'music/track2.mp3', title: '钢琴曲 - 校园时光' },
        { src: 'music/track3.mp3', title: '自然声 - 鸟语花香' },
    ];

    function init() {
        // 音量初始化
        audio.volume = 0.5;

        // 切换播放器面板显示
        toggleBtn.addEventListener('click', () => {
            playerPanel.classList.toggle('active');
        });

        // 关闭播放器面板
        closeBtn.addEventListener('click', () => {
            playerPanel.classList.remove('active');
        });

        // 播放/暂停
        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                pause();
            } else {
                play();
            }
        });

        // 上一曲
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
            loadTrack(currentIndex);
            play();
        });

        // 下一曲
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % playlist.length;
            loadTrack(currentIndex);
            play();
        });

        // 音量调节
        volumeSlider.addEventListener('input', () => {
            audio.volume = volumeSlider.value / 100;
        });

        // 选择曲目
        selector.addEventListener('change', () => {
            const idx = selector.selectedIndex;
            currentIndex = idx;
            loadTrack(idx);
            play();
        });

        // 播放结束自动下一曲
        audio.addEventListener('ended', () => {
            currentIndex = (currentIndex + 1) % playlist.length;
            loadTrack(currentIndex);
            play();
        });

        // 加载第一首（不自动播放）
        loadTrack(0);
    }

    function loadTrack(index) {
        const track = playlist[index];
        if (!track) return;
        audio.src = track.src;
        titleDisplay.textContent = track.title;
        selector.selectedIndex = index;
    }

    function play(src) {
        if (src) {
            // 从指定源播放
            const idx = playlist.findIndex(t => t.src === src);
            if (idx !== -1) {
                currentIndex = idx;
                loadTrack(idx);
            } else {
                audio.src = src;
                titleDisplay.textContent = '播放中...';
            }
        }

        audio.play().then(() => {
            isPlaying = true;
            playBtn.textContent = '⏸';
            toggleBtn.classList.add('playing');
            playerPanel.classList.add('playing');
        }).catch(err => {
            console.log('音乐播放需要用户交互:', err);
            showToast('点击播放按钮开始播放音乐', 'info');
        });
    }

    function pause() {
        audio.pause();
        isPlaying = false;
        playBtn.textContent = '▶';
        toggleBtn.classList.remove('playing');
        playerPanel.classList.remove('playing');
    }

    function toggle() {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }

    // DOM加载后初始化
    document.addEventListener('DOMContentLoaded', init);

    // 公开API
    return { play, pause, toggle, init };
})();

// 挂载到全局
window.MusicPlayer = MusicPlayer;