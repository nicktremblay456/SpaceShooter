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