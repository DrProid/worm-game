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
    addBoxElement(name, anchor, colour) {
        this.elements[name] = new BoxElement(this.pos, this.dim, anchor, colour);
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
        if (!this.image && this.visible) {
            push();
            noStroke();
            let edgeWidth = this.dim.width * 0.01;
            fill('#F4EF97');
            beginShape();
            vertex(this.pos.xOff + edgeWidth, this.pos.yOff + edgeWidth);
            vertex(this.pos.xOff, this.pos.yOff);
            vertex(this.pos.xOff + this.dim.width, this.pos.yOff);
            vertex(this.pos.xOff + this.dim.width, this.pos.yOff + this.dim.height);
            vertex(this.pos.xOff + this.dim.width - edgeWidth, this.pos.yOff + this.dim.height - edgeWidth);
            endShape();

            fill('#07004B');
            beginShape();
            vertex(this.pos.xOff + edgeWidth, this.pos.yOff + edgeWidth);
            vertex(this.pos.xOff, this.pos.yOff);
            vertex(this.pos.xOff, this.pos.yOff + this.dim.height);
            vertex(this.pos.xOff + this.dim.width, this.pos.yOff + this.dim.height);
            vertex(this.pos.xOff + this.dim.width - edgeWidth, this.pos.yOff + this.dim.height - edgeWidth);
            endShape();

            fill('grey');
            rect(this.pos.xOff + edgeWidth, this.pos.yOff + edgeWidth, this.dim.width - edgeWidth * 2, this.dim.height - edgeWidth * 2);

            pop();
        }
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

class TextElement extends UI {
    constructor(parentPos, parentDim, anchor, image, text) {
        super(parentPos, parentDim, anchor, image);
        this.text = text;
    }
    draw() {
        super.draw();
        push();
        let bbox = retroFont.textBounds(this.text, 0, 0, this.dim.height);
        textFont(retroFont);
        textAlign(CENTER, CENTER);//align to the center of the box
        textSize(this.dim.height);
        text(this.text, this.pos.xOff - bbox.w, this.pos.yOff + this.dim.height / 2, bbox.w * 2);
        pop();
    }
}

class BoxElement extends UI {
    constructor(parentPos, parentDim, anchor, colour) {
        super(parentPos, parentDim, anchor);
        this.colour = colour;
    }
    draw() {
        super.draw();
        push();
        colorMode(HSB, 255);
        let col = color(hue(this.colour), 200, brightness(this.colour)*0.8);
        
        noStroke();
        let edgeWidth = this.dim.width * 0.01;
        fill(col);
        beginShape();
        vertex(this.pos.xOff + edgeWidth, this.pos.yOff + edgeWidth);
        vertex(this.pos.xOff, this.pos.yOff);
        vertex(this.pos.xOff + this.dim.width, this.pos.yOff);
        vertex(this.pos.xOff + this.dim.width, this.pos.yOff + this.dim.height);
        vertex(this.pos.xOff + this.dim.width - edgeWidth, this.pos.yOff + this.dim.height - edgeWidth);
        endShape();
        
        col = color(hue(this.colour), 200, brightness(this.colour) * 0.5);
        fill(col);
        beginShape();
        vertex(this.pos.xOff + edgeWidth, this.pos.yOff + edgeWidth);
        vertex(this.pos.xOff, this.pos.yOff);
        vertex(this.pos.xOff, this.pos.yOff + this.dim.height);
        vertex(this.pos.xOff + this.dim.width, this.pos.yOff + this.dim.height);
        vertex(this.pos.xOff + this.dim.width - edgeWidth, this.pos.yOff + this.dim.height - edgeWidth);
        endShape();

        fill(this.colour);
        rect(this.pos.xOff + edgeWidth, this.pos.yOff + edgeWidth, this.dim.width - edgeWidth * 2, this.dim.height - edgeWidth * 2);

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
        // parent.changeState('ready');
        boopSound();
        parent.startGame();
    });

    anchor.widthPct = 0.05
    anchor.heightRatio = 1;
    anchor.horz = RIGHT;
    anchor.vert = TOP;
    anchor.xOffPct = 0.991;
    anchor.yOffPct = 0.015;
    parent.underBoardUIElements.tutorial.addButtonElement("tutorialX", { ...anchor }, [imageList.tutorialXIdle, imageList.tutorialXClick], "X", () => {
        parent.changeState('ready');
        boopSound();
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
        boopSound();
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
        boopSound();
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
        parent.changeState('scraps');
        boopSound();
        // parent.changeState('tutorial');
    });


    btnAnchor.yOffPct = 0.35;
    parent.underBoardUIElements.desktop.addButtonElement("startGame", { ...btnAnchor }, [imageList.wormGameIdle, imageList.wormGameClick], "", () => {
        // console.log("start pressed");
        if (isMobile) {
            bIsMobileFullscreen = true;
            fullscreen(true);
        }
        // parent.startGame();
        parent.changeState('tutorial');
        boopSound();
    });

    btnAnchor.yOffPct = 0.6;
    parent.underBoardUIElements.desktop.addButtonElement("apple", { ...btnAnchor }, [imageList.appleIdle, imageList.appleClick], "", () => {
        // console.log("apple pressed"); 
        parent.makeWormFact();
        boopSound();
    });

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
        boopSound();
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
        boopSound();
    });

    btnAnchor.xOffPct = 0.90;
    parent.board.addButtonElement("pause", { ...btnAnchor }, [imageList.gameWindowPauseIdle, imageList.gameWindowPauseClick], "", () => {
        // console.log("pause clicked");
        parent.togglePause();
        boopSound();
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
        boopSound();
    });

}

