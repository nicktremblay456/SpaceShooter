class Asteroid {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('asteroidImage');
        this.x = spawnPosX;
        this.y = spawnPosY;
        this.width = Math.floor(Math.random() * 103) + 43;
        this.height = this.width - 3;

        this.speed = Math.floor(Math.random() * 10) + 5;

        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        // collider visual
        //context.strokeStyle = 'green';
        //context.beginPath();
        //context.arc(this.x + this.width/2, this.y + this.height/2, this.width/3, 0, Math.PI * 2);
        //context.stroke();
    }

    update() {
        // collisions
        projectiles.forEach(projectile => {
            const dx = (projectile.x + projectile.width/2) - (this.x + this.width/2);
            const dy = (projectile.y + projectile.height/2) - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < projectile.width/3 + this.width/3) {
                projectile.markedForDeletion = true;
                effects.push(new Effect(this.x, this.y, 656, 72, 8, 'asteroidExplosionImage'));
                score += 10;
                if (playerBeamLevel == 0 && !powerUpDropped && score >= 500) {
                    dropPowerUp(this.x, this.y, 50, powerUpType.Beam);
                }
                this.markedForDeletion = true;
            }
        });
        // movement
        this.y += this.speed;

        // destroy the asteroid when out of bound
        if (this.y > this.gameHeight - this.height) {
            this.markedForDeletion = true;
        }
    }
}