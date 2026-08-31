import { Application, Graphics } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ background: "#000000", resizeTo: window });

  document.getElementById("pixi-container").appendChild(app.canvas);
  const paddle = new Graphics().rect(0, 0, 100, 100).fill(0xff0000);

  app.stage.addChild(paddle);

  paddle.position.set(
    app.screen.width / 2 - paddle.width / 2,
    app.screen.height - paddle.height,
  );

  const keys = {};

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  const radius = 10;
  const ball = new Graphics().circle(0, 0, radius).fill("white");

  app.stage.addChild(ball);

  ball.position.set(100, 100);

  let ballVX = 15;
  let ballVY = 15;

  app.ticker.add((time) => {
    if (keys["ArrowLeft"] && paddle.x > 0) {
      paddle.x = paddle.x - 7;
    } else if (
      keys["ArrowRight"] &&
      paddle.x < app.screen.width - paddle.width
    ) {
      paddle.x = paddle.x + 7;
    }

    ball.x += ballVX * time.deltaTime;
    ball.y += ballVY * time.deltaTime;

    if (ball.x - radius < 0 || ball.x + radius > app.screen.width) {
      ballVX = -ballVX;
    }

    if (ball.y - radius < 0) {
      ballVY = -ballVY;
    }
  });
})();
