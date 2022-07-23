class UI {
    constructor() {}

    displayScore(ctx, score) {
        ctx.textAlign = "left";
        ctx.font = "40px Halvetica";
        // custom shadow effect
        ctx.fillStyle = "black";
        ctx.fillText("Score: " + score, 20, 50);
        ctx.fillStyle = "white";
        ctx.fillText("Score: " + score, 22, 52);
    }

    displayPause(ctx) {
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 0.75;
        ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.font = '36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    }

    displayGameOver(ctx) {
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("Game Over, Press Enter To Restart!", canvas.width/2, 200);
        ctx.fillStyle = "red";
        ctx.fillText("Game Over, Press Enter To Restart!", canvas.width/2 + 2, 202);
    }
}