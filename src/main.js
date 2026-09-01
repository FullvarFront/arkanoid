import { Application, Graphics } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ background: "#000000", resizeTo: window });

  document.getElementById("pixi-container").appendChild(app.canvas);
  const paddle = new Graphics().rect(0, 0, 200, 20).fill(0xff0000);

  app.stage.addChild(paddle);

  paddle.position.set(
    app.screen.width / 2 - paddle.width / 2,
    app.screen.height - paddle.height,
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
        col * (widthBrick + gap) + 50,
        row * (heightBrick + gap),
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

    return true;
  }

  app.ticker.add((time) => {
    if (launched) {
      ball.x += ball.vx * time.deltaTime;
      ball.y += ball.vy * time.deltaTime;

      if (ball.x - radius < 0 || ball.x + radius > app.screen.width) {
        ball.vx = -ball.vx;
      }

      if (ball.y - radius < 0) {
        ball.vy = -ball.vy;
      }

      resolveBallCollision(ball, radius, paddle, true);

      for (let i = 0; i < bricks.length; i++) {
        if (resolveBallCollision(ball, radius, bricks[i])) {
          app.stage.removeChild(bricks[i]);
          bricks.splice(i, 1);
          break;
        }
      }
    } else {
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - radius;
    }

    if (keys["ArrowLeft"] && paddle.x > 0) {
      paddle.x = paddle.x - 7;
    } else if (
      keys["ArrowRight"] &&
      paddle.x < app.screen.width - paddle.width
    ) {
      paddle.x = paddle.x + 7;
    }
  });
})();
