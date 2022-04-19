/*
The BoardManager class.
Responsibilities:
    -spawns board items (worm/food)
    -draws all board items (worm/food)
    -draws the board
    -checks for collision between worm and wall or food
*/



// class BoardManager {
//     constructor(rows, cols, parentDim) {
//         this.cols = cols;
//         this.rows = rows;
//         this.calculateBoardWindow(parentDim);
//         this.worm;
//         this.timeKeeper = 0;
//         this.gameTick = 500;//milliseconds between actual changes to the board (not animations)
//     }
//     spawnWorm(xPos, yPos) {
//         this.worm = new Worm(xPos, yPos);
//     }
//     spawnFood() {
//         //never directly in front of player
//     }
//     startGame() {
//         this.spawnWorm(floor(this.cols / 2) - 1, floor(this.rows / 2) - 1);
//         // this.spawnWorm(0, 0);
//     }
//     draw() {
//         //draw board
//         let wideBorder = (width - (this.cols * this.gridSize)) / 2;
//         let highBorder = (height - (this.rows * this.gridSize)) / 2;

//         if (bIsDebugMode) {
//             push();
//             //debug lines
//             for (let i = 0; i <= this.cols; i++) {
//                 let xPos = map(i, 0, this.cols, wideBorder, width - wideBorder);
//                 line(xPos, highBorder, xPos, height - highBorder);
//             }
//             for (let i = 0; i <= this.rows; i++) {
//                 let yPos = map(i, 0, this.rows, highBorder, height - highBorder);
//                 line(wideBorder, yPos, width - wideBorder, yPos);
//             }
//             //debug squares
//             fill('red');
//             rect(wideBorder, highBorder, this.gridSize);
//             fill('yellow');
//             rect(width - wideBorder - this.gridSize, height - highBorder - this.gridSize, this.gridSize);
//             pop();
//         }

//         //draw all foods

//         //draw the worm
//         let animPercent = this.timeKeeper / this.gameTick;
//         this.worm.draw(this.rows, this.cols, this.gridSize, wideBorder, highBorder, animPercent);

//     }
//     update(state) {
//         if (state == 'play') {
//             this.timeKeeper += deltaTime;
//             if (this.timeKeeper >= this.gameTick) {
//                 this.timeKeeper -= this.gameTick;
//                 this.worm.move(false);
//             }
//         }
//     }
//     calculateBoardWindow(parentDim) {
//         let boardRatio = this.cols / this.rows;
//         let windowRatio = parentDim.width / parentDim.height;
//         if (boardRatio < windowRatio) {
//             this.gridSize = parentDim.height / this.rows;
//         } else {
//             this.gridSize = parentDim.width / this.cols;
//         }
//     }
// }

class Worm {

    constructor(x, y) {

        //control movement
        this.direction = RIGHT;

        //worm section positions
        this.wormBody = [];
        let startLength = 10;
        this.headOverride = undefined;

        if (this.direction == RIGHT) {
            for (let i = 0; i < startLength; i++) {
                this.wormBody.push({ x: x - i, y: y, direction: this.direction });
            }
        } else {
            for (let i = 0; i < startLength; i++) {
                this.wormBody.push({ x: x + i, y: y, direction: this.direction });
            }
        }

    }

