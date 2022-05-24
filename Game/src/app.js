window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 840;
    canvas.height = 1024;

    let score = 0;
    let gameOver = false;

    let projectiles = [];
    let enemyBeams = [];
    
    let asteroids = [];
    let mekaShrooms = [];

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
            asteroids.forEach(asteroid => {
                if (this.calculateCollision(asteroid.x, asteroid.y, asteroid.width, asteroid.height)) {
                    asteroid.markedForDeletion = true;
                }
            });
            enemyBeams.forEach(beam => {
                if(this.calculateCollision(beam.x, beam.y, beam.width, beam.height)) {
                    beam.markedForDeletion = true;
                }
            });
            mekaShrooms.forEach(meka => {
                if (this.calculateCollision(meka.x, meka.y, meka.width, meka.height)) {
                    meka.markedForDeletion = true;
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
        constructor(gameWidth, gameHeight, spawnPosX, spawnPosY, direction) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            this.image = document.getElementById('enemyBeamImage');
            this.x = spawnPosX;
            this.y = spawnPosY;
            this.width = 12;
            this.height = 17;

            this.speed = 10;
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
            }
            this.y += this.speed;

            if (this.y > this.gameHeight - this.height) {
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
                        score += 20;
                    }
                }
            });

            if (this.fireRate <= 0) {
                this.fireRate = this.resetFireRate;
                // spawn 2 projectiles
                let offset = 6;
                for (let i = 0; i < 2; i++) {
                    enemyBeams.push(new EnemyBeam(this.gameWidth, this.gameHeight, this.x + offset, this.y + 75, 'Down'));
                    offset += 65;
                }
            }
            else {
                this.fireRate -= deltaTime;
            }

            // movement
            this.y += this.speed;

            // destroy the asteroid when out of bound
            if (this.y > this.gameHeight - this.height) {
                this.markedForDeletion = true;
            }
        }
    }

    class ExplosionEffect {
        constructor(gameWidth, gameHeight, width, height, maxFrame, imageId) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            this.image = document.getElementById(imageId);
            this.x = 0;
            this.y = 0;
            this.width = width;
            this.height = height;

            this.frameX = 0;
            this.maxFrame = maxFrame;

            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
        }

        draw(context) {
            
        }

        update(deltaTime) {

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
        if (gameOver)
        {
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText("Game Over, Press Enter To Restart!", canvas.width/2, 200);
            context.fillStyle = "white";
            context.fillText("Game Over, Press Enter To Restart!", canvas.width/2 + 2, 202);
        }
    }

    function handleProjectiles() {
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
    }

    function handleAsteroids(deltaTime) {
        let rand = Math.floor(Math.random() * 10) + 1;
        
        if (asteroidTimer > asteroidInterval + randomAsteroidInterval) {
            for(let i = 0; i < rand; i++) {
                let randSpawnPosX = Math.random() * canvas.width - 42;
                asteroids.push(new Asteroid(canvas.width, canvas.height, randSpawnPosX, -canvas.height));
            }
            randomAsteroidInterval = Math.floor(Math.random() * 1000) + 500;// random number between 500 - 1000
            asteroidTimer = 0;
        } else {
            asteroidTimer += deltaTime
        }

        asteroids.forEach(asteroid => {
            asteroid.draw(ctx);
            asteroid.update();
        });
        asteroids = asteroids.filter(asteroid => !asteroid.markedForDeletion);
    }

    function handleMekaShroom(deltaTime) {
        if (mekaTimer > mekaInterval + randomMekaInterval) {
            for (let i = 0; i < 2; i++) {
                let randSpawnPosX = Math.random() * canvas.width - 90;
                mekaShrooms.push(new MekaShroom(canvas.width, canvas.height, randSpawnPosX, 0));
            }
            randomMekaInterval = Math.floor(Math.random() * 4000) + 3000;
            mekaTimer = 0;
        } else {
            mekaTimer += deltaTime;
        }

        mekaShrooms.forEach(mek => {
            mek.draw(ctx);
            mek.update(deltaTime);
        });
        mekaShrooms = mekaShrooms.filter(mek => !mek.markedForDeletion);
    }

    function restartGame() {
        player.restart();
        background.restart();

        asteroids = [];
        mekaShrooms = [];
        projectiles = [];
        enemyBeams = [];

        score = 0;
        gameOver = false;

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
    let mekaInterval = 5000;
    let randomMekaInterval = Math.floor(Math.random() * 5000) + 4000;

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

        handleProjectiles();
        handleMekaShroom(deltaTime);
        handleAsteroids(deltaTime);

        displayUI(ctx);

        if (!gameOver) {
            // make this function loop
            requestAnimationFrame(animate);
        }
    }

    // start game
    animate(0);
});