class Beam {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY, beamInfo) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('beamImage');
        this.x = spawnPosX;
        this.y = spawnPosY;

        this.beamInfo = beamInfo;
        this.width = this.beamInfo[playerBeamLevel].width;
        this.height = this.beamInfo[playerBeamLevel].height;
        this.image.src = this.beamInfo[playerBeamLevel].path;

        this.speed = 15;

        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;

        if (this.y < 0 - this.height) {
            this.markedForDeletion = true;
        }
    }

    hit() {
        effects.push(new Effect(this.x, this.y, 70, 28, 5, 'beamHitImage'));
        this.markedForDeletion = true;
    }
}