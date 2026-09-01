import { Application, Graphics, Text } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ background: "#000000", resizeTo: window });

  document.getElementById("pixi-container").appendChild(app.canvas);

  // const
  const colRef = 11;
  const rowRef = 5;
  const gap = 30;
  const bricks = [];
  const widthBrick = 100;
  const heightBrick = 50;
  const gameWidth = app.screen.width * 0.75;
  const gameHeight = app.screen.height;
  const hudX = gameWidth + 30;
  const margin = 30;
  const baseWidth = 150;
  const widePaddleWidth = 210;
  const keys = {};
  const powerups = [];
  const livesIcons = [];
  const radius = 10;

  // let

  let launched = false;
  let gameOver = false;
  let score = 0;
  let highScore = Number(localStorage.getItem("highScore")) || 0;
  let lives = 3;

  // Добавление игровой обёртки

  const border = new Graphics()
    .moveTo(0, gameHeight)
    .lineTo(0, 0)
    .lineTo(gameWidth, 0)
    .lineTo(gameWidth, gameHeight)
    .stroke({ width: 30, color: 0x888888, alignment: 1 });

  app.stage.addChild(border);

  // Функция для создания платформы

  function drawPaddle(g, width) {
    const capWidth = width * 0.2;
    g.clear()
      .rect(0, 0, width, 20)
      .fill(0xcccccc)
      .rect(0, 0, capWidth, 20)
      .fill(0xff3300)
      .rect(width - capWidth, 0, capWidth, 20)
      .fill(0xff3300);
  }

  // Функция для создания мини платформы в HUD

  function drawMiniPaddle(g, width, height) {
    const capWidth = width * 0.2;
    g.clear()
      .rect(0, 0, width, height)
      .fill(0xcccccc)
      .rect(0, 0, capWidth, height)
      .fill(0xff3300)
      .rect(width - capWidth, 0, capWidth, height)
      .fill(0xff3300);
  }

  // Создание главной платформы и позиционирование

  const paddle = new Graphics();
  drawPaddle(paddle, baseWidth);

  app.stage.addChild(paddle);

  paddle.position.set(
    gameWidth / 2 - paddle.width / 2,
    app.screen.height - paddle.height - margin,
  );

  // Подпись ивенты

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " && !launched) {
      launched = true;

      const launchAngle = (30 * Math.PI) / 180;
      const speed = 15;

      balls[0].vx = speed * Math.sin(launchAngle);
      balls[0].vy = -speed * Math.cos(launchAngle);
    }

    if (gameOver && e.key === " ") {
      window.location.reload();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  // Создание и позиционирование мяча

  const ball = new Graphics().circle(0, 0, radius).fill("white");
  const balls = [ball];
  app.stage.addChild(ball);

  // Создание сетки кирпичей

  for (let row = 0; row < rowRef; row++) {
    for (let col = 0; col < colRef; col++) {
      const brick = new Graphics()
        .rect(0, 0, widthBrick, heightBrick)
        .fill("yellow");

      brick.position.set(
        col * (widthBrick + gap) + margin,
        row * (heightBrick + gap) + margin,
      );
      app.stage.addChild(brick);
      bricks.push(brick);
    }
  }

  // Функция выполняет следующие действия:
  // Проверяет столкновения
  // Высчитывает угол отскока если это столкновение с платформой
  // Определяет с какой стороны прилетел мяч если это столкновение с кирпичом
  // При попадании мяча в платформу или кирпич увеличивает скорость мяча

  function resolveBallCollision(ball, radius, obj, isPaddle = false) {
    const isColliding =
      ball.x - radius < obj.x + obj.width &&
      ball.x + radius > obj.x &&
      ball.y - radius < obj.y + obj.height &&
      ball.y + radius > obj.y;

    if (!isColliding) return false;

    if (isPaddle) {
      const paddleCenter = obj.x + obj.width / 2;
      const offset = ball.x - paddleCenter;
      const normalized = offset / (obj.width / 2);

      const maxAngle = (60 * Math.PI) / 180;
      const angle = normalized * maxAngle;

      const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);

      ball.vx = speed * Math.sin(angle);
      ball.vy = -speed * Math.cos(angle);
    } else {
      const overlapX =
        Math.min(ball.x + radius, obj.x + obj.width) -
        Math.max(ball.x - radius, obj.x);
      const overlapY =
        Math.min(ball.y + radius, obj.y + obj.height) -
        Math.max(ball.y - radius, obj.y);

      if (overlapX < overlapY) {
        ball.vx = -ball.vx;
      } else {
        ball.vy = -ball.vy;
      }
    }

    const speedMultiplier = 1.015;
    const maxSpeed = 20;

    const currentSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    if (currentSpeed < maxSpeed) {
      ball.vx *= speedMultiplier;
      ball.vy *= speedMultiplier;
    }

    return true;
  }

  // Функция для применения пойманного бафа

  function applyPowerup(type) {
    if (type === "widen") {
      drawPaddle(paddle, widePaddleWidth);
    } else if (type === "multiball") {
      const source = balls[0];
      const speed = Math.sqrt(source.vx ** 2 + source.vy ** 2);

      for (const angleOffset of [-20, 20]) {
        const rad = (angleOffset * Math.PI) / 180;
        const newBall = new Graphics().circle(0, 0, radius).fill("white");
        newBall.position.set(source.x, source.y);
        newBall.vx = speed * Math.sin(rad) + source.vx;
        newBall.vy = source.vy;
        app.stage.addChild(newBall);
        balls.push(newBall);
      }
    }
  }

  // HUD

  // Отрисовка имеющихся жизней

  for (let i = 0; i < lives; i++) {
    const icon = new Graphics();
    drawMiniPaddle(icon, 100, 10);
    icon.position.set(hudX + i * 150, 600);
    app.stage.addChild(icon);
    livesIcons.push(icon);
  }

  // Текст High Score и Score, так же счёт для каждого

  const highScoreLabel = new Text({
    text: "HIGH SCORE",
    style: { fontFamily: "'Press Start 2P'", fontSize: 60, fill: 0xff5555 },
  });
  highScoreLabel.position.set(hudX, 30);
  app.stage.addChild(highScoreLabel);

  const highScoreValue = new Text({
    text: highScore.toString(),
    style: { fontFamily: "'Press Start 2P'", fontSize: 40, fill: 0xffffff },
  });
  highScoreValue.position.set(hudX, 120);
  app.stage.addChild(highScoreValue);

  const scoreLabel = new Text({
    text: "SCORE",
    style: { fontFamily: "'Press Start 2P'", fontSize: 60, fill: 0xff5555 },
  });
  scoreLabel.position.set(hudX, 200);
  app.stage.addChild(scoreLabel);

  const scoreValue = new Text({
    text: score.toString(),
    style: { fontFamily: "'Press Start 2P'", fontSize: 40, fill: 0xffffff },
  });
  scoreValue.position.set(hudX, 290);
  app.stage.addChild(scoreValue);

  // Текст который выводится при Победе/поражении

  const endText = new Text({
    text: "",
    style: { fontFamily: "'Press Start 2P'", fontSize: 60, fill: 0xffffff },
  });
  endText.anchor.set(0.5);
  endText.position.set(gameWidth / 2, gameHeight / 2 - 30);
  endText.visible = false;
  app.stage.addChild(endText);

  const restartText = new Text({
    text: "PRESS SPACE TO RESTART",
    style: { fontFamily: "'Press Start 2P'", fontSize: 40, fill: 0xaaaaaa },
  });
  restartText.anchor.set(0.5);
  restartText.position.set(gameWidth / 2, gameHeight / 2 + 50);
  restartText.visible = false;
  app.stage.addChild(restartText);

  app.ticker.add((time) => {
    if (launched) {
      // Обрабатываем каждый мяч: движение, отскоки, столкновения

      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.x += b.vx * time.deltaTime;
        b.y += b.vy * time.deltaTime;

        if (b.x - radius < margin || b.x + radius > gameWidth - margin) {
          b.vx = -b.vx;
        }
        if (b.y - radius < margin) {
          b.vy = -b.vy;
        }

        resolveBallCollision(b, radius, paddle, true);

        // Проверяем столкновения мяча с кирпичами, разрушаем их при попадании

        for (let j = 0; j < bricks.length; j++) {
          if (resolveBallCollision(b, radius, bricks[j])) {
            const brickX = bricks[j].x;
            const brickY = bricks[j].y;

            app.stage.removeChild(bricks[j]);
            bricks.splice(j, 1);
            score += 100;
            scoreValue.text = score.toString();
            if (score > highScore) {
              highScore = score;
              localStorage.setItem("highScore", highScore.toString());
              highScoreValue.text = highScore.toString();
            }

            // Выпадение баффов с кирпичей

            if (Math.random() < 0.35) {
              const type = Math.random() < 0.5 ? "widen" : "multiball";
              const color = type === "widen" ? "cyan" : "orange";

              const powerup = new Graphics().rect(0, 0, 30, 15).fill(color);
              powerup.position.set(brickX + widthBrick / 2 - 15, brickY);
              powerup.type = type;
              powerup.vy = 3;

              app.stage.addChild(powerup);
              powerups.push(powerup);
            }

            break;
          }
        }

        // Проверка потери мяча за нижним краем поля

        if (b.y - radius > gameHeight) {
          app.stage.removeChild(b);
          balls.splice(i, 1);

          if (balls.length > 0) {
            continue;
          }

          // Потеря жизни, GameOver если жизни кончились, если нет игра продолжается.

          lives--;
          const icon = livesIcons.pop();
          if (icon) app.stage.removeChild(icon);

          if (lives <= 0) {
            gameOver = true;
            endText.text = "GAME OVER";
            endText.visible = true;
            restartText.visible = true;
            app.ticker.stop();
          } else {
            const newBall = new Graphics().circle(0, 0, radius).fill("white");
            app.stage.addChild(newBall);
            balls.push(newBall);
            launched = false;
          }
        }
      }

      // Победа, если все кирпичи разрушены и GameOver = false, если нет то приклеиваем мяч к платформе

      if (bricks.length === 0 && !gameOver) {
        gameOver = true;
        endText.text = "YOU WIN";
        endText.visible = true;
        restartText.visible = true;
        app.ticker.stop();
      }
    } else {
      balls[0].x = paddle.x + paddle.width / 2;
      balls[0].y = paddle.y - radius;
    }

    // Управлени платформой

    let dx = 0;
    if (keys["ArrowLeft"]) dx -= 7;
    if (keys["ArrowRight"]) dx += 7;

    paddle.x = Math.max(
      margin,
      Math.min(paddle.x + dx, gameWidth - paddle.width - margin),
    );

    // Движение баффов и проверка поймала ли их платформа

    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy * time.deltaTime;

      const caught =
        p.x < paddle.x + paddle.width &&
        p.x + p.width > paddle.x &&
        p.y < paddle.y + paddle.height &&
        p.y + p.height > paddle.y;

      if (caught) {
        applyPowerup(p.type);
        app.stage.removeChild(p);
        powerups.splice(i, 1);
      } else if (p.y > app.screen.height) {
        app.stage.removeChild(p);
        powerups.splice(i, 1);
      }
    }
  });
})();
