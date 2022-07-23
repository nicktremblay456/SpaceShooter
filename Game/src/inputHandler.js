class InputHandler {
    constructor(onEnterPressed = undefined) {
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
                    if (gameOver && onEnterPressed != undefined) {
                        onEnterPressed();
                    }
                    break;
                case 'Escape':
                    gamePaused = !gamePaused;
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