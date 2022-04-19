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
            imageMode(CORNER);
            image(this.image, this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height);
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
                    if(this.elements[name].checkButtons(xPos, yPos, type)){
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

        this.worm;
        this.timeKeeper = 0;
        this.gameTick = 500;//milliseconds between actual changes to the board (not animations)
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
    spawnWorm(xPos, yPos) {
        this.worm = new Worm(xPos, yPos);
    }
    // spawnFood() {
    //     //never directly in front of player
    // }
    startGame() {
        this.spawnWorm(floor(this.cols / 2) - 1, floor(this.rows / 2) - 1);
        // this.spawnWorm(0, 0);
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

        //draw all foods

        //draw the worm
        let animPercent = this.timeKeeper / this.gameTick;
        this.worm.draw(this.rows, this.cols, this.gridSize, this.pos.xOff, this.pos.yOff, animPercent);

    }
    update(state) {
        if (state == 'play') {
            this.timeKeeper += deltaTime;
            if (this.timeKeeper >= this.gameTick) {
                this.timeKeeper -= this.gameTick;
                this.worm.move(false);
            }
        }
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

        if (mouseStart.x > this.pos.xOff && mouseStart.x < this.pos.xOff + this.dim.width && mouseStart.y > this.pos.yOff && mouseStart.y < this.pos.yOff + this.dim.height && mouseEnd.x > this.pos.xOff && mouseEnd.x < this.pos.xOff + this.dim.width && mouseEnd.y > this.pos.yOff && mouseEnd.y < this.pos.yOff + this.dim.height) {

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
                        if (game.state == 'play') game.board.worm.changeDirection(LEFT);
                        break;
                    case 1:
                        //up
                        if (game.state == 'play') game.board.worm.changeDirection(UP);
                        break;
                    case 2:
                        //right
                        if (game.state == 'play') game.board.worm.changeDirection(RIGHT);
                        break;
                    case 3:
                        //down
                        if (game.state == 'play') game.board.worm.changeDirection(DOWN);
                        break;
                    default:
                        console.log("some wrong vector from mouse drag or touch swipe");
                        break;
                }
            }
        }
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
        textAlign(CENTER, CENTER);//align to the center of the box
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
            if (this.interactable){
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

// function makeWelcomeUI(parent) {
//     let anchor = defaultAnchor();
//     anchor.xOffPct = 0.5;
//     anchor.yOffPct = 0.5;
//     anchor.horz = CENTER;
//     anchor.vert = CENTER;
//     parent.addUI("welcome", fullScreenPos(), fullScreenDim(), anchor, imageList.bg);
//     let btnAnchor = { ...anchor }; //shallow copy the anchor
//     btnAnchor.heightRatio = 1 / 3;
//     parent.overBoardUIElements.welcome.addButtonElement("start", btnAnchor, [imageList.bg], "START", () => {
//         parent.startGame();
//     });
// }

function makePauseUI(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    anchor.heightPct = 0.3;
    anchor.widthRatio = 2.666;
    
    parent.addUI("pause", fullScreenPos(), fullScreenDim(), {...anchor}, imageList.pauseWindow);
    anchor.vert = BOTTOM;
    anchor.heightPct = 0.2;
    anchor.widthRatio = undefined;
    anchor.yOffPct = 0.8;
    parent.overBoardUIElements.pause.addButtonElement("unpause", {...anchor}, [imageList.resumeIdle, imageList.resumeClick], "UNPAUSE", () => {
        parent.togglePause();
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
    btnAnchor.heightPct = 0.1;
    btnAnchor.widthRatio = 1;
    parent.underBoardUIElements.desktop.addButtonElement("bucket", { ...btnAnchor }, [imageList.bucketIdle, imageList.bucketClick], "", () => { console.log("bucket pressed"); });

    btnAnchor.xOffPct = 0.1;
    btnAnchor.yOffPct = 0.25;
    btnAnchor.heightPct = 0.1;
    btnAnchor.widthRatio = 1;
    parent.underBoardUIElements.desktop.addButtonElement("startGame", { ...btnAnchor }, [imageList.wormGameIdle, imageList.wormGameClick], "", () => {
        // console.log("start pressed");
        if(isMobile){
            bIsMobileFullscreen = true;
            fullscreen(true);
        }
        parent.startGame();
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
        console.log("close clicked");
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