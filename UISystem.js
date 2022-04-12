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
    
        //dim (object)
            //width (pixels calculated)
            //height (pixels calculated)
    
        //pos (object)
            //xOff (pixels calculated)
            //yOff (pixels calculated)
    */
    constructor(parentPos, parentDim, anchor) {

        this.anchor = anchor;
        this.dim = {};
        this.pos = {};
        this.calculateWindow(parentPos, parentDim);
        this.visible = false;
    }

    calculateWindow(parentPos, parentDim) {

        //default to top left
        this.pos.xOff = parentPos.xOff + this.anchor.xOffPct * parentDim.width;
        this.pos.yOff = parentPos.yOff + this.anchor.yOffPct * parentDim.height;
        this.dim.width = parentDim.width * this.anchor.widthPct;
        this.dim.height = parentDim.height * this.anchor.heightPct;

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
    setVisible(bIsVisible){
        this.visible = bIsVisible;
    }
    draw() {
        if (this.visible) {
            push();
            rectMode(CORNER);
            rect(this.pos.xOff, this.pos.yOff, this.dim.width, this.dim.height);
            pop();
        }
    }

}

class UIContainer extends UI {
    constructor(parentPos, parentDim, anchor) {
        super(parentPos, parentDim, anchor);
        this.elements = {};
    }
    addTextElement(name, anchor, text) {
        this.elements[name] = new TextElement(this.pos, this.dim, anchor, text);
    }
    addButtonElement(name, anchor, text, callback) {
        this.elements[name] = new ButtonElement(this.pos, this.dim, anchor, text, callback);
    }
    calculateWindow(parentPos, parentDim) {
        super.calculateWindow(parentPos, parentDim);
        for (let name in this.elements) {
            this.elements[name].calculateWindow(this.pos, this.dim);
        }
    }
    setVisible(bIsVisible){
        super.setVisible(bIsVisible);
        for (let name in this.elements) {
            this.elements[name].setVisible(bIsVisible);
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
        if (this.visible) {
            for (let name in this.elements) {
                if (this.elements[name] instanceof ButtonElement) {
                    this.elements[name].checkButtons(xPos, yPos, type);
                }
            }
        }
    }
}

class TextElement extends UI {
    constructor(parentPos, parentDim, anchor, text) {
        super(parentPos, parentDim, anchor);
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
    constructor(parentPos, parentDim, anchor, text, callback) {
        super(parentPos, parentDim, anchor, text);
        this.callback = callback;
        this.bCanClick = true;
        this.bCanHold = false;
    }
    checkButtons(xPos, yPos, type) {
        switch (type) {
            case CLICK:
                this.checkClick(xPos, yPos);
                break;
            case HOLD:
                this.checkHold(xPos, yPos);
                break;
            default:
                console.error("strange type sent to checkButtons : " + type);
                break;
        }
    }
    checkHold(xPos, yPos) {
        if (this.bCanHold && this.isOverElement(xPos, yPos)) {
            this.callback();
        }
    }
    checkClick(xPos, yPos) {
        if (this.bCanClick && this.isOverElement(xPos, yPos)) {
            this.callback();
        }
    }
    isOverElement(x, y) {
        return x > this.pos.xOff && x < this.pos.xOff + this.dim.width && y > this.pos.yOff && y < this.pos.yOff + this.dim.height;
    }
}

function defaultAnchor() {
    //anchor (object)
    //horz (which side to anchor to LEFT CENTER RIGHT)
    //vert (which side to anchor to TOP CENTER BOTTOM)
    //xOffPct (offset from anchor as percent of parent width)
    //yOffPct (offset from anchor as percent of parent height)
    //widthPct (width percent of parent)
    //heightPct (height percent of parent)
    return { horz: LEFT, vert: TOP, xOffPct: 0, yOffPct: 0, widthPct: 0.25, heightPct: 0.25 };
}