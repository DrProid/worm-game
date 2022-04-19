class UI {
    /*
        //parentPos (object)
            //xOff (pixels from left)
            //yOff (pixels from top)
    
        //parentDim (object)
            //width (pixels wide)
            //height (pixels tall)
    
        //anchor (object)
            //horz (which side to anchor to LEFT CENTER RIGHT)
            //vert (which side to anchor to TOP CENTER BOTTOM)
            //xOffPct (offset from anchor as percent of parent width)
            //yOffPct (offset from anchor as percent of parent height)
            //widthPct (width percent of parent)
            //heightPct (height percent of parent)
            //widthRatio (undefined if not used, multiplier of height to maintain ratio)
            //heightRatio (undefined if not used, multiplier of width to maintain ratio)
    
        //dim (object)
            //width (pixels calculated)
            //height (pixels calculated)
    
        //pos (object)
            //xOff (pixels calculated)
            //yOff (pixels calculated)
    */
    constructor(parentPos, parentDim, anchor, image) {

        this.anchor = anchor;
        this.dim = {};
        this.pos = {};
        this.calculateWindow(parentPos, parentDim);
        this.visible = false;
        this.interactable = false;
        this.image = image;
    }

    calculateWindow(parentPos, parentDim) {

        //default to top left
        this.pos.xOff = parentPos.xOff + this.anchor.xOffPct * parentDim.width;
        this.pos.yOff = parentPos.yOff + this.anchor.yOffPct * parentDim.height;
        this.dim.width = parentDim.width * this.anchor.widthPct;
        this.dim.height = parentDim.height * this.anchor.heightPct;

        //only one ratio can be used, width takes priority if both are set (don't set both)
        if (this.anchor.widthRatio != undefined) {
            this.dim.width = this.anchor.widthRatio * this.dim.height;
        } else if (this.anchor.heightRatio != undefined) {
            this.dim.height = this.anchor.heightRatio * this.dim.width;
        }

        //adjust for non-left anchors
        if (this.anchor.horz == CENTER) {
            this.pos.xOff -= this.dim.width / 2;
        } else if (this.anchor.horz == RIGHT) {
            this.pos.xOff -= this.dim.width;
        }

        //adjust for non-top anchors
        if (this.anchor.vert == CENTER) {
            this.pos.yOff -= this.dim.height / 2;
        } else if (this.anchor.vert == BOTTOM) {
            this.pos.yOff -= this.dim.height;
        }

    }
    setVisible(bIsVisible) {
        this.visible = bIsVisible;
    }
    setInteractable(bIsInteractable) {
        this.interactable = bIsInteractable;
    }
    draw() {
        if (this.visible) {
            push();
            if (bIsDebugMode) {
                rectMode(CORNER);
                rect(this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height, 5);
            }
            if (this.image) {
                imageMode(CORNER);
                image(this.image, this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height);
            }
            pop();
        }
    }

}

