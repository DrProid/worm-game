let game;
//LEFT and RIGHT already exist as string constants (for aligning) so I used those
//but I had to make UP and DOWN myself
const UP = 'up';
const DOWN = 'down';

let mouseDown;
let bIsDebugMode = false;

var divWidth = document.getElementById('worm-game').offsetWidth;
var divHeight = document.getElementById('worm-game').offsetHeight;

function setup() {
  var cnv = createCanvas(divWidth, divHeight);
  cnv.parent("worm-game");
  game = new StateManager();
}

function draw() {
  background(220);

  game.update();
  game.draw();

  if(bIsDebugMode){
    push();
    fill('black');
    text(nfs(frameRate(), 3, 1), 100, 100);
    pop();
  }

}

function windowResized() {
  divWidth = document.getElementById('worm-game').offsetWidth;
  divHeight = document.getElementById('worm-game').offsetHeight;
  if (game.state == 'play') {
    game.togglePause('pause');
  }
  resizeCanvas(divWidth, divHeight);
  game.board.calculateBoardWindow(width, height);
}

//controls input
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      if (game.state == 'play') game.board.worm.changeDirection(LEFT);
      break;
    case RIGHT_ARROW:
      if (game.state == 'play') game.board.worm.changeDirection(RIGHT);
      break;
    case UP_ARROW:
      if (game.state == 'play') game.board.worm.changeDirection(UP);
      break;
    case DOWN_ARROW:
      if (game.state == 'play') game.board.worm.changeDirection(DOWN);
      break;
    case ENTER:
      if (game.state == 'ready') {
        game.startGame();
      } else if (game.state == 'play' || game.state == 'pause') {
        game.togglePause();
      }
      break;
    default:
      console.log("Some other key pressed. keycode = " + keyCode);
      break;
  }
}

function mouseClicked() {
  switch (game.state) {
    case 'ready':
      game.startGame();
      break;
    case 'pause':
      game.togglePause();
      break;
    default:
      break;
  }
}

function mousePressed() {
  mouseDown = createVector(mouseX, mouseY);//store the position of the mouse when it is pressed
}

function mouseReleased() {
  if (mouseDown != undefined) {
    let mouseVec = createVector(mouseX, mouseY);//get current mouse or touch location
    mouseVec.sub(mouseDown);//result vector is the direction of the swipe
    mouseDown = undefined;//clear mouseDown because I don't want strange edge cases where mouseReleased is called twice (trust issues)

    push();
    angleMode(RADIANS);//just in case we aren't in radians mode
    let result = map(mouseVec.heading(), -PI, PI, 0, 4);//convert to 4 cardinal directions
    result = round(result, 0);//round to nearest whole number
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