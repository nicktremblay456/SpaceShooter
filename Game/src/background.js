class Background {
    constructor(gameWidth, gameHeight, imageId) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById(imageId);
        this.x = 0;
        this.y = 0;
        this.width = 1024;
        this.height = 1024;
        this.speed = 2; // parallax speed
    }

    restart() {
        this.y = 0;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.x, this.y - this.height + this.speed, this.width, this.height);
    }

    update() {
        // vertical parallax
        this.y += this.speed;
        if (this.y > this.height) {
            this.y = 0;
        }
    }
}