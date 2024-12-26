document.addEventListener('DOMContentLoaded', () => {
    const holes = document.querySelectorAll('.hole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('start-btn');
    const bgmToggle = document.getElementById('bgm-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');

    // 오디오 요소들
    const bgm = document.getElementById('bgm');
    const hitSoundNormal = document.getElementById('hit-sound-normal');
    const hitSoundVeryfast = document.getElementById('hit-sound-veryfast');
    const countdownSound = document.getElementById('countdown-sound');
    const gameOverSound = document.getElementById('game-over');

    let score = 0;
    let timeLeft = 30;
    let gameActive = false;
    let timer;
    let bgmEnabled = true;
    let sfxEnabled = true;
    let countdownStarted = false;
    let timeoutId = null;

    // 사운드 컨트롤
    function toggleBGM() {
        bgmEnabled = !bgmEnabled;
        bgmToggle.classList.toggle('muted');
        if (bgmEnabled) {
            bgm.play();
        } else {
            bgm.pause();
        }
    }

    function toggleSFX() {
        sfxEnabled = !sfxEnabled;
        sfxToggle.classList.toggle('muted');
    }

    function playSound(sound) {
        if (sfxEnabled && sound !== bgm) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    bgmToggle.addEventListener('click', toggleBGM);
    sfxToggle.addEventListener('click', toggleSFX);

    // 히트 이펙트 생성
    function createHitEffect(x, y, points) {
        const effect = document.createElement('div');
        effect.className = 'hit-effect';
        effect.textContent = `+${points}!`;
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }

    const showMole = () => {
        if (!gameActive) return;

        // 2~3마리의 두더지를 동시에 출현
        const numMoles = Math.random() < 0.5 ? 2 : 3;
        const availableHoles = Array.from({length: 9}, (_, i) => i);
        
        for (let i = 0; i < numMoles; i++) {
            if (availableHoles.length === 0) break;
            
            // 랜덤한 구멍 선택
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            const holeIndex = availableHoles[randomIndex];
            availableHoles.splice(randomIndex, 1);

            const hole = document.querySelector(`.hole[data-index="${holeIndex}"]`);
            const mole = hole.querySelector('.mole');
            
            // 이미 visible 상태인 두더지는 건너뛰기
            if (mole.classList.contains('visible')) {
                continue;
            }

            // 두더지 타입 결정
            const random = Math.random();
            let randomType;
            let points;
            let duration;
            
            if (random < 0.2) {
                randomType = 'veryfast';
                points = 125;
                duration = 1200;
            } else if (random < 0.5) {
                randomType = 'fast';
                points = 75;
                duration = 1000;
            } else {
                randomType = 'slow';
                points = 50;
                duration = 1500;
            }

            mole.classList.add(randomType);
            mole.classList.add('visible');

            const handleClick = (e) => {
                if (gameActive && !mole.classList.contains('caught')) {
                    score += points;
                    scoreDisplay.textContent = score;
                    
                    // 히트 이펙트 생성
                    createHitEffect(e.pageX, e.pageY, points);
                    
                    // 두더지 타입에 따른 효과음 재생
                    if (randomType === 'veryfast') {
                        playSound(hitSoundNormal);
                    } else {
                        playSound(hitSoundVeryfast);
                    }

                    // 맞았을 때 이미지 변경
                    mole.classList.add('caught');
                    
                    setTimeout(() => {
                        mole.classList.remove('visible');
                        mole.classList.remove('caught');
                        mole.classList.remove(randomType);
                    }, 500);
                }
            };

            mole.addEventListener('click', handleClick);
            mole.addEventListener('touchstart', handleClick);

            setTimeout(() => {
                if (gameActive && mole.classList.contains('visible')) {
                    mole.classList.remove('visible');
                    mole.classList.remove(randomType);
                }
            }, duration);
        }

        // 다음 두더지 출현 (1.5~2.5초 사이)
        timeoutId = setTimeout(showMole, Math.random() * 1000 + 1500);
    };

    function startGame() {
        if (!gameActive) {
            gameActive = true;
            score = 0;
            timeLeft = 30;
            countdownStarted = false;
            scoreDisplay.textContent = score;
            timeDisplay.textContent = timeLeft;
            startBtn.disabled = true;
            startBtn.textContent = '게임 진행 중...';

            // 배경음악 초기화 및 재생
            bgm.currentTime = 0;
            if (bgmEnabled) {
                bgm.play();
            }

            timer = setInterval(updateTimer, 1000);
            showMole();
        }
    }

    function updateTimer() {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        // 5초 카운트다운 시작
        if (timeLeft <= 5 && !countdownStarted) {
            countdownStarted = true;
            playSound(countdownSound);
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        gameActive = false;
        clearInterval(timer);
        clearTimeout(timeoutId);
        
        const moles = document.querySelectorAll('.mole');
        moles.forEach(mole => {
            if (mole.classList.contains('visible')) {
                mole.classList.remove('visible');
                mole.classList.remove('slow');
                mole.classList.remove('fast');
                mole.classList.remove('veryfast');
            }
        });

        bgm.pause();
        bgm.currentTime = 0;
        playSound(gameOverSound);
        
        setTimeout(() => {
            alert(`게임 종료!\n당신의 점수는 ${score}점입니다! 🎉`);
            startBtn.disabled = false;
            startBtn.textContent = '게임 시작!';
        }, 500);
    }

    startBtn.addEventListener('click', startGame);
    
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});
