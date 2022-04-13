let game;
//LEFT and RIGHT already exist as string constants (for aligning) so I used those
//but I had to make UP and DOWN myself
const UP = 'up';
const DOWN = 'down';

const CLICK = "click";
const HOLD = "hold";

let mouseDown;
let bIsDebugMode = true;
let version = "v0.17";

let bSuppressPause = false;

var divWidth = document.getElementById('worm-game').offsetWidth;
var divHeight = document.getElementById('worm-game').offsetHeight;

let cnv;//canvas context

function setup() {
  isMobile = true;
  // if (isMobile && divHeight > divWidth) {
  //   cnv = createCanvas(divHeight, divWidth);
  //   cnv.elt.style.left = "50%";
  //   cnv.elt.style.top = "50%";
  //   cnv.elt.style.transform = 'translate(-50%,-50%) rotate(90deg)';
  // } else {
  cnv = createCanvas(divWidth, divHeight);
  cnv.elt.style.left = "50%";
  cnv.elt.style.top = "50%";
  cnv.elt.style.transform = 'translate(-50%,-50%)';
  // }
  cnv.parent("worm-game");
  game = new StateManager();

  makeDesktop();

  makeWelcomeUI();
  makePauseUI();

  game.changeState('ready');

}

function draw() {
  background(220);

  game.update();
  game.draw();


  if (bIsDebugMode) {
    push();
    fill('black');
    text(version, 20, 20)
    text(width, 60, 60);
    text(height, 160, 60);
    text(windowWidth, 60, 80);
    text(windowHeight, 160, 80);
    text(displayWidth, 60, 100);
    text(displayHeight, 160, 100);
    text(nfs(frameRate(), 3, 1), 100, 20);
    pop();
  }

}

function windowResized() {
  divWidth = document.getElementById('worm-game').offsetWidth;
  divHeight = document.getElementById('worm-game').offsetHeight;
  if (game.state == 'play') {
    if (bSuppressPause) {
      bSuppressPause = false;
    } else {
      game.togglePause('pause');
    }
  }
  if (bIsMobileFullscreen) {
    resizeCanvas(divHeight, divWidth);
    cnv.elt.style.transform = 'translate(-50%,-50%) rotate(90deg)';
  } else {
    resizeCanvas(divWidth, divHeight);
    cnv.elt.style.transform = 'translate(-50%,-50%)';
  }
  game.handleResize(width, height);

}

/******************************* CONTROLS INPUT ***********************************/

function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
    case 65: //A
      if (game.state == 'play') game.board.worm.changeDirection(LEFT);
      break;
    case RIGHT_ARROW:
    case 68: //D
      if (game.state == 'play') game.board.worm.changeDirection(RIGHT);
      break;
    case UP_ARROW:
    case 87: //W
      if (game.state == 'play') game.board.worm.changeDirection(UP);
      break;
    case DOWN_ARROW:
    case 83: //S
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

// function mouseClicked() {
//   switch (game.state) {
//     case 'ready':
//       game.startGame();
//       break;
//     case 'pause':
//       game.togglePause();
//       break;
//     default:
//       break;
//   }
// }

function touchStarted() {
  swipeControlStart();
}

function mousePressed() {
  swipeControlStart();
}

function touchEnded() {
  swipeControlEnd();
}

function mouseReleased() {
  swipeControlEnd();
}

function swipeControlStart() {
  mouseDown = createVector(mouseX, mouseY);//store the position of the mouse when it is pressed
}

function swipeControlEnd() {

  let bButtonWasClicked = false;
  if (bIsMobileFullscreen) {
    bButtonWasClicked = game.checkButtons(mouseY, height - mouseX);
  } else {
    bButtonWasClicked = game.checkButtons(mouseX, mouseY);
  }

  if (!bButtonWasClicked && game.state == 'play' && mouseDown != undefined) {
    //game swipe controls
    let mouseVec = createVector(mouseX, mouseY);//get current mouse or touch location
    mouseVec.sub(mouseDown);//result vector is the direction of the swipe
    mouseDown = undefined;//clear mouseDown because I don't want strange edge cases where mouseReleased is called twice (trust issues)
    if (mouseVec.mag() > 2) {

      push();
      angleMode(RADIANS);//just in case we aren't in radians mode
      let result = map(mouseVec.heading(), -PI, PI, 0, 4);//convert to 4 cardinal directions
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