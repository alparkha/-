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
    let moleTimer;
    let bgmEnabled = true;
    let sfxEnabled = true;
    let countdownStarted = false;

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

    function createMole() {
        holes.forEach(hole => {
            const existingMole = hole.querySelector('.mole');
            if (existingMole) existingMole.remove();
        });

        const randomHole = holes[Math.floor(Math.random() * holes.length)];
        const mole = document.createElement('div');
        
        const moleTypes = ['slow', 'fast', 'veryfast'];
        const randomType = moleTypes[Math.floor(Math.random() * moleTypes.length)];
        
        mole.classList.add('mole', randomType);
        randomHole.appendChild(mole);
        
        setTimeout(() => {
            mole.style.bottom = '0';
        }, 10);

        let points = 0;
        let speed = 1000;

        switch(randomType) {
            case 'slow':
                points = 50;
                speed = 1000;
                break;
            case 'fast':
                points = 75;
                speed = 600;
                break;
            case 'veryfast':
                points = 125;
                speed = 350;
                break;
        }

        const handleClick = (e) => {
            if (gameActive && !mole.classList.contains('caught')) {
                // 즉시 효과음 재생
                if (randomType === 'veryfast') {
                    playSound(hitSoundNormal); // catch_1.mp3
                } else {
                    playSound(hitSoundVeryfast); // catch.mp3
                }

                score += points;
                scoreDisplay.textContent = score;
                
                // 히트 이펙트 생성
                createHitEffect(e.pageX, e.pageY, points);
                
                // 맞았을 때 이미지 변경
                mole.style.backgroundImage = "url('images/mole4_caught.png')";
                mole.classList.add('caught');
                
                setTimeout(() => {
                    if (mole.parentNode) {
                        mole.style.bottom = '-100%';
                        setTimeout(() => {
                            if (mole.parentNode) {
                                mole.remove();
                            }
                        }, 200);
                    }
                }, 500);
            }
        };

        mole.addEventListener('click', handleClick);
        mole.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleClick(e.touches[0]);
        });

        setTimeout(() => {
            if (mole.parentNode) {
                mole.style.bottom = '-100%';
                setTimeout(() => {
                    if (mole.parentNode) {
                        mole.remove();
                    }
                }, 200);
            }
        }, speed);
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
            createMole();
            moleTimer = setInterval(createMole, 800);
        }
    }

    function endGame() {
        gameActive = false;
        clearInterval(timer);
        clearInterval(moleTimer);
        
        holes.forEach(hole => {
            const existingMole = hole.querySelector('.mole');
            if (existingMole) existingMole.remove();
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
