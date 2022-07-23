class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        this.image = document.getElementById('playerImage');
        this.width = 64;
        this.height = 47;
        this.x = this.gameWidth / 2;
        this.y = this.gameHeight - this.height;

        this.speed = 10;
        this.fireRate = 100;

        this.resetFireRate = this.fireRate;
    }

    restart() {
        this.x = this.gameWidth / 2;
        this.y = this.gameHeight - this.height;
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

    update(input, deltaTime) {
        // collisions
        this.collision();

        // horizontal movement
        if (input.keys.indexOf('ArrowRight') > -1) {
            this.x += this.speed;
        }
        else if (input.keys.indexOf('ArrowLeft') > -1) {
            this.x -= this.speed;
        }
        // vertical movement
        if (input.keys.indexOf('ArrowUp') > -1) {
            this.y -= this.speed;
        }
        else if (input.keys.indexOf('ArrowDown') > -1) {
            this.y += this.speed;
        }
        // fire projectiles
        if (input.keys.indexOf(' ') > -1 && this.fireRate <= 0) {
            this.fire();
            this.fireRate = this.resetFireRate;
        }
        else {
            this.fireRate -= deltaTime;
        }

        // apply horizontal boundary
        if (this.x < 0) {
            this.x = 0;
        }
        else if (this.x > this.gameWidth - this.width) {
            this.x = this.gameWidth - this.width;
        }
        // apply vertical boundary
        if (this.y > this.gameHeight - this.height) {
            this.y = this.gameHeight - this.height;
        }
        else if (this.y < 0) {
            this.y = 0;
        }
    }

    fire() {
        //projectiles.push(new Beam(this.gameWidth, this.gameHeight, this.x + this.width/2 - 10, this.y, playerBeamInfo));
        let offset;
        switch(playerBeamAmount) {
            case 1:
                switch(playerBeamLevel) {
                    case 0: case 1: offset = 25; break;
                    case 2: offset = 20; break;
                    case 3: offset = 15; break;
                    case 4: offset = 15; break;
                    case 5: offset = 22; break;
                    case 6: offset = 15; break;
                }
                break;
            case 2:
                switch(playerBeamLevel) {
                    case 0: case 1: case 5: offset = 15; break;
                    case 2: case 3: offset = 0; break;
                    case 4: offset = -5; break;
                    case 6: offset = 0; break;
                }
                break;
            case 3:
                switch(playerBeamLevel) {
                    case 0: offset = 10; break;
                    case 2: offset = -10; break;
                    case 3: case 4: offset = -20; break;
                    case 1: case 5: offset = 5; break;
                    case 6: offset = -25; break;
                }
                break;
        }
        for (let i = 0; i < playerBeamAmount; i++) {
            let beam = new Beam(this.gameWidth, this.gameHeight, this.x + offset, this.y, playerBeamInfos);
            projectiles.push(beam);
            offset += beam.width;
        }
    }

    collision() {
        enemies.forEach(enemy => {
            if (this.calculateCollision(enemy.x, enemy.y, enemy.width, enemy.height)) {
                enemy.markedForDeletion = true; gameOver = true;
            }
        });
        enemyBeams.forEach(beam => {
            if (this.calculateCollision(beam.x, beam.y, beam.width, beam.height)) {
                beam.markedForDeletion = true; gameOver = true;
            }
        });
        powerUps.forEach(powerUp => {
            if (this.calculateCollision(powerUp.x, powerUp.y, powerUp.width, powerUp.height)) {
                switch(powerUp.type) {
                    case powerUpType.Projectile:
                        if (playerBeamAmount < 3) {
                            playerBeamAmount++;
                        }
                        break;
                    case powerUpType.Beam:
                        if (playerBeamLevel < playerBeamInfos.length - 1) {
                            playerBeamLevel++;
                        }
                        break;
                    case powerUpType.Restore:
                        // Restore 1 hp
                        break;
                }
                powerUpDropped = false;
                powerUp.markedForDeletion = true;
            }
        });
    }

    calculateCollision(x, y, width, height) {
        const dx = (x + width/2) - (this.x + width/2 + 20);
        const dy = (y + height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < width/3 + this.width/3) {
            return true;
        }

        return false;
    }
}