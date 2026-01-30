const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
let gameOverTimer = 0;

// ASSETLER
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const bgImg = new Image();
bgImg.src = "assets/arka-plan.jpg"; 

const buzImg = new Image();
buzImg.src = "assets/buz.png"; 

const penguin = {
    x: 130, 
    y: 500,
    w: 100, 
    h: 100,
    hitW: 40, 
    hitH: 60,
    frameX: 0,
    frameY: 0,
    maxFrames: 5,
    fps: 0,
    stagger: 8,
    velocityY: 0,
    gravity: 0.8,
    isJumping: false
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
    if (!gameActive && gameOverTimer > 30) resetGame();
};
window.onkeyup = () => moveDir = 0;

function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2;
        penguin.maxFrames = 2;
    }
}

function resetGame() {
    puan = 0;
    obstacles = [];
    gameActive = true;
    gameOverTimer = 0;
    penguin.x = 130;
    penguin.y = 500;
    penguin.velocityY = 0;
    timer = 0;
}

function update() {
    if (!gameActive) {
        gameOverTimer++;
        return;
    }

    penguin.x += moveDir * 9;
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    // Yer Kontrolü
    if (penguin.y > 500) {
        penguin.y = 500;
        penguin.isJumping = false;
        penguin.velocityY = 0;
        penguin.frameY = 0;
        penguin.maxFrames = 5;
    }

    // KENAR KONTROLÜ (Tam yanaşması için sınırları esnettim)
    if (penguin.x < -55) penguin.x = -55;
    if (penguin.x > canvas.width - penguin.w + 55) penguin.x = canvas.width - penguin.w + 55;

    // DEĞİŞKEN TANIMLAMALARI (Sadece birer kez yapıldı)
    let oyunHizi = (puan < 100) ? 3 : 3 + (puan - 100) * 0.05;
    let uretimSikligi = (puan < 100) ? 80 : 55;

    if (++timer > uretimSikligi) {
        obstacles.push({ x: Math.random() * (canvas.width - 50), y: -100, w: 50, h: 80, hitW: 30, hitH: 60 });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += oyunHizi;
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
        }
        
        let pCenterX = penguin.x + penguin.w / 2;
        let pCenterY = penguin.y + penguin.h / 2;
        let bCenterX = o.x + o.w / 2;
        let bCenterY = o.y + o.h / 2;

        if (Math.abs(pCenterX - bCenterX) < (penguin.hitW + o.hitW) / 2 &&
            Math.abs(pCenterY - bCenterY) < (penguin.hitH + o.hitH) / 2) {
            gameActive = false;
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (penguinImg.complete) {
        ctx.drawImage(penguinImg, penguin.frameX * 64, penguin.frameY * 40, 64, 40, penguin.x, penguin.y, penguin.w, penguin.h);
    }

    obstacles.forEach(o => {
        if (buzImg.complete) {
            ctx.save();
            ctx.shadowBlur = 4;
            ctx.shadowColor = "black";
            ctx.drawImage(buzImg, o.x, o.y, o.w, o.h);
            ctx.restore();
        }
    });

    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.shadowBlur = 4;
    ctx.shadowColor = "black";
    ctx.fillText("PUAN: " + puan, 20, 45);

    if (!gameActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "yellow";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Penguen Finito", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Yeniden başlamak için tıkla", canvas.width / 2, canvas.height / 2 + 50);
        ctx.textAlign = "left";
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousedown", () => { if (!gameActive) resetGame(); });
gameLoop();
