import { Application, Graphics } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ background: "#000000", resizeTo: window });

  document.getElementById("pixi-container").appendChild(app.canvas);

  const gameWidth = app.screen.width * 0.75;
  const gameHeight = app.screen.height;
  const hudX = gameWidth + 30;

  const border = new Graphics()
    .moveTo(0, gameHeight)
    .lineTo(0, 0)
    .lineTo(gameWidth, 0)
    .lineTo(gameWidth, gameHeight)
    .stroke({ width: 30, color: 0x888888, alignment: 1 });

  app.stage.addChild(border);

  const margin = 30;

  const paddle = new Graphics().rect(0, 0, 200, 20).fill(0xff0000);

  app.stage.addChild(paddle);

  paddle.position.set(
    gameWidth / 2 - paddle.width / 2,
    app.screen.height - paddle.height - margin,
  );

  const keys = {};

  let launched = false;

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " && !launched) {
      launched = true;

      const launchAngle = (30 * Math.PI) / 180;
      const speed = 15;

      ball.vx = speed * Math.sin(launchAngle);
      ball.vy = -speed * Math.cos(launchAngle);
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  const radius = 10;
  const ball = new Graphics().circle(0, 0, radius).fill("white");
  const balls = [ball];

  app.stage.addChild(ball);

  ball.position.set(100, 100);

  const colRef = 11;
  const rowRef = 5;
  const gap = 30;

  const bricks = [];

  const widthBrick = 100;
  const heightBrick = 50;

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

  const powerups = [];

  const baseWidth = 200;
  const widePaddleWidth = 260;

  function applyPowerup(type) {
    if (type === "widen") {
      paddle.clear().rect(0, 0, widePaddleWidth, 20).fill(0xff0000);
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

  app.ticker.add((time) => {
    if (launched) {
      for (const b of balls) {
        b.x += b.vx * time.deltaTime;
        b.y += b.vy * time.deltaTime;

        if (b.x - radius < margin || b.x + radius > gameWidth - margin) {
          b.vx = -b.vx;
        }
        if (b.y - radius < margin) {
          b.vy = -b.vy;
        }

        resolveBallCollision(b, radius, paddle, true);

        for (let i = 0; i < bricks.length; i++) {
          if (resolveBallCollision(b, radius, bricks[i])) {
            const brickX = bricks[i].x;
            const brickY = bricks[i].y;

            app.stage.removeChild(bricks[i]);
            bricks.splice(i, 1);

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
      }
    } else {
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - radius;
    }

    let dx = 0;
    if (keys["ArrowLeft"]) dx -= 7;
    if (keys["ArrowRight"]) dx += 7;

    paddle.x = Math.max(
      margin,
      Math.min(paddle.x + dx, gameWidth - paddle.width - margin),
    );

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