    //draws the worm
    draw(rows, cols, gridSize, xBorder, yBorder, animPercent) {
        push();
        let numSegments = this.wormBody.length;
        let numSubSegments = 2;
        let totalSubSegments = numSubSegments * numSegments;

        let maxPctOffsetOnSpline = 1 / numSegments;

        //convert all grid coords to screenspace coords
        let threeSpline = [];
        for (let i = numSegments - 1; i >= 0; i--) {
            let currY = map(this.wormBody[i].y, 0, rows, yBorder + gridSize / 2, height - yBorder + gridSize / 2);
            let currX = map(this.wormBody[i].x, 0, cols, xBorder + gridSize / 2, width - xBorder + gridSize / 2);
            threeSpline.unshift(new THREE.Vector2(currX, currY));
        }

        //predict the coord based on direction
        let predict = this.getNextSegment();
        let xPos = map(predict.x, 0, cols, xBorder + gridSize / 2, width - xBorder + gridSize / 2);
        let yPos = map(predict.y, 0, rows, yBorder + gridSize / 2, height - yBorder + gridSize / 2);
        threeSpline.unshift(new THREE.Vector2(xPos, yPos));

        //make a set of points along a smooth line
        const curve = new THREE.SplineCurve(threeSpline);

        //draw body segments
        for (let i = numSegments; i > 0; i--) {
            //start from the tail
            let img = imageList.wormBody;

            // fill('salmon');
            strokeWeight(gridSize / 15);
            // stroke('tomato');
            // stroke('black');
            fill('#e5a7a7');
            stroke('#b72f2f');
            let bIsHead = false;
            if (i == 3) {
                stroke('#dd9999');
                fill('#dd9999');
            } else if (i == 1) {
                bIsHead = true;
                if(animPercent > 0.5){
                    img = imageList.wormHeadOpen;
                } else {
                    img = imageList.wormHeadIdle;
                }

                noStroke();
            }
            if(this.headOverride && bIsHead){
                img = this.headOverride;
            }

            for (let s = numSubSegments - 1; s >= (bIsHead ? numSubSegments - 1 : 0); s--) {
                let subSegIndex = s + (i - 1) * numSubSegments;
                let subSegPct = (subSegIndex + 1) / totalSubSegments;

                let extendAnim = 2;
                let alpha = lerp(-1, extendAnim, 1 - animPercent);
                let rateOfChange = 1.8;
                alpha = constrain(-pow(-alpha + rateOfChange * subSegIndex / totalSubSegments, 3) + 1, 0, 1);
                alpha = (alpha * -1) + 1;

                subSegPct -= lerp(0, maxPctOffsetOnSpline, alpha);

                let pos = curve.getPointAt(subSegPct);
                // ellipse(pos.x, pos.y, gridSize);
                imageMode(CENTER);
                push();
                translate(pos.x, pos.y);
                if (bIsHead && s == numSubSegments - 1) {
                    if (this.direction == RIGHT) {
                        scale(-1, 1);
                    } else if (this.direction == UP) {
                        rotate(HALF_PI);
                    } else if (this.direction == DOWN) {
                        rotate(-HALF_PI);
                    }
                }
                image(img, 0, 0, gridSize * 1.75, gridSize * 1.75);
                pop();
            }


        }
        if (bIsDebugMode) {
            push();
            //debug line
            // console.log(curve);
            stroke('cyan');
            noFill();
            beginShape();
            for (let i = 0; i < 1 - maxPctOffsetOnSpline; i += 0.01) {
                let pos = curve.getPointAt(i);
                vertex(pos.x, pos.y);
            }
            endShape();
            pop();
        }
        pop();
    }

    move(bAddSegment) {
        //moves worm position (on grid)
        this.wormBody.unshift(this.getNextSegment());

        //if we aren't adding a segment then delete the last section
        if (!bAddSegment) {
            this.wormBody.pop();
        }

    }
    getNextSegment() {
        //store the head
        let headX = this.wormBody[0].x;
        let headY = this.wormBody[0].y;
        let nextSeg;
        switch (this.direction) {
            case LEFT:
                // this.wormBody.head.x--;
                // this.wormBody.unshift({ x: headX - 1, y: headY, direction: this.direction });
                nextSeg = { x: headX - 1, y: headY, direction: this.direction };
                break;
            case RIGHT:
                // this.wormBody.head.x++;
                // this.wormBody.unshift({ x: headX + 1, y: headY, direction: this.direction });
                nextSeg = { x: headX + 1, y: headY, direction: this.direction };
                break;
            case UP:
                // this.wormBody.head.y--;
                // this.wormBody.unshift({ x: headX, y: headY - 1, direction: this.direction });
                nextSeg = { x: headX, y: headY - 1, direction: this.direction };
                break;
            case DOWN:
                // this.wormBody.head.y++;
                // this.wormBody.unshift({ x: headX, y: headY + 1, direction: this.direction });
                nextSeg = { x: headX, y: headY + 1, direction: this.direction };
                break;
            default:
                console.error("worm direction = " + this.direction);
                break;
        }
        return nextSeg;
    }

    changeDirection(direction, rows, cols) {

        let pos = this.wormBody[0];
        let lastDirection = pos.direction;

        // console.log(pos.x , cols-1, pos.y);
        switch (direction) {
            case LEFT:
                if (pos.x > 0 && lastDirection != RIGHT) this.direction = direction;
                break;
            case RIGHT:
                if (pos.x < (cols - 1) && lastDirection != LEFT) this.direction = direction;
                break;
            case UP:
                if (pos.y > 0 && lastDirection != DOWN) this.direction = direction;
                break;
            case DOWN:
                if (pos.y < (rows - 1) && lastDirection != UP) this.direction = direction;
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
    constructor(x, y, image, bIsGood) {
        this.timer = 20000; // 20 seconds into the future
        this.bIsGood = bIsGood;
        this.x = x;
        this.y = y;
        this.image = image;
    }
    draw(xOff, yOff, gridSize, cols, rows) {
        let xPos = map(this.x, 0, cols, xOff, gridSize * cols + xOff);
        let yPos = map(this.y, 0, rows, yOff, gridSize * rows + yOff);
        image(this.image, xPos, yPos, gridSize * 3, gridSize * 3);
    }
    isVacant(x, y) {
        if (x >= this.x && x <= this.x + 2 && y >= this.y && y <= this.y + 2) {
            return (this.bIsGood ? 1 : -1);
        } else {
            return 0;
        }
    }
}

