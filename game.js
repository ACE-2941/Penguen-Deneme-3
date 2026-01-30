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
buzImg.src = "assets/buz.png"; // Yeni sarkıt PNG dosyan

const penguin = {
    x: 130, 
    y: 500,
    w: 200, // Penguen boyutu büyük
    h: 100,
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

// KONTROLLER
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

    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    // Zorluk Ayarı
    let oyunHizi = (puan < 100) ? 3 : 3 + (puan - 100) * 0.05;
    let uretimSikligi = (puan < 100) ? 80 : 55;

    if (++timer > uretimSikligi) {
        // Sarkıtlar daha uzun ve ince (Genişlik: 50, Boy: 80)
        obstacles.push({ x: Math.random() * (canvas.width - 50), y: -100, w: 50, h: 80 });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += oyunHizi;
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
        }
        // Hitbox (Sarkıtın ucuna göre çarpışma alanı)
        if (penguin.x + 30 < o.x + o.w && penguin.x + 70 > o.x && 
            penguin.y + 20 < o.y + o.h && penguin.y + 85 > o.y) {
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

    // 1. Arka Plan
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Penguen
    if (penguinImg.complete && penguinImg.naturalWidth > 0) {
        ctx.drawImage(penguinImg, penguin.frameX * 64, penguin.frameY * 40, 64, 40, penguin.x, penguin.y, penguin.w, penguin.h);
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(penguin.x, penguin.y, penguin.w, penguin.h);
    }

    // 3. Yeni Sarkıt Buzlar
    obstacles.forEach(o => {
        if (buzImg.complete && buzImg.naturalWidth > 0) {
            ctx.drawImage(buzImg, o.x, o.y, o.w, o.h);
        } else {
            ctx.fillStyle = "white"; 
            ctx.fillRect(o.x, o.y, o.w, o.h);
        }
    });

    // 4. Puan Tablosu
    ctx.fillStyle = "white";
    ctx.font = "bold 26px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText("PUAN: " + puan, 20, 45);
    ctx.shadowBlur = 0;

    // 5. Bitiş Ekranı
    if (!gameActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "yellow";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Penguen Finito", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Puan: " + puan, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText("EKRANA BASIVER", canvas.width / 2, canvas.height / 2 + 90);
        ctx.textAlign = "left";
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Fare/Tıkla yeniden başlatma
canvas.addEventListener("mousedown", () => {
    if (!gameActive) resetGame();
});

gameLoop();
