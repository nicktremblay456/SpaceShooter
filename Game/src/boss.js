class Boss {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('bossImage');
        this.width = 530;
        this.height = 636;
        this.x = gameWidth/2 - this.width/2;
        this.y = 0 - this.height;

        this.health = 200;

        this.speed = 1;
        this.direction = 'Left';

        this.fireRate = 1000;
        this.resetFireRate = this.fireRate;

        this.ready = false;
        this.markedForDeletion = false;
    }

    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        if (this.ready) {
            this.displayBossStatus(context);
        }
    }

    update(deltaTime) {
        if (!this.ready) {
            this.y += this.speed;
            if (this.y >= 0 - this.height/2) {
                this.ready = true;
            }
        } else {
            // collision
            projectiles.forEach(projectile => {
                const dx = (projectile.x + projectile.width/2) - (this.x + this.width/2);
                const dy = (projectile.y + projectile.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < projectile.width/3 + this.width/3) {
                    this.health--;
                    projectile.markedForDeletion = true;
                    if (this.health <= 0) {
                        for (let i = 0; i < 10; i++) {
                            let randX = Math.floor(Math.random() * this.width);
                            let randY = Math.floor(Math.random() * this.height/2);
                            effects.push(new Effect(randX, randY, 656, 72, 8, 'asteroidExplosionImage'));
                        }
                        dropPowerUp(this.x, this.y, 100, powerUpType.Projectile);
                        score += 1000;
                        bossSpawned = false;
                        bossDefeated = true;
                        this.markedForDeletion = true;
                    }
                }
            });

            if (this.fireRate <= 0) {
                this.fireRate = this.resetFireRate;
                // spawn 3 projectiles
                let dir = '';
                for (let i = 0; i < 3; i++) {
                    switch(i) {
                        case 0:
                            dir = 'Down';
                            break;
                        case 1: 
                            dir = 'Down Left';
                            break;
                        case 2:
                            dir = 'Down Right';
                            break;
                    }
                    enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, (this.x + this.width/2) - 65, this.y + this.height - 50, 5, dir));
                    enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, (this.x + this.width/2) + 65, this.y + this.height - 50, 5, dir));
                }
            }
            else {
                this.fireRate -= deltaTime;
            }

            // movement
            if (this.direction == 'Right') {
                this.x += this.speed;
            } else if (this.direction == 'Left') {
                this.x -= this.speed;
            }

            if (this.x >= this.gameWidth - this.width && this.direction != 'Left') {
                this.direction = 'Left';
            }
            else if (this.x <= 0 && this.direction != 'Right') {
                this.direction = 'Right';
            }
        }
    }

    displayBossStatus(context) {
        context.textAlign = "left";
        context.font = "40px Halvetica";
        // custom shadow effect
        context.fillStyle = "black";
        context.fillText("Boss: " + this.health, this.width - 55, 50);
        context.fillStyle = "white";
        context.fillText("Boss: " + this.health, this.width - 57, 52);
    }
}