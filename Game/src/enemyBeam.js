class EnemyBeam {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY, speed, direction) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('enemyBeamImage');
        this.x = spawnPosX;
        this.y = spawnPosY;
        this.width = 20;
        this.height = 20;

        this.speed = speed;
        this.direction = direction;

        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        switch (this.direction) {
            case 'Up':
                this.y -= this.speed;
                break;
            case 'Down':
                this.y += this.speed;
                break;
            case 'Left':
                this.x -= this.speed;
                break;
            case 'Right':
                this.x += this.speed;
                break;
            case 'Up Left':
                this.y -= this.speed;
                this.x -= this.speed;
                break;
            case 'Up Right':
                this.y -= this.speed;
                this.x += this.speed;
                break;
            case 'Down Left':
                this.y += this.speed;
                this.x -= this.speed;
                break;
            case 'Down Right':
                this.y += this.speed;
                this.x += this.speed;
                break;
        }

        //movement
        this.y += this.speed;

        // apply horizontal and vertical boundary
        if (this.x < 0 ||
            this.x > this.gameWidth - this.width ||
            this.y > this.gameHeight - this.height ||
            this.y < 0) {
            this.markedForDeletion = true;
        }
    }
}