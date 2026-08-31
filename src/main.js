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
  }) |
    window.addEventListener("keyup", (e) => {
      keys[e.key] = false;
    });

  app.ticker.add((time) => {
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
