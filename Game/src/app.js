window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 840;
    canvas.height = 1024;

    let score = 0;
    let gameOver = false;

    let projectiles = [];
    let enemyBeams = [];
    let enemies = [];
    let effects = [];
    let powerUps = [];

    let powerUpType = {
        Projectile: 'img/items/power-up-1.png',
        Beam: 'img/items/power-up-2.png',
        Restore: 'img/items/power-up-3.png'
    };
    let powerUpDropped = false;

    let playerBeamInfos = [ {
            width: 16,
            height: 18,
            path: 'img/shots/2.png'
        }, {
            width: 18,
            height: 21,
            path: 'img/shots/6.png'
        }, {
            width: 31,
            height: 19,
            path: 'img/shots/9.png'
        }, {
            width: 34,
            height: 38,
            path: 'img/shots/10.png'
        }, {
            width: 36,
            height: 44,
            path: 'img/shots/8.png'
        }, {
            width: 19,
            height: 47,
            path: 'img/shots/11.png'
        }, {
            width: 36,
            height: 47,
            path: 'img/shots/12.png'
        }
    ];
    let playerBeamLevel = 0;
    let playerBeamAmount = 1;

    let bossSpawned = false;
    let bossDefeated = false;

    class InputHandler {
        constructor() {
            this.keys = [];

            window.addEventListener('keydown', e => {
                switch(e.key) {
                    case ' ': // Space input
                    case 'ArrowRight':
                    case 'ArrowLeft':
                    case 'ArrowUp':
                    case 'ArrowDown':
                        if (this.keys.indexOf(e.key) === -1) {
                            this.keys.push(e.key);
                        }
                        break;
                    case 'Enter':
                        if (gameOver) {
                            restartGame();
                        }
                        break;
                }
            });
            window.addEventListener('keyup', e => {
                switch(e.key) {
                    case ' ':
                    case 'ArrowRight':
                    case 'ArrowLeft':
                    case 'ArrowUp':
                    case 'ArrowDown':
                        this.keys.splice(this.keys.indexOf(e.key), 1);
                        break;
                }
            });
        }
    }

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
    }

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
                    projectile.markedForDeletion = true;
                    if (this.health <= 0) {
                        effects.push(new Effect(this.x + this.width/2, this.y + this.height/2, 180, 30, 6, 'mekaExplosionImage'));
                        score += 20;
                        // drop power up condition
                        if (playerBeamLevel == 1 && !powerUpDropped) {
                            dropPowerUp(this.x, this.y, 50, powerUpType.Beam);
                        } else if (score >= 7000 && playerBeamLevel <= 3 && !powerUpDropped) {
                            dropPowerUp(this.x, this.y, 25, powerUpType.Beam);
                        }
                        this.markedForDeletion = true;
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
                    projectile.markedForDeletion = true;
                    if (this.health <= 0) {
                        effects.push(new Effect(this.x + 30, this.y + 30, 216, 36, 6, 'turtleExplosionImage'));
                        score += 50;
                        if (playerBeamAmount == 1 && !powerUpDropped) {
                            dropPowerUp(this.x, this.y, 50, powerUpType.Projectile);
                        }
                        this.markedForDeletion = true;
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
                    projectile.markedForDeletion = true;
                    if (this.health <= 0) {
                        effects.push(new Effect(this.x, this.y, 84, 28, 7, 'droneExplosionImage'));
                        enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, this.x, this.y + 75, 5, 'Down'));
                        score += 10;
                        if (playerBeamLevel == 2 && !powerUpDropped) {
                            dropPowerUp(this.x, this.y, 10, powerUpType.Beam);
                        }
                        this.markedForDeletion = true;
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

    class Effect {
        constructor(spawnPosX, spawnPosY, width, height, maxFrame, imageId) {
            this.image = document.getElementById(imageId);
            this.x = spawnPosX;
            this.y = spawnPosY;
            
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = maxFrame;
            // sprite sheet image width divided by the number of sprite per row
            this.width = width / this.maxFrame;
            this.height = height;

            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;

            this.markedForDeletion = false;
        }

        draw(context) {
            // img, sX, sY, sW, sH, dX, dY, dW, dH
            context.drawImage(this.image, this.frameX * this.width, 0 * this.height, this.width, this.height,
                this.x, this.y, this.width, this.height);
        
            //context.strokeStyle = 'green';
            //context.beginPath();
            //context.arc(this.x + this.width/2, this.y + this.height/2, this.width/3, 0, Math.PI * 2);
            //context.stroke();
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) {
                    //this.frameX = 0; // Restart animation
                    this.markedForDeletion = true;
                }
                else {
                    this.frameX++;
                }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            }
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

            this.player = player;

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

    function displayUI(context) {
        context.textAlign = "left";
        context.font = "40px Halvetica";
        // custom shadow effect
        context.fillStyle = "black";
        context.fillText("Score: " + score, 20, 50);
        context.fillStyle = "white";
        context.fillText("Score: " + score, 22, 52);
        if (gameOver) {
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText("Game Over, Press Enter To Restart!", canvas.width/2, 200);
            context.fillStyle = "red";
            context.fillText("Game Over, Press Enter To Restart!", canvas.width/2 + 2, 202);
        }
        //if (bossDefeated) {
        //    context.textAlign = "center";
        //    context.fillStyle = "black";
        //    context.fillText("Victory", canvas.width/2, canvas.height/2);
        //    context.fillStyle = "blue";
        //    context.fillText("Victory", canvas.width/2 + 2, canvas.height/2 + 2);
        //}
    }

    function dropPowerUp(spawnPosX, spawnPosY, dropRate, type) {
        let rand = Math.floor(Math.random() * 101);
        if (rand <= dropRate) { //50%
            powerUps.push(new PowerUp(canvas.width, canvas.height, spawnPosX, spawnPosY, type));
            powerUpDropped = true;
        }
    }

    function generateAsteroids(deltaTime) {
        let randomAmount = Math.floor(Math.random() * 10) + 1;
        
        if (asteroidTimer > asteroidInterval + randomAsteroidInterval) {
            for(let i = 0; i < randomAmount; i++) {
                let randSpawnPosX = Math.random() * canvas.width - 42;
                enemies.push(new Asteroid(canvas.width, canvas.height, randSpawnPosX, -canvas.height));
            }
            randomAsteroidInterval = Math.floor(Math.random() * 1000) + 500;// random number between 500 - 1000
            asteroidTimer = 0;
        } else {
            asteroidTimer += deltaTime
        }
    }

    function generateMekaShroom(deltaTime) {
        if (mekaTimer > mekaInterval + randomMekaInterval) {
            let randSpawnPosX = Math.floor(Math.random() * canvas.width - 90 * 2) + 90;
            for (let i = 0; i < 2; i++) {
                enemies.push(new MekaShroom(canvas.width, canvas.height, randSpawnPosX, 0));
                randSpawnPosX += 100;
            }
            randomMekaInterval = Math.floor(Math.random() * 2500) + 1500;
            mekaTimer = 0;
        } else {
            mekaTimer += deltaTime;
        }
    }

    function generateTurtleShip(deltaTime) {
        if (turtleTimer > turtleInterval + randomTurtleInterval) {
            let randSpawnPosX = Math.floor(Math.random() * canvas.width - 98) + 98;
            enemies.push(new TurtleShip(canvas.width, canvas.height, randSpawnPosX, 0));
            randomTurtleInterval = Math.floor(Math.random() * 2500) + 1500;
            turtleTimer = 0;
        } else {
            turtleTimer += deltaTime;
        }
    }

    function generateDrone(deltaTime) {
        if (droneTimer > droneInterval + randomDroneInterval) {
            let offset = 0;
            for (let i = 0; i < 10; i++) {
                let drone = new Drone(canvas.width, canvas.height, 0 + offset, 0);
                enemies.push(drone);
                offset += drone.width * 2;
            }
            randomDroneInterval = Math.floor(Math.random() * 10000) + 9500;
            droneTimer = 0;
        } else {
            droneTimer += deltaTime;
        }
    }

    // Also handle effects
    function handleProjectiles(deltaTime) {
        projectiles.forEach(projectile => {
            projectile.draw(ctx);
            projectile.update();
        });
        projectiles = projectiles.filter(projectile => !projectile.markedForDeletion);
        enemyBeams.forEach(beam => {
            beam.draw(ctx);
            beam.update();
        });
        enemyBeams = enemyBeams.filter(beam => !beam.markedForDeletion);

        powerUps.forEach(powerUp => {
            powerUp.draw(ctx);
            powerUp.update();
        });
        powerUps = powerUps.filter(powerUp => !powerUp.markedForDeletion);

        effects.forEach(effect => {
            effect.draw(ctx);
            effect.update(deltaTime);
        });
        effects = effects.filter(effect => !effect.markedForDeletion);
    }

    function handleEnemies(deltaTime) {
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function restartGame() {
        player.restart();
        background.restart();

        enemies = [];
        projectiles = [];
        enemyBeams = [];
        effects = [];
        powerUps = [];

        playerBeamLevel = 0;
        playerBeamAmount = 1;

        score = 0;
       
        powerUpDropped = false;
        bossSpawned = false;
        bossDefeated = false;
        gameOver = false;

        // restart game
        animate(0);
    }

    const input = new InputHandler();
    const background = new Background(canvas.width, canvas.height, 'backgroundImage');
    const player = new Player(canvas.width, canvas.height);

    let lastTime = 0;

    let asteroidTimer = 0;
    let asteroidInterval = 1000;
    let randomAsteroidInterval = Math.floor(Math.random() * 1000) + 500;// random number between 500 - 1000

    let mekaTimer = 0;
    let mekaInterval = 2500;
    let randomMekaInterval = Math.floor(Math.random() * 2500) + 1500;

    let turtleTimer = 0;
    let turtleInterval = 2500;
    let randomTurtleInterval = Math.floor(Math.random() * 2500) + 1500;

    let droneTimer = 0;
    let droneInterval = 1000;
    let randomDroneInterval = Math.floor(Math.random() * 10000) + 9500;

    // main
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        // clean the canvas between each loop
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        background.draw(ctx);
        background.update();

        player.draw(ctx);
        player.update(input, deltaTime);

        handleProjectiles(deltaTime);
        if (!bossSpawned) {
            generateAsteroids(deltaTime);
            if (score >= 1000) {
                generateMekaShroom(deltaTime);
            }
            if (score >= 3000) {
                generateTurtleShip(deltaTime);
            }
            if (score >= 4200) {
                generateDrone(deltaTime);
            }
        }

        // first boss
        if (score >= 6000 && !bossDefeated && !bossSpawned) {
            // destroy every enemy for the boss fight
            enemies.forEach(enemy => {
                enemy.markedForDeletion = true;
            })
            enemies = [];
            enemies.push(new Boss(canvas.width, canvas.height));
            bossSpawned = true;
        }
        handleEnemies(deltaTime);

        displayUI(ctx);

        if (!gameOver) {
            // make this function loop
            requestAnimationFrame(animate);
        }
    }

    // call function animate to start the game
    animate(0);
});