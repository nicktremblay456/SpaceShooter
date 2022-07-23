class Drone {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('droneImage');
        this.x = spawnPosX;
        this.y = spawnPosY;
        this.width = 32;
        this.height = 39;

        this.health = 3;

        this.speed = 5;
        this.direction = 'Right';

        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        // collision
        projectiles.forEach(projectile => {
            const dx = (projectile.x + projectile.width/2) - (this.x + this.width/2);
            const dy = (projectile.y + projectile.height/2) - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < projectile.width/3 + this.width/3) {
                this.health--;
                if (this.health <= 0) {
                    projectile.markedForDeletion = true;
                    effects.push(new Effect(this.x, this.y, 84, 28, 7, 'droneExplosionImage'));
                    enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, this.x, this.y + 75, 5, 'Down'));
                    score += 10;
                    if (playerBeamLevel == 2 && !powerUpDropped) {
                        dropPowerUp(this.x, this.y, 10, powerUpType.Beam);
                    }
                    this.markedForDeletion = true;
                } else {
                    projectile.hit();
                }
            }
        });

        // movement
        if (this.direction == 'Right') {
            this.x += this.speed;
        } else if (this.direction == 'Left') {
            this.x -= this.speed;
        }
        
        if (this.x >= this.gameWidth - this.width && this.direction != 'Left') {
            this.direction = 'Left';
            this.y += this.height * 2;
        }
        else if (this.x <= 0 && this.direction != 'Right') {
            this.direction = 'Right';
            this.y += this.height * 2;
        }

        // destroy the turtle when out of bound
        if (this.y > this.gameHeight - this.height) {
            this.markedForDeletion = true;
        }
    }
}