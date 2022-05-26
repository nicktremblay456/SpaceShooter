window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 840;
    canvas.height = 1024;

    let score = 0;
    let gameOver = false;

    let projectiles = [];
    let enemyBeams = [];

    let effects = [];

    let enemies = [];

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
                this.fireRate = this.resetFireRate;
                projectiles.push(new Beam(this.gameWidth, this.gameHeight, this.x + this.width/2 - 15, this.y));
                // spawn 2 projectiles
                //let offset = 0;
                //for (let i = 0; i < 2; i++) {
                //    projectiles.push(new Beam(this.gameWidth, this.gameHeight, this.x + offset, this.y));
                //    offset += 50;
                //}
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

        collision() {
            enemies.forEach(enemy => {
                if (this.calculateCollision(enemy.x, enemy.y, enemy.width, enemy.height)) {
                    enemy.markedForDeletion = true;
                }
            });
        }

        calculateCollision(x, y, width, height) {
            const dx = (x + width/2) - (this.x + width/2);
            const dy = (y + height/2) - (this.y + this.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < width/3 + this.width/3) {
                gameOver = true;
                return true;
            }

            return false;
        }
    }

    class Beam {
        constructor(gameWidth, gameHeight, spawnPosX, spawnPosY, direction) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            this.image = document.getElementById('beamImage');
            this.x = spawnPosX;
            this.y = spawnPosY;
            this.width = 36;
            this.height = 44;

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
            this.width = 12;
            this.height = 17;

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
                    this.markedForDeletion = true;
                    effects.push(new ExplosionEffect(this.x, this.y, 656, 72, 8, 'asteroidExplosionImage'));
                    score += 10;
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
                        this.markedForDeletion = true;
                        effects.push(new ExplosionEffect(this.x + this.width/2, this.y + this.height/2, 180, 30, 6, 'mekaExplosionImage'));
                        score += 20;
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
                        this.markedForDeletion = true;
                        effects.push(new ExplosionEffect(this.x + 30, this.y + 30, 216, 36, 6, 'turtleExplosionImage'));
                        score += 50;
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

    class ExplosionEffect {
        constructor(spawnPosX, spawnPosY, width, height, maxFrame, imageId) {
            this.image = document.getElementById(imageId);
            this.x = spawnPosX;
            this.y = spawnPosY;
            
            this.frameX = 0;
            this.maxFrame = maxFrame;
            // sprite sheet image width divided by the number of sprite per row
            this.width = width / maxFrame;
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

        effects.forEach(effect => {
            effect.draw(ctx);
            effect.update(deltaTime);
        });
        effects = effects.filter(effect => !effect.markedForDeletion);
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
            let randSpawnPosX = Math.floor(Math.random() * canvas.width - 90) + 90;
            for (let i = 0; i < 2; i++) {
                enemies.push(new MekaShroom(canvas.width, canvas.height, randSpawnPosX, 0));
                randSpawnPosX += 100;
            }
            randomMekaInterval = Math.floor(Math.random() * 4000) + 3000;
            mekaTimer = 0;
        } else {
            mekaTimer += deltaTime;
        }
    }

    function generateTurtleShip(deltaTime) {
        if (turtleTimer > turtleInterval + randomTurtleInterval) {
            console.log('generated');
            let randSpawnPosX = Math.floor(Math.random() * canvas.width - 98) + 98;
            enemies.push(new TurtleShip(canvas.width, canvas.height, randSpawnPosX, 0));
            randomTurtleInterval = Math.floor(Math.random() * 4000) + 3000;
            turtleTimer = 0;
        } else {
            turtleTimer += deltaTime;
        }
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

        score = 0;
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
    let mekaInterval = 3500;
    let randomMekaInterval = Math.floor(Math.random() * 4000) + 3000;

    let turtleTimer = 0;
    let turtleInterval = 5000;
    let randomTurtleInterval = Math.floor(Math.random() * 4000) + 3000;

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
        generateAsteroids(deltaTime);
        if (score >= 1500) {
            generateMekaShroom(deltaTime);
        }
        if (score >= 3000) {
            generateTurtleShip(deltaTime);
        }
        handleEnemies(deltaTime);

        displayUI(ctx);

        if (!gameOver) {
            // make this function loop
            requestAnimationFrame(animate);
        }
    }

    // start game
    animate(0);
});