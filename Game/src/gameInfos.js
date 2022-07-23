let score = 0;
let playerBeamLevel = 0;
let playerBeamAmount = 1;

let gameOver = false;
let bossSpawned = false;
let bossDefeated = false;
let gamePaused = false;
let powerUpDropped = false;

let projectiles = [];
let enemyBeams = [];
let enemies = [];
let effects = [];
let powerUps = [];

const powerUpType = {
    Projectile: 'img/items/power-up-1.png',
    Beam: 'img/items/power-up-2.png',
    Restore: 'img/items/power-up-3.png'
};
const playerBeamInfos = [{
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

const spawnInfos = {
    asteroid: {
        timer: 0,
        interval: 1000,
        randomInterval: Math.floor(Math.random() * 1000) + 500, // random number between 500 - 1000
    },
    meka: {
        timer: 0,
        interval: 2500,
        randomInterval: Math.floor(Math.random() * 2500) + 1500,
    },
    turtle: {
        timer: 0,
        interval: 2500,
        randomInterval: Math.floor(Math.random() * 2500) + 1500,
    },
    drone: {
        timer: 0,
        interval: 1000,
        randomInterval: Math.floor(Math.random() * 10000) + 9500,
    }
};