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

    let timeoutId = null;
    let gameActive = false;
    let score = 0;
    let timeLeft = 30;
    let bgmPlaying = false;
    let activeMoles = 0;
    const MAX_ACTIVE_MOLES = 3;

    // 사운드 컨트롤
    function toggleBGM() {
        bgmPlaying = !bgmPlaying;
        bgmToggle.classList.toggle('muted');
        if (bgmPlaying) {
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

        // 현재 활성화된 두더지가 너무 많으면 대기
        if (activeMoles >= MAX_ACTIVE_MOLES) {
            timeoutId = setTimeout(showMole, 500);
            return;
        }

        // 1~2마리의 두더지를 출현
        const numMoles = Math.random() < 0.7 ? 1 : 2;
        const availableHoles = [];
        
        // 사용 가능한 구멍 찾기
        document.querySelectorAll('.hole').forEach((hole, index) => {
            const mole = hole.querySelector('.mole');
            if (!mole.classList.contains('visible')) {
                availableHoles.push(index);
            }
        });

        // 사용 가능한 구멍이 없으면 대기
        if (availableHoles.length === 0) {
            timeoutId = setTimeout(showMole, 500);
            return;
        }

        // 실제로 출현시킬 두더지 수 조정
        const actualNumMoles = Math.min(numMoles, availableHoles.length, MAX_ACTIVE_MOLES - activeMoles);
        
        for (let i = 0; i < actualNumMoles; i++) {
            const randomIndex = Math.floor(Math.random() * availableHoles.length);
            const holeIndex = availableHoles[randomIndex];
            availableHoles.splice(randomIndex, 1);

            const hole = document.querySelector(`.hole[data-index="${holeIndex}"]`);
            const mole = hole.querySelector('.mole');
            const hitbox = hole.querySelector('.mole-hitbox');
            
            // 두더지 타입 결정
            const random = Math.random();
            let randomType;
            let points;
            let duration;
            
            if (random < 0.2) {
                randomType = 'veryfast';
                points = 125;
                duration = 500;  // 0.5초
            } else if (random < 0.5) {
                randomType = 'fast';
                points = 75;
                duration = 700;  // 0.7초
            } else {
                randomType = 'slow';
                points = 50;
                duration = 1000; // 1초
            }

            activeMoles++;
            mole.classList.remove('slow', 'fast', 'veryfast', 'caught');
            mole.classList.add(randomType);
            mole.classList.add('visible');

            const handleClick = (e) => {
                if (!gameActive || !mole.classList.contains('visible') || mole.classList.contains('caught')) {
                    return;
                }

                e.preventDefault();
                score += points;
                scoreDisplay.textContent = score;
                
                // 히트 이펙트 생성
                const rect = hitbox.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                createHitEffect(centerX, centerY, points);
                
                // 두더지 타입에 따른 효과음 재생
                if (randomType === 'veryfast') {
                    playSound(hitSoundNormal);
                } else {
                    playSound(hitSoundVeryfast);
                }

                // 맞았을 때 이미지 변경
                mole.classList.add('caught');
                activeMoles--;
                
                setTimeout(() => {
                    if (mole.classList.contains('caught')) {
                        mole.classList.remove('visible', 'caught', randomType);
                    }
                }, 500);

                // 이벤트 리스너 제거
                hitbox.removeEventListener('mousedown', handleClick);
                hitbox.removeEventListener('touchstart', handleClick);
            };

            // 이벤트 리스너 추가
            hitbox.addEventListener('mousedown', handleClick);
            hitbox.addEventListener('touchstart', handleClick);

            // 두더지가 사라질 때
            setTimeout(() => {
                if (mole.classList.contains('visible') && !mole.classList.contains('caught')) {
                    mole.classList.remove('visible', randomType);
                    activeMoles--;
                }
            }, duration);
        }

        // 다음 두더지 출현 (0.5~1초 사이)
        timeoutId = setTimeout(showMole, Math.random() * 500 + 500);
    };

    function startGame() {
        if (!gameActive) {
            gameActive = true;
            score = 0;
            timeLeft = 30;
            scoreDisplay.textContent = score;
            timeDisplay.textContent = timeLeft;
            startBtn.disabled = true;
            startBtn.textContent = '게임 진행 중...';

            // 배경음악 초기화 및 재생
            bgm.currentTime = 0;
            if (bgmPlaying) {
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
        if (timeLeft <= 5) {
            playSound(countdownSound);
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        gameActive = false;
        clearTimeout(timeoutId);
        clearInterval(timer);
        
        // 모든 두더지 제거
        document.querySelectorAll('.mole').forEach(mole => {
            mole.classList.remove('visible', 'caught', 'slow', 'fast', 'veryfast');
        });
        
        activeMoles = 0;
        bgm.pause();
        bgm.currentTime = 0;
        bgmPlaying = false;
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
