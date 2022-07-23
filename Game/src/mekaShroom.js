class MekaShroom {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('mekaShroomImage');
        this.x = spawnPosX;
        this.y = spawnPosY;
        this.width = 90;
        this.height = 74;

        this.speed = 5;

        this.fireRate = 1000;
        this.resetFireRate = this.fireRate;

        this.health = 2;

        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update(deltaTime) {
        // collision
        projectiles.forEach(projectile => {
            const dx = (projectile.x + projectile.width/2) - (this.x + this.width/2);
            const dy = (projectile.y + projectile.height/2) - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < projectile.width/3 + this.width/3) {
                this.health--;
                if (this.health <= 0) {
                    projectile.markedForDeletion = true;
                    effects.push(new Effect(this.x + this.width/2, this.y + this.height/2, 180, 30, 6, 'mekaExplosionImage'));
                    score += 20;
                    // drop power up condition
                    if (playerBeamLevel == 1 && !powerUpDropped) {
                        dropPowerUp(this.x, this.y, 50, powerUpType.Beam);
                    } else if (score >= 7000 && playerBeamLevel <= 3 && !powerUpDropped) {
                        dropPowerUp(this.x, this.y, 25, powerUpType.Beam);
                    }
                    this.markedForDeletion = true;
                } else {
                    projectile.hit();
                }
            }
        });

        if (this.fireRate <= 0) {
            this.fireRate = this.resetFireRate;
            // spawn 2 projectiles
            let offset = 6;
            for (let i = 0; i < 2; i++) {
                enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, this.x + offset, this.y + 75, 5, 'Down'));
                offset += 65;
            }
        }
        else {
            this.fireRate -= deltaTime;
        }

        // movement
        this.y += this.speed;

        // destroy the meka when out of bound
        if (this.y > this.gameHeight - this.height) {
            this.markedForDeletion = true;
        }
    }
}