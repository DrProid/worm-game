let game;
//LEFT and RIGHT already exist as string constants (for aligning) so I used those
//but I had to make UP and DOWN myself
const UP = 'up';
const DOWN = 'down';

var divWidth = document.getElementById('worm-game').offsetWidth;
var divHeight = document.getElementById('worm-game').offsetHeight;

function setup() {
  var cnv = createCanvas(divWidth, divHeight);
  cnv.parent("worm-game");
  game = new GameManager();

}

function draw() {
  background(220);

  game.update();
  game.draw();

}

function windowResized(){
  divWidth = document.getElementById('worm-game').offsetWidth;
  divHeight = document.getElementById('worm-game').offsetHeight;
  resizeCanvas(divWidth, divHeight);
  game.calculateBoardWindow(width, height);
}

//controls input
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      if(game.board.worm.direction != RIGHT) game.board.worm.direction = LEFT;
      break;
    case RIGHT_ARROW:
      if(game.board.worm.direction != LEFT) game.board.worm.direction = RIGHT;
      break;
    case UP_ARROW:
      if(game.board.worm.direction != DOWN) game.board.worm.direction = UP;
      break;
    case DOWN_ARROW:
      if(game.board.worm.direction != UP) game.board.worm.direction = DOWN;
      break;
    default:
      console.log("Some other key pressed. keycode = " + keyCode);
      break;
  }
}

class Worm {
  
  constructor(x, y) {
   
    //worm section positions
    this.wormBody = {};
    this.wormBody.head = {x: x, y: y};
    this.wormBody.body = [];
    let startLength = 3;
    for(let i = 1; i < startLength-1 ; i++){
      this.wormBody.body.push({x: x+i, y: y});
    }
    this.wormBody.tail = {x: x+startLength-1, y: y};
    
    //control movement
    this.direction = LEFT;
    
    //worm look
    // this.size = 50;
  }
  
  //draws the worm
  draw(rows, cols, gridSize, xBorder, yBorder) {
    
    //draw tail
    fill('red');
    let xPos = map(this.wormBody.tail.x, 0, rows, xBorder, width - xBorder);
    let yPos = map(this.wormBody.tail.y, 0, cols, yBorder, height - yBorder);
    ellipse(xPos+ gridSize/2, yPos + gridSize/2, gridSize);
    
    fill('blue');
    //draw body segments
    for(let i = this.wormBody.body.length-1; i >= 0; i--){
      xPos = map(this.wormBody.body[i].x, 0, rows, xBorder, width - xBorder);
      yPos = map(this.wormBody.body[i].y, 0, cols, yBorder, height - yBorder);
      ellipse(xPos+ gridSize/2, yPos+ gridSize/2, gridSize);
    }
    
    fill('green');
    //draw head
    xPos = map(this.wormBody.head.x, 0, rows, xBorder, width - xBorder);
    yPos = map(this.wormBody.head.y, 0, cols, yBorder, height - yBorder);
    ellipse(xPos + gridSize/2, yPos+ gridSize/2, gridSize);
    
  }
  
  //moves worm position (on grid)
  move(bAddSegement) {
    //add the current head to the body
    this.wormBody.body.push({...this.wormBody.head});
    //move the head
    switch (this.direction) {
      case LEFT:
        this.wormBody.head.x--;
        break;
      case RIGHT:
        this.wormBody.head.x++;
        break;
      case UP:
        this.wormBody.head.y--;
        break;
      case DOWN:
        this.wormBody.head.y++;
        break;
      default:
        console.error("worm direction = " + this.direction)
        break;
    }
    //if we aren't adding a segment then move the last body part into the tail
    if(!bAddSegement){
      this.wormBody.tail = this.wormBody.body.shift();
    }
  }

}

class Food {
  //timer
  //good/bad

}

class BoardManager {
  constructor() {
    this.worm;
  }
  spawnWorm() {
    this.worm = new Worm(7, 7);
  }
  draw(rows, cols, gridSize) {
    //draw board
    let wideBorder = (width-(cols*gridSize))/2;
    let highBorder = (height-(rows*gridSize))/2;
    //debug lines
    for(let i = 0; i <= cols; i++){
      let xPos =  map(i, 0, cols, wideBorder, width-wideBorder);
      line(xPos, highBorder, xPos, height-highBorder);
    }
    for(let i = 0; i <= rows; i++){
      let yPos =  map(i, 0, rows, highBorder, height-highBorder);
      line(wideBorder, yPos, width-wideBorder, yPos);
    }
    //debug squares
    fill('red');
    rect(wideBorder, highBorder, gridSize);
    fill('yellow');
    // rectMode(CENTER);
    rect( width-wideBorder-gridSize, height-highBorder-gridSize, gridSize);

    //draw all foods

    this.worm.draw(rows, cols, gridSize, wideBorder, highBorder);
  }
  update(){
    if(this.worm != undefined && frameCount%30==0){
      this.worm.move(false);
    }
  }
}

class GameManager {
  // let bCanStore = false;
  //manage game loop
  //keep score
  //spawn foods (never directly in front of player)
  constructor() {
    this.rows = 30;
    this.cols = 60;
    this.board = new BoardManager();
    // if (storageAvailable("localStorage")) {
    //   bCanStore = true;
    //   checkStorage();
    // }
    this.calculateBoardWindow(width, height);
    this.startGame();
  }

  startGame() {
    this.board.spawnWorm();
  }

  draw() {
    this.board.draw(this.rows, this.cols, this.gridSize);
  }

  calculateBoardWindow(wide, tall){
    let boardRatio = this.cols/this.rows;
    let windowRatio = wide/tall;
    if(boardRatio < windowRatio){
      this.gridSize = tall/this.rows;
    } else {
      this.gridSize = wide/this.cols;
    }
  }

  update() {
    this.board.update();
  }

}


class Button {
  //size
  //position
  //callback
  //image
}