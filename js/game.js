document.addEventListener('DOMContentLoaded', () => {
    const holes = document.querySelectorAll('.hole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('start-btn');
    const bgmToggle = document.getElementById('bgm-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');

    // 오디오 요소들
    const bgm = document.getElementById('bgm');
    const countdownSound = document.getElementById('countdown-sound');
    const gameOverSound = document.getElementById('game-over');

    // 사운드 풀 생성
    const SOUND_POOL_SIZE = 5;
    let soundPool = null;  // 사운드 풀을 나중에 초기화

    let currentSoundIndex = {
        normal: 0,
        fast: 0,
        veryfast: 0
    };

    let timeoutId = null;
    let gameActive = false;
    let score = 0;
    let timeLeft = 30;
    let bgmPlaying = false;
    let sfxEnabled = true;
    let activeMoles = 0;
    let timerInterval = null;
    const MAX_ACTIVE_MOLES = 3;

    // 사운드 풀 초기화 함수
    function initSoundPool() {
        soundPool = {
            normal: Array.from({ length: SOUND_POOL_SIZE }, () => {
                const audio = new Audio('sounds/catch.mp3');
                audio.volume = 0.4;
                return audio;
            }),
            fast: Array.from({ length: SOUND_POOL_SIZE }, () => {
                const audio = new Audio('sounds/catch.mp3');
                audio.volume = 0.4;
                return audio;
            }),
            veryfast: Array.from({ length: SOUND_POOL_SIZE }, () => {
                const audio = new Audio('sounds/catch_1.mp3');
                audio.volume = 0.4;
                return audio;
            })
        };
    }

    // 사운드 컨트롤
    function toggleBGM() {
        bgmPlaying = !bgmPlaying;
        bgmToggle.classList.toggle('muted');
        if (bgmPlaying) {
            bgm.play().catch(() => {
                bgmPlaying = false;
                bgmToggle.classList.add('muted');
            });
        } else {
            bgm.pause();
        }
    }

    function toggleSFX() {
        sfxEnabled = !sfxEnabled;
        sfxToggle.classList.toggle('muted');
    }

    function playSound(sound) {
        if (!sfxEnabled || !soundPool) return;

        if (sound === 'normal' || sound === 'fast' || sound === 'veryfast') {
            const pool = soundPool[sound];
            const audio = pool[currentSoundIndex[sound]];
            
            if (audio.paused || audio.ended) {
                audio.currentTime = 0;
                audio.play().catch(error => {
                    console.log("Audio play failed:", error);
                });
            }

            currentSoundIndex[sound] = (currentSoundIndex[sound] + 1) % SOUND_POOL_SIZE;
        } else if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.log("Audio play failed:", error);
            });
        }
    }

    function updateTimer() {
        if (!gameActive || timeLeft <= 0) {
            clearInterval(timerInterval);
            if (timeLeft <= 0) {
                endGame();
            }
            return;
        }
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        // 5초 남았을 때 카운트다운 사운드
        if (timeLeft === 5 && sfxEnabled) {
            playSound(countdownSound);
        }
    }

    function startGame() {
        if (!gameActive) {
            // 게임 상태 초기화
            gameActive = true;
            score = 0;
            timeLeft = 30;
            activeMoles = 0;
            scoreDisplay.textContent = '0';
            timeDisplay.textContent = '30';
            
            // 사운드 풀 초기화
            initSoundPool();
            
            // 시작 버튼 비활성화
            startBtn.disabled = true;
            startBtn.classList.add('disabled');
            
            // 타이머 시작
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            
            // 두더지 출현 시작
            showMole();
        }
    }

    function endGame() {
        gameActive = false;
        clearTimeout(timeoutId);
        clearInterval(timerInterval);
        
        // 게임 종료 효과음 재생
        if (sfxEnabled && gameOverSound) {
            gameOverSound.volume = 0.4;
            gameOverSound.play().catch(error => {
                console.log("Game over sound failed:", error);
            });
        }

        // 모든 두더지 숨기기
        document.querySelectorAll('.mole').forEach(mole => {
            if (mole.classList.contains('visible')) {
                mole.classList.add('hiding');
                setTimeout(() => {
                    mole.classList.remove('visible', 'hiding', 'normal', 'fast', 'veryfast', 'caught');
                }, 150);
            }
        });

        // 최종 점수 표시
        const finalScore = score;
        setTimeout(() => {
            alert(`게임 종료! 최종 점수: ${finalScore}점`);
            startBtn.textContent = '다시 시작!';
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            
            // 게임 상태 완전 초기화
            timeLeft = 30;
            timeDisplay.textContent = '30';
            activeMoles = 0;
            
            // 사운드 풀 초기화
            initSoundPool();
        }, 500);
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
                randomType = 'normal';
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
                playSound(randomType);

                // 맞았을 때 이미지 변경
                mole.classList.add('caught');
                activeMoles--;
                
                // 이벤트 리스너 제거 (메모리 누수 방지)
                hitbox.removeEventListener('mousedown', handleClick);
                hitbox.removeEventListener('touchstart', handleClick);
                
                setTimeout(() => {
                    if (mole.classList.contains('caught')) {
                        mole.classList.remove('visible', 'caught', randomType);
                    }
                }, 500);
            };

            // 이벤트 리스너 추가
            hitbox.addEventListener('mousedown', handleClick);
            hitbox.addEventListener('touchstart', handleClick);

            // 두더지가 사라질 때
            setTimeout(() => {
                if (mole.classList.contains('visible') && !mole.classList.contains('caught')) {
                    mole.classList.add('hiding');
                    setTimeout(() => {
                        mole.classList.remove('visible', 'hiding', randomType);
                        activeMoles--;
                    }, 150);  // hiding 애니메이션 시간과 동일
                }
            }, duration);
        }

        // 다음 두더지 출현 (0.5~1초 사이)
        timeoutId = setTimeout(showMole, Math.random() * 500 + 500);
    };

    startBtn.addEventListener('click', startGame);
    
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
});