function makeTaskBar(parent) {
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
    anchor.xOffPct = 1 / 4;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    parent.underBoardUIElements.lives.addTextElement("life1", { ...anchor }, imageList.life, "");
    anchor.xOffPct = 2 / 4;
    parent.underBoardUIElements.lives.addTextElement("life2", { ...anchor }, imageList.life, "");
    anchor.xOffPct = 3 / 4;
    parent.underBoardUIElements.lives.addTextElement("life3", { ...anchor }, imageList.life, "");

    anchor.xOffPct = 1;
    anchor.yOffPct = 1;
    anchor.horz = RIGHT;
    anchor.vert = BOTTOM;
    anchor.heightPct = 0.1;
    anchor.widthRatio = imageList.scoreWindow.width / imageList.scoreWindow.height;
    parent.addUI("score", fullScreenPos(), fullScreenDim(), { ...anchor }, imageList.scoreWindow, false);

    anchor.xOffPct = 0.625;
    anchor.yOffPct = 0.5;
    anchor.heightPct = 0.3;
    anchor.widthRatio = undefined;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    parent.underBoardUIElements.score.addTextElement("score", { ...anchor }, undefined, "score");
}

function makeScraps(parent) {
    let anchor = defaultAnchor();
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.5;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    anchor.heightPct = 0.9;
    anchor.widthRatio = 0.5;
    // anchor.heightRatio = imageList.facts[0].height / imageList.facts[0].width;
    parent.addUI("scraps", fullScreenPos(), fullScreenDim(), { ...anchor }, undefined, false);

    anchor.xOffPct = 0.98;
    anchor.yOffPct = 0.01;
    anchor.vert = TOP;
    anchor.horz = RIGHT;
    anchor.widthPct = 0.05;
    anchor.heightRatio = 1;
    anchor.widthRatio = undefined;
    parent.underBoardUIElements.scraps.addButtonElement("scrapsX", { ...anchor }, [imageList.factXIdle, imageList.factXClick], "X", () => {
        // console.log("close fact");
        // parent.removeWormFact();
        boopSound();
        parent.changeState('ready');
    });

    anchor.widthRatio = undefined;
    anchor.heightRatio = undefined;
    anchor.horz = CENTER;
    anchor.vert = CENTER;
    anchor.xOffPct = 0.525;
    anchor.heightPct = 0.03;
    anchor.yOffPct = 0.125;
    parent.underBoardUIElements.scraps.addTextElement("goodTitle", { ...anchor }, undefined, "Good Foods for Worms");
    anchor.yOffPct = 0.425;
    parent.underBoardUIElements.scraps.addTextElement("badTitle", { ...anchor }, undefined, "Bad Foods for Worms");
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.25;
    anchor.widthPct = 0.9;
    anchor.heightPct = 0.2;
    parent.underBoardUIElements.scraps.addBoxElement("goodBox", { ...anchor }, color('#4ef451'));
    anchor.yOffPct = 0.55;
    parent.underBoardUIElements.scraps.addBoxElement("badBox", { ...anchor }, color('#bc5640'));
    
    anchor.widthPct = 0.001;
    anchor.heightPct = 0.02;
    anchor.xOffPct = 0.5;
    anchor.yOffPct = 0.7;
    parent.underBoardUIElements.scraps.addTextElement("Inge", { ...anchor }, undefined, "Art - Inge Berman");
    anchor.yOffPct = 0.75;
    parent.underBoardUIElements.scraps.addTextElement("Joel", { ...anchor }, undefined, "Code - Joel Flanagan");
    anchor.yOffPct = 0.8;
    parent.underBoardUIElements.scraps.addTextElement("Leo", { ...anchor }, undefined, "Audio - Leo Sunshine");
    anchor.heightPct = 0.03;
    anchor.yOffPct = 0.9;
    parent.underBoardUIElements.scraps.addTextElement("credits", { ...anchor }, undefined, "Thanks for playing!");

    anchor.heightPct = 0.1;
    anchor.widthRatio = 1.5;
    anchor.yOffPct = 0.95;
    parent.underBoardUIElements.scraps.addTextElement("love", { ...anchor }, imageList.life, "");


    anchor.heightPct = 0.05;
    anchor.widthRatio = 1;
    for (let i in imageList.good) {
        let row = floor(i / 5);
        anchor.yOffPct = row*0.1 + 0.2;

        anchor.xOffPct = map(i%5, 0, 4, 0.2, 0.8);
        parent.underBoardUIElements.scraps.addTextElement("good" + i, { ...anchor }, imageList.good[i], "");
    }

    for (let i in imageList.bad) {
        let row = floor(i / 4);
        anchor.yOffPct = row*0.1 + 0.5;
        anchor.xOffPct = map(i%4, 0, 3, 0.2, 0.8);
        parent.underBoardUIElements.scraps.addTextElement("bad" + i, { ...anchor }, imageList.bad[i], "");
    }
}