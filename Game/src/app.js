window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 840;
    canvas.height = 1024;

    const input = new InputHandler(restartGame);
    const background = new Background(canvas.width, canvas.height, 'backgroundImage');
    const ui = new UI();
    const player = new Player(canvas.width, canvas.height);

    let lastTime = 0;

    function generateAsteroids(deltaTime) {
        let randomAmount = Math.floor(Math.random() * 10) + 1;
        
        if (spawnInfos.asteroid.timer > spawnInfos.asteroid.interval + spawnInfos.asteroid.randomInterval) {
            for(let i = 0; i < randomAmount; i++) {
                let randSpawnPosX = Math.random() * canvas.width - 42;
                enemies.push(new Asteroid(canvas.width, canvas.height, randSpawnPosX, -canvas.height));
            }
            spawnInfos.asteroid.randomInterval = Math.floor(Math.random() * 1000) + 500;// random number between 500 - 1000
            spawnInfos.asteroid.timer = 0;
        } else {
            spawnInfos.asteroid.timer += deltaTime
        }
    }

    function generateMekaShroom(deltaTime) {
        if (spawnInfos.meka.timer > spawnInfos.meka.interval + spawnInfos.meka.randomInterval) {
            let randSpawnPosX = Math.floor(Math.random() * canvas.width - 90 * 2) + 90;
            for (let i = 0; i < 2; i++) {
                enemies.push(new MekaShroom(canvas.width, canvas.height, randSpawnPosX, 0));
                randSpawnPosX += 100;
            }
            spawnInfos.meka.randomInterval = Math.floor(Math.random() * 2500) + 1500;
            spawnInfos.meka.timer = 0;
        } else {
            spawnInfos.meka.timer += deltaTime;
        }
    }

    function generateTurtleShip(deltaTime) {
        if (spawnInfos.turtle.timer > spawnInfos.turtle.interval + spawnInfos.turtle.randomInterval) {
            let randSpawnPosX = Math.floor(Math.random() * canvas.width - 98) + 98;
            enemies.push(new TurtleShip(canvas.width, canvas.height, randSpawnPosX, 0));
            spawnInfos.turtle.randomInterval = Math.floor(Math.random() * 2500) + 1500;
            spawnInfos.turtle.timer = 0;
        } else {
            spawnInfos.turtle.timer += deltaTime;
        }
    }

    function generateDrone(deltaTime) {
        if (spawnInfos.drone.timer > spawnInfos.drone.interval + spawnInfos.drone.randomInterval) {
            let offset = 0;
            for (let i = 0; i < 10; i++) {
                let drone = new Drone(canvas.width, canvas.height, 0 + offset, 0);
                enemies.push(drone);
                offset += drone.width * 2;
            }
            spawnInfos.drone.randomInterval = Math.floor(Math.random() * 10000) + 9500;
            spawnInfos.drone.timer = 0;
        } else {
            spawnInfos.drone.timer += deltaTime;
        }
    }

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

    // main
    function animate(timeStamp) {
        if (gamePaused) {
            ui.displayPause(ctx);
            requestAnimationFrame(animate);
            return;
        }

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

        //displayUI(ctx);
        ui.displayScore(ctx, score)

        if (!gameOver) {
            // make this function loop
            requestAnimationFrame(animate);
        } else {
            ui.displayGameOver(ctx);
        }
    }

    // call function animate to start the game
    animate(0);
});