/*
The BoardManager class.
Responsibilities:
    -spawns board items (worm/food)
    -draws all board items (worm/food)
    -draws the board
    -checks for collision between worm and wall or food
*/



class BoardManager {
    constructor() {
        this.worm;
        this.timeKeeper = 0;
    }
    spawnWorm(xPos, yPos) {
        this.worm = new Worm(xPos, yPos);
    }
    spawnFood() {
        //never directly in front of player
    }
    draw(rows, cols, gridSize) {
        //draw board
        let wideBorder = (width - (cols * gridSize)) / 2;
        let highBorder = (height - (rows * gridSize)) / 2;
        //debug lines
        for (let i = 0; i <= cols; i++) {
            let xPos = map(i, 0, cols, wideBorder, width - wideBorder);
            line(xPos, highBorder, xPos, height - highBorder);
        }
        for (let i = 0; i <= rows; i++) {
            let yPos = map(i, 0, rows, highBorder, height - highBorder);
            line(wideBorder, yPos, width - wideBorder, yPos);
        }

        //debug squares
        fill('red');
        rect(wideBorder, highBorder, gridSize);
        fill('yellow');
        rect(width - wideBorder - gridSize, height - highBorder - gridSize, gridSize);

        //draw all foods

        this.worm.draw(rows, cols, gridSize, wideBorder, highBorder);
    }
    update(state) {
        if (state == 'play') {
            this.timeKeeper += deltaTime;
            if (this.timeKeeper >= 500) {
                this.timeKeeper -= 500;
                this.worm.move(false);
            }
        }
    }
}

class Worm {

    constructor(x, y) {

        //control movement
        this.directionStack = [RIGHT];

        //worm section positions
        this.wormBody = [];
        let startLength = 5;
        if (this.direction == RIGHT) {
            for (let i = 0; i < startLength; i++) {
                this.wormBody.push({ x: x - i, y: y });
            }
        } else {
            for (let i = 0; i < startLength; i++) {
                this.wormBody.push({ x: x + i, y: y });
            }
        }

    }

    //draws the worm
    draw(rows, cols, gridSize, xBorder, yBorder) {

        //draw body segments
        for (let i = this.wormBody.length - 1; i >= 0; i--) {
            let xPos = map(this.wormBody[i].x, 0, cols, xBorder, width - xBorder);
            let yPos = map(this.wormBody[i].y, 0, rows, yBorder, height - yBorder);
            if (i == this.wormBody.length - 1) {
                fill('red');//red tail
            } else if (i == 0) {
                fill('green');//green head
            } else {
                fill('blue');
            }
            ellipse(xPos + gridSize / 2, yPos + gridSize / 2, gridSize);
        }

    }

    move(bAddSegement) {
        //moves worm position (on grid)

        //move the head
        let headX = this.wormBody[0].x;
        let headY = this.wormBody[0].y;
        switch (this.directionStack[0]) {
            case LEFT:
                // this.wormBody.head.x--;
                this.wormBody.unshift({ x: headX - 1, y: headY });
                break;
            case RIGHT:
                // this.wormBody.head.x++;
                this.wormBody.unshift({ x: headX + 1, y: headY });
                break;
            case UP:
                // this.wormBody.head.y--;
                this.wormBody.unshift({ x: headX, y: headY - 1 });
                break;
            case DOWN:
                // this.wormBody.head.y++;
                this.wormBody.unshift({ x: headX, y: headY + 1 });
                break;
            default:
                console.error("worm direction = " + this.direction);
                break;
        }
        //if we aren't adding a segment then delete the last section
        if (!bAddSegement) {
            this.wormBody.pop();
        }

        //update direction
        if(this.directionStack.length > 1){
            this.directionStack.shift();
        }

    }

    changeDirection(direction) {
        let lastDirection = this.directionStack[this.directionStack.length-1];
        switch (direction) {
            case LEFT:
                if (lastDirection != RIGHT) this.directionStack.push(direction);
                break;
            case RIGHT:
                if (lastDirection != LEFT) this.directionStack.push(direction);
                break;
            case UP:
                if (lastDirection != DOWN) this.directionStack.push(direction);
                break;
            case DOWN:
                if (lastDirection != UP) this.directionStack.push(direction);
                break;
            default:
                console.error("Worm recieved something that isnt a direction : " + direction);
                break;
        }
    }

}

class Food {
    //timer
    //good/bad

}

