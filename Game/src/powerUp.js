function dropPowerUp(spawnPosX, spawnPosY, dropRate, type) {
    let rand = Math.floor(Math.random() * 101);
    if (rand <= dropRate) { //50%
        powerUps.push(new PowerUp(canvas.width, canvas.height, spawnPosX, spawnPosY, type));
        powerUpDropped = true;
    }
}

class PowerUp {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY, type) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.type = type;

        this.image = document.getElementById('powerUpImage');
        this.x = spawnPosX;
        this.y = spawnPosY;
        this.width = 34;
        this.height = 29;

        this.speed = 5;

        this.markedForDeletion = false;

        // set the sprite depending on the power up type
        this.image.src = type;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        // movement
        this.y += this.speed;

        // destroy the power up when out of bound
        if (this.y > this.gameHeight - this.height) {
            powerUpDropped = false;
            this.markedForDeletion = true;
        }
    }
}