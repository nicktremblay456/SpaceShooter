class TurtleShip {
    constructor(gameWidth, gameHeight, spawnPosX, spawnPosY) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('turtleShipImage');
        this.x = spawnPosX;
        this.y = spawnPosY;
        this.width = 98;
        this.height = 87;

        this.speed = 2;

        this.fireRate = 1500;
        this.resetFireRate = this.fireRate;

        this.health = 5;

        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);

        // collider visual
        //context.lineWidth = 5;
        //context.strokeStyle = 'green';
        //context.beginPath();
        //context.arc(this.x + this.width/2, this.y + this.height/2, this.width/3, 0, Math.PI * 2);
        //context.stroke();
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
                    effects.push(new Effect(this.x + 30, this.y + 30, 216, 36, 6, 'turtleExplosionImage'));
                    score += 50;
                    if (playerBeamAmount == 1 && !powerUpDropped) {
                        dropPowerUp(this.x, this.y, 50, powerUpType.Projectile);
                    }
                    this.markedForDeletion = true;
                } else {
                    projectile.hit();
                }
            }
        });

        if (this.fireRate <= 0) {
            this.fireRate = this.resetFireRate;
            // spawn 3 projectiles
            let direction = '';
            for (let i = 0; i < 3; i++) {
                switch(i) {
                    case 0:
                        direction = 'Down';
                        break;
                    case 1: 
                        direction = 'Down Left';
                        break;
                    case 2:
                        direction = 'Down Right';
                        break;
                }
                enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, this.x + 45, this.y + 55, 5, direction));
            }
        }
        else {
            this.fireRate -= deltaTime;
        }

        // movement
        this.y += this.speed;

        // destroy the turtle when out of bound
        if (this.y > this.gameHeight - this.height) {
            this.markedForDeletion = true;
        }
    }
}