document.addEventListener('DOMContentLoaded', () => {
    const holes = document.querySelectorAll('.hole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('start-btn');

    let score = 0;
    let timeLeft = 30;
    let gameActive = false;
    let timer;
    let moleTimer;

    function createMole() {
        // 모든 두더지 제거
        holes.forEach(hole => {
            const existingMole = hole.querySelector('.mole');
            if (existingMole) existingMole.remove();
        });

        // 랜덤한 구멍에 두더지 생성
        const randomHole = holes[Math.floor(Math.random() * holes.length)];
        const mole = document.createElement('div');
        
        // 난이도별 두더지 클래스 추가
        const moleTypes = ['slow', 'fast', 'veryfast'];
        const randomType = moleTypes[Math.floor(Math.random() * moleTypes.length)];
        
        mole.classList.add('mole', randomType);
        
        // 난이도별 점수와 속도 설정
        let points = 0;
        let speed = 1000; // 기본 속도

        switch(randomType) {
            case 'slow':
                points = 50;
                speed = 1500;
                break;
            case 'fast':
                points = 75;
                speed = 800;
                break;
            case 'veryfast':
                points = 125;
                speed = 500;
                break;
        }

        randomHole.appendChild(mole);

        // 두더지 클릭 이벤트
        mole.addEventListener('click', () => {
            if (gameActive) {
                score += points;
                scoreDisplay.textContent = score;
                mole.classList.add('caught');
                
                setTimeout(() => {
                    mole.remove();
                }, 300);
            }
        });

        // 두더지 사라지기
        setTimeout(() => {
            mole.remove();
        }, speed);
    }

    function startGame() {
        if (!gameActive) {
            gameActive = true;
            score = 0;
            timeLeft = 30;
            scoreDisplay.textContent = score;
            timeDisplay.textContent = timeLeft;

            // 타이머
            timer = setInterval(() => {
                timeLeft--;
                timeDisplay.textContent = timeLeft;

                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);

            // 두더지 생성
            moleTimer = setInterval(createMole, 1000);
        }
    }

    function endGame() {
        gameActive = false;
        clearInterval(timer);
        clearInterval(moleTimer);
        alert(`게임 종료! 당신의 점수는 ${score}점입니다.`);
    }

    startBtn.addEventListener('click', startGame);
});
