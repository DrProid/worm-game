/*
The BoardElement class.
Responsibilities:
    -spawns board items (worm/food)
    -draws all board items (worm/food)
    -draws the board
    -checks for collision between worm and wall or food
*/

class BoardElement {
    constructor(parentPos, parentDim, image, cols, rows) {
        this.pos = {};
        this.dim = {};
        this.image = image;
        this.cols = cols;
        this.rows = rows;
        this.calculateWindow(parentPos, parentDim);

        this.visible = true;
        this.interactable = true;

        this.elements = {};

        this.foods = [];
        this.maxFood = 5;
        this.goodFoodChance = 1;
        this.worm;
        this.timeKeeper = 0;
        this.boost = 1;
        this.maxBoost = 3;
        this.gameTick = 250;//milliseconds between actual changes to the board (not animations)
        this.levelUp = false;

    }
    setVisible(bIsVisible) {
        this.visible = bIsVisible;
        for (let name in this.elements) {
            this.elements[name].setVisible(bIsVisible);
        }
    }
    setInteractable(bIsInteractable) {
        this.interactable = bIsInteractable;
        for (let name in this.elements) {
            this.elements[name].setInteractable(bIsInteractable);
        }
    }
    addButtonElement(name, anchor, image, text, callback) {
        this.elements[name] = new ButtonElement(this.pos, this.dim, anchor, image, text, callback);
    }
    addTextElement(name, anchor, image, text) {
        this.elements[name] = new TextElement(this.pos, this.dim, anchor, image, text);
    }
    spawnWorm(xPos, yPos) {
        this.worm = new Worm(xPos, yPos);
    }
    spawnFood() {
        let xPos = floor(random(this.cols - 2));
        let yPos = floor(random(this.rows - 2));

        let bIsVacant = true;
        //never on top of other food
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if (this.isVacant(xPos + x, yPos + y, false) != 0) {
                    bIsVacant = false;
                }
            }
        }

        //never near the player
        if (dist(xPos, yPos, this.worm.wormBody[0].x, this.worm.wormBody[0].y) < 7) {
            bIsVacant = false;
        }

        if (bIsVacant) {
            //go ahead and place some food
            if (random() < this.goodFoodChance) {
                this.foods.push(new Food(xPos, yPos, random(imageList.good), true));
            } else {
                this.foods.push(new Food(xPos, yPos, random(imageList.bad), false));
            }
        }
    }
    isVacant(x, y, bRemove = true) {
        for (let i in this.foods) {
            let score = this.foods[i].isVacant(x, y);
            if (score != 0) {
                if (bRemove) {
                    this.foods.splice(i, 1);
                }
                return score;//leave early
            }
        }
        return 0;//no food items hit
    }
    startGame() {
        this.spawnWorm(floor(this.cols / 2) - 1, floor(this.rows / 2) - 1);
        this.boost = 1;
        this.maxBoost = 3;
        this.maxFood = 5;
        this.goodFoodChance = 1;
        this.timeKeeper = 0;
        this.gameTick = 250;
    }
    draw() {

        //draw board
        let imageWidth = this.dim.width * 1.04;
        let imageHeight = this.dim.height * 1.15;
        let imageX = (this.dim.width - imageWidth) / 2;
        let imageY = (this.dim.height - imageHeight) / 2 - this.gridSize;

        //draw window
        image(this.image, this.pos.xOff + imageX, this.pos.yOff + imageY, imageWidth, imageHeight);

        if (this.visible) {
            for (let name in this.elements) {
                this.elements[name].draw();
            }
        }

        if (bIsDebugMode) {
            push();
            //debug lines
            for (let i = 0; i <= this.cols; i++) {
                let xPos = map(i, 0, this.cols, this.pos.xOff, this.dim.width + this.pos.xOff);
                line(xPos, this.pos.yOff, xPos, this.dim.height + this.pos.yOff);
            }
            for (let i = 0; i <= this.rows; i++) {
                let yPos = map(i, 0, this.rows, this.pos.yOff, this.dim.height + this.pos.yOff);
                line(this.pos.xOff, yPos, this.dim.width + this.pos.xOff, yPos);
            }
            //debug squares
            fill('red');
            rect(this.pos.xOff, this.pos.yOff, this.gridSize);
            fill('yellow');
            rect(width - this.pos.xOff - this.gridSize, height - this.pos.yOff - this.gridSize, this.gridSize);
            pop();
        }

        //draw the worm
        let animPercent = this.timeKeeper / this.gameTick;
        this.worm.draw(this.rows, this.cols, this.gridSize, this.pos.xOff, this.pos.yOff, animPercent);

        //draw all foods
        for (let food of this.foods) {
            food.draw(this.pos.xOff, this.pos.yOff, this.gridSize, this.cols, this.rows);
        }

    }
    update(state) {
        let collideData = { foodChange: 0, scoreChange: 0 };
        if (state == 'play') {
            this.timeKeeper += deltaTime * this.boost;

            //delete stale foods
            for (let i in this.foods) {
                this.foods[i].timer -= deltaTime;
                if (this.foods[i].timer < 0) {
                    this.foods.splice(i, 1);
                    i--;
                }
            }

            //check for worm movement
            if (this.timeKeeper >= this.gameTick) {
                this.timeKeeper -= this.gameTick;
                this.worm.move(this.levelUp);
                this.levelUp = false;
                this.worm.headOverride = undefined;
                collideData = this.checkCollision();
                if (collideData.foodChange > 0) {
                    this.worm.headOverride = imageList.wormHeadGood;
                } else if (collideData.foodChange < 0) {
                    this.worm.headOverride = imageList.wormHeadBad;
                }
            } else {
                if (this.foods.length < this.maxFood && random() < 0.05) {
                    this.spawnFood();
                }
            }
        }
        //return data for score tracking
        return collideData;
    }
    checkCollision() {
        let food = 0;
        let score = 0;

        let next = this.nextPos();

        if (this.checkWall(next)) {
            score -= 1;
        }

        //check food collision
        food += this.isVacant(next.x, next.y);

        return { foodChange: food, scoreChange: score };

    }
    nextPos() {
        let head = this.worm.wormBody[0];
        let direction = this.worm.direction;
        let next = { ...head };

        switch (direction) {
            case RIGHT:
                next.x += 1;
                break;
            case LEFT:
                next.x -= 1;
                break;
            case UP:
                next.y -= 1;
                break;
            case DOWN:
                next.y += 1;
                break;
        }
        return next;
    }
    checkWall(pos, change = true) {
        //check wall collision
        let bHitWall = false;
        if (pos.x > this.cols - 1 || pos.x < 0) {
            bHitWall = true;
            if (pos.y > this.rows / 2) {
                if (change) this.changeDirection(UP);
            } else {
                if (change) this.changeDirection(DOWN);
            }
        } else if (pos.y > this.rows - 1 || pos.y < 0) {
            bHitWall = true;
            if (pos.x > this.cols / 2) {
                if (change) this.changeDirection(LEFT);
            } else {
                if (change) this.changeDirection(RIGHT);
            }
        }
        return bHitWall;
    }
    changeDirection(direction) {
        if (direction == this.worm.direction) {
            this.boost = lerp(this.boost, this.maxBoost, 0.3);
        } else {
            this.boost = 1;
        }
        this.worm.changeDirection(direction, this.rows, this.cols);
    }
    calculateWindow(parentPos, parentDim) {

        let boardRatio = this.cols / this.rows;
        let windowRatio = parentDim.width / parentDim.height;

        if (boardRatio < windowRatio) {
            this.gridSize = parentDim.height / this.rows;
        } else {
            this.gridSize = parentDim.width / this.cols;
        }
        this.gridSize *= 0.8;

        this.dim.width = this.cols * this.gridSize;
        this.dim.height = this.rows * this.gridSize;

        this.pos.xOff = (parentDim.width - this.dim.width) / 2;
        this.pos.yOff = (parentDim.height - this.dim.height) / 2;


        for (let name in this.elements) {
            this.elements[name].calculateWindow(this.pos, this.dim);
        }
    }
    checkButtons(xPos, yPos, type) {
        if (this.visible) {
            for (let name in this.elements) {
                if (this.elements[name] instanceof ButtonElement) {
                    this.elements[name].checkButtons(xPos, yPos, type);
                }
            }
        }
    }
    normalButtons(){
        for (let name in this.elements) {
            if (this.elements[name] instanceof ButtonElement) {
                this.elements[name].state = 0;
            }
        }
    }
    swipeControl(mouseStart, mouseEnd) {

        mouseEnd.sub(mouseStart);//result vector is the direction of the swipe

        if (mouseEnd.mag() > 2) {

            push();
            angleMode(RADIANS);//just in case we aren't in radians mode
            let result = map(mouseEnd.heading(), -PI, PI, 0, 4);//convert to 4 cardinal directions
            result = round(result, 0);//round to nearest whole number
            if (bIsMobileFullscreen && divHeight > divWidth) {
                result += 3;
            }
            result %= 4; //4 and 0 are the same direction
            pop();

            switch (result) {
                case 0:
                    //left
                    if (game.state == 'play') this.changeDirection(LEFT);
                    break;
                case 1:
                    //up
                    if (game.state == 'play') this.changeDirection(UP);
                    break;
                case 2:
                    //right
                    if (game.state == 'play') this.changeDirection(RIGHT);
                    break;
                case 3:
                    //down
                    if (game.state == 'play') this.changeDirection(DOWN);
                    break;
                default:
                    console.log("some wrong vector from mouse drag or touch swipe");
                    break;
            }
        }
    }
}

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

            let bIsHead = false;
            if (i == 1) {
                bIsHead = true;
                if (this.headOverride) {
                    img = this.headOverride;
                } else if (animPercent > 0.5) {
                    img = imageList.wormHeadOpen;
                } else {
                    img = imageList.wormHeadIdle;
                }
            }

            for (let s = numSubSegments - 1; s >= (bIsHead ? numSubSegments - 1 : 0); s--) {
                let subSegIndex = s + (i - 1) * numSubSegments;
                let subSegPct = (subSegIndex + 1) / totalSubSegments;

                let extendAnim = 2;
                let alpha = lerp(-1, extendAnim, 1 - animPercent);
                let rateOfChange = 3;
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
                nextSeg = { x: headX - 1, y: headY, direction: this.direction };
                break;
            case RIGHT:
                nextSeg = { x: headX + 1, y: headY, direction: this.direction };
                break;
            case UP:
                nextSeg = { x: headX, y: headY - 1, direction: this.direction };
                break;
            case DOWN:
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

        switch (direction) {
            case LEFT:
                if (pos.x > 0 && lastDirection != RIGHT) {
                    this.direction = direction;
                    turnSound();
                }
                break;
            case RIGHT:
                if (pos.x < (cols - 1) && lastDirection != LEFT) {
                    this.direction = direction;
                    turnSound();
                }
                break;
            case UP:
                if (pos.y > 0 && lastDirection != DOWN) {
                    this.direction = direction;
                    turnSound();
                }
                break;
            case DOWN:
                if (pos.y < (rows - 1) && lastDirection != UP) {
                    this.direction = direction;
                    turnSound();
                }
                break;
            default:
                console.error("Worm recieved something that isnt a direction : " + direction);
                break;
        }
    }

}

class Food {
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
            return (this.bIsGood ? 1 + round(map(this.timer, 0, 20000, 0, 1, true), 2) : -1);
        } else {
            return 0;
        }
    }
}

