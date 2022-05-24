window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 840;
    canvas.height = 1024;

    let score = 0;
    let gameOver = false;

    let projectiles = [];
    let asteroids = [];

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
            this.width = 63;
            this.height = 51;
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
            context.drawImage(this.image, this.x, this.y);
            
            // collider visual
            //context.lineWidth = 5;
            //context.strokeStyle = 'green';
            //context.beginPath();
            //context.arc(this.x + this.width/2, this.y + this.height/2, this.width/3, 0, Math.PI * 2);
            //context.stroke();
        }

        update(input, deltaTime) {
            // collisions
            asteroids.forEach(asteroid => {
                const dx = (asteroid.x + asteroid.width/2) - (this.x + this.width/2);
                const dy = (asteroid.y + asteroid.height/2) - (this.y + this.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < asteroid.width/3 + this.width/3) {
                    // game over
                    asteroid.markedForDeletion = true;
                    gameOver = true;
                }
            });

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
                projectiles.push(new Beam(this.gameWidth, this.gameHeight, this.x + this.width/2 - 5, this.y));
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
    }

    class Beam {
        constructor(gameWidth, gameHeight, spawnPosX, spawnPosY) {
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
    }

    function handleAsteroids(deltaTime) {
        let rand = Math.floor(Math.random() * 10) + 1;
        
        if (asteroidTimer > asteroidInterval + randomAsteroidInterval) {
            for(let i = 0; i < rand; i++) {
                let randSpawnPosX = Math.random() * canvas.width - 42;
                asteroids.push(new Asteroid(canvas.width, canvas.height, randSpawnPosX, -canvas.height));
            }
            randomAsteroidInterval = Math.random() * 1000 + 500;
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

    function restartGame() {
        player.restart();
        background.restart();

        asteroids = [];
        projectiles = [];

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
    // random number between 500 - 1000
    let randomAsteroidInterval = Math.floor(Math.random() * 1000) + 500;//Math.random() * 1000 + 500;

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