class UIContainer extends UI {
    constructor(parentPos, parentDim, anchor, image) {
        super(parentPos, parentDim, anchor, image);
        this.elements = {};
    }
    addTextElement(name, anchor, image, text) {
        this.elements[name] = new TextElement(this.pos, this.dim, anchor, image, text);
    }
    addButtonElement(name, anchor, image, text, callback) {
        this.elements[name] = new ButtonElement(this.pos, this.dim, anchor, image, text, callback);
    }
    addBoard(name, anchor) {
        this.elements[name] = new BoardElement(this.pos, this.dim, anchor, cols, rows);
    }
    calculateWindow(parentPos, parentDim) {
        super.calculateWindow(parentPos, parentDim);
        for (let name in this.elements) {
            this.elements[name].calculateWindow(this.pos, this.dim);
        }
    }
    setVisible(bIsVisible) {
        super.setVisible(bIsVisible);
        for (let name in this.elements) {
            this.elements[name].setVisible(bIsVisible);
        }
    }
    setInteractable(bIsInteractable) {
        super.setInteractable(bIsInteractable);
        for (let name in this.elements) {
            this.elements[name].setInteractable(bIsInteractable);
        }
    }
    draw() {
        super.draw();
        if (this.visible) {
            for (let name in this.elements) {
                this.elements[name].draw();
            }
        }
    }
    checkButtons(xPos, yPos, type) {
        let result = false;
        if (this.visible) {
            for (let name in this.elements) {
                if (this.elements[name] instanceof ButtonElement) {
                    if (this.elements[name].checkButtons(xPos, yPos, type)) {
                        result = true;
                    }
                }
            }
        }
        return result;
    }
}

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

        // let xPos = 0;
        // let yPos = 0;

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
        // this.spawnWorm(50, 20);
    }
    draw() {

        //draw board
        // let wideBorder = (this.dim.width - (this.cols * this.gridSize)) / 2;
        // let highBorder = (this.dim.height - (this.rows * this.gridSize)) / 2;

        // let imageWidth = this.cols * this.gridSize + 0.025 * width;
        // let imageWidth = (this.cols + 2.2) * this.gridSize;
        let imageWidth = this.dim.width * 1.04;
        // let imageHeight = this.rows * this.gridSize + 0.025 * height;
        // let imageHeight = (this.rows + 4.8) * this.gridSize;
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
                this.worm.move(false);
                this.worm.headOverride = undefined;
                collideData = this.checkCollision();
                if(collideData.foodChange > 0){
                    this.worm.headOverride = imageList.wormHeadGood;
                } else if(collideData.foodChange < 0){
                    this.worm.headOverride = imageList.wormHeadBad;
                }
                // console.log(collideData);
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
        if(direction == this.worm.direction){
            this.boost = lerp(this.boost, 3, 0.3);
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
        this.gridSize *= 0.85;

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
    swipeControl(mouseStart, mouseEnd) {

        // if (mouseStart.x > this.pos.xOff && mouseStart.x < this.pos.xOff + this.dim.width && mouseStart.y > this.pos.yOff && mouseStart.y < this.pos.yOff + this.dim.height && mouseEnd.x > this.pos.xOff && mouseEnd.x < this.pos.xOff + this.dim.width && mouseEnd.y > this.pos.yOff && mouseEnd.y < this.pos.yOff + this.dim.height) {

        mouseEnd.sub(mouseStart);//result vector is the direction of the swipe

        if (mouseEnd.mag() > 2) {

            push();
            angleMode(RADIANS);//just in case we aren't in radians mode
            let result = map(mouseEnd.heading(), -PI, PI, 0, 4);//convert to 4 cardinal directions
            result = round(result, 0);//round to nearest whole number
            if (bIsMobileFullscreen) {
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
        // }
    }
}

class TextElement extends UI {
    constructor(parentPos, parentDim, anchor, image, text) {
        super(parentPos, parentDim, anchor, image);
        this.text = text;
    }
    draw() {
        super.draw();
        push();
        textFont(retroFont);
        textAlign(CENTER, CENTER);//align to the center of the box
        textSize(this.dim.height);
        text(this.text, this.pos.xOff, this.pos.yOff + this.dim.height / 2, this.dim.width);
        pop();
    }
}

class ButtonElement extends TextElement {
    constructor(parentPos, parentDim, anchor, image, text, callback) {
        super(parentPos, parentDim, anchor, image, text);
        this.callback = callback;
        this.bCanClick = true;
        this.bCanHold = true;
        this.state = 0;

    }
    checkButtons(xPos, yPos, type = CLICK) {
        switch (type) {
            case CLICK:
                return this.checkClick(xPos, yPos);
                break;
            case HOLD:
                return this.checkHold(xPos, yPos);
                break;
            default:
                console.error("strange type sent to checkButtons : " + type);
                break;
        }
    }
    checkHold(xPos, yPos) {
        if (this.isOverElement(xPos, yPos)) {
            if (this.image.length >= 2) this.state = 1;
            // console.log("hold " + this.interactable);
            return this.interactable;
        } else {
            this.state = 0;
        }
    }
    checkClick(xPos, yPos) {
        if (this.isOverElement(xPos, yPos)) {
            this.state = 0;
            let active = this.interactable;//interactable may change because of callback so store it
            if (this.interactable) {
                this.callback();
            }
            return active;
        }
        return false;
    }
    isOverElement(x, y) {
        return x > this.pos.xOff && x < this.pos.xOff + this.dim.width && y > this.pos.yOff && y < this.pos.yOff + this.dim.height;
    }
    draw() {
        if (this.visible) {
            push();
            if (bIsDebugMode) {
                rectMode(CORNER);
                rect(this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height, 5);
            }
            imageMode(CORNER);

            // console.log(this.image[this.state], this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height);
            image(this.image[this.state], this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height);
            pop();
        }
    }
}

/******************************* UI CREATORS ***********************************/

function defaultAnchor() {
    //anchor (object)
    //horz (which side to anchor to LEFT CENTER RIGHT)
    //vert (which side to anchor to TOP CENTER BOTTOM)
    //xOffPct (offset from anchor as percent of parent width)
    //yOffPct (offset from anchor as percent of parent height)
    //widthPct (width percent of parent)
    //heightPct (height percent of parent)
    return { horz: LEFT, vert: TOP, xOffPct: 0, yOffPct: 0, widthPct: 0.25, heightPct: 0.25, widthRatio: undefined, heightRatio: undefined };
}

function fullScreenPos() {
    return { xOff: 0, yOff: 0 };
}

function fullScreenDim() {
    return { width: width, height: height };
}

function makeWelcomeUI(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    anchor.widthPct = 0.9;
    anchor.heightRatio = imageList.tutorial.height / imageList.tutorial.width;
    parent.addUI("tutorial", fullScreenPos(), fullScreenDim(), { ...anchor }, imageList.tutorial, false);

    anchor.widthPct = 0.1;
    anchor.heightRatio = imageList.tutorialOkClick.height / imageList.tutorialOkClick.width;
    anchor.yOffPct = 0.9;
    parent.underBoardUIElements.tutorial.addButtonElement("tutorialOk", { ...anchor }, [imageList.tutorialOkIdle, imageList.tutorialOkClick], "OK", () => {
        parent.changeState('ready');
    });

    anchor.widthPct = 0.05
    anchor.heightRatio = 1;
    anchor.horz = RIGHT;
    anchor.vert = TOP;
    anchor.xOffPct = 0.991;
    anchor.yOffPct = 0.015;
    parent.underBoardUIElements.tutorial.addButtonElement("tutorialX", { ...anchor }, [imageList.tutorialXIdle, imageList.tutorialXClick], "X", () => {
        parent.changeState('ready');
    });
}

function makePauseUI(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    anchor.widthPct = 0.3;
    anchor.heightRatio = imageList.pauseWindow.height / imageList.pauseWindow.width;
    parent.addUI("pause", fullScreenPos(), fullScreenDim(), { ...anchor }, imageList.pauseWindow);

    anchor.vert = BOTTOM;
    anchor.widthPct = 0.5;
    anchor.heightRatio = imageList.resumeIdle.height / imageList.resumeIdle.width;
    anchor.yOffPct = 0.8;
    parent.overBoardUIElements.pause.addButtonElement("unpause", { ...anchor }, [imageList.resumeIdle, imageList.resumeClick], "UNPAUSE", () => {
        parent.togglePause();
    });
}

function makeGameOver(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    anchor.widthPct = 0.3;
    anchor.heightRatio = imageList.gameOverWindow.height / imageList.gameOverWindow.width;
    parent.addUI("gameOver", fullScreenPos(), fullScreenDim(), { ...anchor }, imageList.gameOverWindow);

    anchor.heightPct = 0.2;
    anchor.widthPct = 0.8;
    anchor.yOffPct = 0.45;
    anchor.heightRatio = undefined;
    parent.overBoardUIElements.gameOver.addTextElement("score", { ...anchor }, undefined, "game.score");

    anchor.vert = BOTTOM;
    anchor.heightPct = 0.2;
    anchor.widthRatio = imageList.playAgainClick.width / imageList.playAgainClick.height;
    anchor.yOffPct = 0.9;
    parent.overBoardUIElements.gameOver.addButtonElement("playAgain", { ...anchor }, [imageList.playAgainIdle, imageList.playAgainClick], "play again", () => {
        parent.startGame();
    });
}

let bIsMobileFullscreen = false;

function makeDesktop(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 0;
    anchor.yOffPct = 0;
    anchor.horz = LEFT;
    anchor.vert = TOP;
    anchor.widthPct = 1;
    anchor.heightPct = 1;
    parent.addUI("desktop", fullScreenPos(), fullScreenDim(), anchor, imageList.bg, false);

    let btnAnchor = { ...anchor }; //shallow copy the anchor
    btnAnchor.xOffPct = 0.1;
    btnAnchor.yOffPct = 0.1;
    btnAnchor.heightPct = 0.2;
    btnAnchor.widthRatio = 1;
    parent.underBoardUIElements.desktop.addButtonElement("bucket", { ...btnAnchor }, [imageList.bucketIdle, imageList.bucketClick], "", () => {
        // console.log("bucket pressed");
        parent.changeState('tutorial');
    });


    btnAnchor.yOffPct = 0.35;
    parent.underBoardUIElements.desktop.addButtonElement("startGame", { ...btnAnchor }, [imageList.wormGameIdle, imageList.wormGameClick], "", () => {
        // console.log("start pressed");
        if (isMobile) {
            bIsMobileFullscreen = true;
            fullscreen(true);
        }
        parent.startGame();
    });

    btnAnchor.yOffPct = 0.6;
    parent.underBoardUIElements.desktop.addButtonElement("apple", { ...btnAnchor }, [imageList.appleIdle, imageList.appleClick], "", () => {
        // console.log("apple pressed"); 
        parent.makeWormFact();
    });

    // if (isMobile) {
    //     let btnAnchor = { ...anchor }; //shallow copy the anchor
    //     btnAnchor.xOffPct = 1;
    //     btnAnchor.yOffPct = 0;
    //     btnAnchor.horz = RIGHT;
    //     btnAnchor.widthPct = 0.05;
    //     btnAnchor.heightRatio = 1;
    //     parent.underBoardUIElements.desktop.addButtonElement("fullscreen", btnAnchor, [imageList.bg], "F", () => {
    //         bIsMobileFullscreen = !bIsMobileFullscreen;
    //         bSuppressPause = true;
    //         fullscreen(bIsMobileFullscreen);
    //     });
    // }

    parent.underBoardUIElements.desktop.setVisible(true);
}

function makeGameWindow(parent) {

    parent.addGameWindow(fullScreenPos(), fullScreenDim(), imageList.gameWindow, 60, 30);

    let btnAnchor = defaultAnchor();
    btnAnchor.xOffPct = 1;
    btnAnchor.yOffPct = -0.01;
    btnAnchor.horz = RIGHT;
    btnAnchor.vert = BOTTOM;
    btnAnchor.widthPct = 0.04;
    btnAnchor.heightRatio = 1;

    parent.board.addButtonElement("close", { ...btnAnchor }, [imageList.gameWindowXIdle, imageList.gameWindowXClick], "", () => {
        parent.changeState('ready');
    });

    btnAnchor.xOffPct = 0.95;
    parent.board.addButtonElement("fullscreen", { ...btnAnchor }, [imageList.gameWindowFullscreenIdle, imageList.gameWindowFullscreenClick], "", () => {
        // console.log("fullscreen clicked"); 
        if (isMobile) {
            bIsMobileFullscreen = !bIsMobileFullscreen;
            suppressPauseTimer = millis() + 100;
            fullscreen(bIsMobileFullscreen);
        } else {
            let fs = fullscreen();
            suppressPauseTimer = millis() + 100;
            fullscreen(!fs);
        }
    });

    btnAnchor.xOffPct = 0.90;
    parent.board.addButtonElement("pause", { ...btnAnchor }, [imageList.gameWindowPauseIdle, imageList.gameWindowPauseClick], "", () => {
        // console.log("pause clicked");
        parent.togglePause();
    });

}

function makeWormFact(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 1;
    anchor.yOffPct = 1;
    anchor.horz = RIGHT;
    anchor.vert = BOTTOM;
    anchor.widthPct = 0.5;
    anchor.heightRatio = imageList.facts[0].height / imageList.facts[0].width;
    parent.addUI("fact", fullScreenPos(), fullScreenDim(), { ...anchor }, random(imageList.facts));

    anchor.xOffPct = 0.977;
    anchor.yOffPct = 0.0285;
    anchor.vert = TOP;
    anchor.widthPct = 0.05;
    anchor.heightRatio = 1;
    parent.overBoardUIElements.fact.addButtonElement("factX", { ...anchor }, [imageList.factXIdle, imageList.factXClick], "X", () => {
        // console.log("close fact");
        parent.removeWormFact();
    });

}

function makeTaskBar(parent){
    let anchor = defaultAnchor();
    anchor.xOffPct = 0;
    anchor.yOffPct = 1;
    anchor.horz = LEFT;
    anchor.vert = BOTTOM;
    anchor.heightPct = 0.1;
    anchor.widthRatio = imageList.livesWindow.width / imageList.livesWindow.height;
    parent.addUI("lives", fullScreenPos(), fullScreenDim(), { ...anchor }, imageList.livesWindow, false);

    anchor.heightPct = 0.9;
    anchor.widthRatio = imageList.life.width / imageList.life.height;
    anchor.xOffPct = 1/4;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    parent.underBoardUIElements.lives.addTextElement("life1", {...anchor}, imageList.life, "");
    anchor.xOffPct = 2/4;
    parent.underBoardUIElements.lives.addTextElement("life2", {...anchor}, imageList.life, "");
    anchor.xOffPct = 3/4;
    parent.underBoardUIElements.lives.addTextElement("life3", {...anchor}, imageList.life, "");

    anchor.xOffPct = 1;
    anchor.yOffPct = 1;
    anchor.horz = RIGHT;
    anchor.vert = BOTTOM;
    anchor.heightPct = 0.1;
    anchor.widthRatio = imageList.scoreWindow.width / imageList.scoreWindow.height;
    parent.addUI("score", fullScreenPos(), fullScreenDim(), { ...anchor }, imageList.scoreWindow, false);

    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.45;
    anchor.heightPct = 0.3;
    anchor.widthRatio = undefined;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    parent.underBoardUIElements.score.addTextElement("score", {...anchor}, undefined, "score");
}