let game;
//LEFT and RIGHT already exist as string constants (for aligning) so I used those
//but I had to make UP and DOWN myself
const UP = 'up';
const DOWN = 'down';

const CLICK = "click";
const HOLD = "hold";

let mouseDown;
let bIsDebugMode = false;
let version = "v0.191";

// let bSuppressPause = false;
// let suppressPauseInterval;
let suppressPauseTimer = 0;

var divWidth = document.getElementById('worm-game').offsetWidth;
var divHeight = document.getElementById('worm-game').offsetHeight;

let cnv;//canvas context

let imageList = {};

function preload(){
  //desktop
  imageList.bg = loadImage('assets/images/UI_Background.png');
  imageList.bucketIdle = loadImage('assets/images/UI_Icon_Bucket_Idle.png');
  imageList.bucketClick = loadImage('assets/images/UI_Icon_Bucket_Click.png');
  imageList.wormGameIdle = loadImage('assets/images/UI_Icon_wormgame_Idle.png');
  imageList.wormGameClick = loadImage('assets/images/UI_Icon_wormgame_Click.png');

  //game window
  imageList.gameWindow =  loadImage('assets/images/UI_Window_Wormgame.png');
  imageList.gameWindowXClick =  loadImage('assets/images/UI_Window_Wormgame_X_Click.png');
  imageList.gameWindowXIdle =  loadImage('assets/images/UI_Window_Wormgame_X_Idle.png');
  imageList.gameWindowFullscreenClick =  loadImage('assets/images/UI_Window_Wormgame_Fullscreen_Click.png');
  imageList.gameWindowFullscreenIdle =  loadImage('assets/images/UI_Window_Wormgame_Fullscreen_Idle.png');
  imageList.gameWindowPauseClick =  loadImage('assets/images/UI_Window_Wormgame_Pause_Click.png');
  imageList.gameWindowPauseIdle =  loadImage('assets/images/UI_Window_Wormgame_Pause_Idle.png');
  
  //pause
  imageList.pauseWindow =  loadImage('assets/images/UI_Window_Pause.png');
  imageList.resumeIdle =  loadImage('assets/images/UI_Window_Pause_Button_Idle.png');
  imageList.resumeClick =  loadImage('assets/images/UI_Window_Pause_Button_Click.png');
  
  //worm
  imageList.wormHeadIdle = loadImage('assets/images/Char_Head_Idle.png');
  imageList.wormBody = loadImage('assets/images/Char_Body.png');
}

function setup() {
  
  cnv = createCanvas(divWidth, divHeight);
  cnv.elt.style.left = "50%";
  cnv.elt.style.top = "50%";
  cnv.elt.style.transform = 'translate(-50%,-50%)';
  
  cnv.parent("worm-game");
  
  game = new StateManager();
  // console.log( imageList.pauseWindow.width, imageList.pauseWindow.height);

}

function draw() {
  background(220);

  game.update();
  game.draw();

  if(mouseIsPressed){
    checkButtonHold(mouseX, mouseY);
  }

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
  //get the div dimensions
  divWidth = document.getElementById('worm-game').offsetWidth;
  divHeight = document.getElementById('worm-game').offsetHeight;

  //if this resize is because player pressed 'fullscreen', don't pause the game
  if (game.state == 'play') {
    if (suppressPauseTimer - millis() > 0) {
    } else {
      game.togglePause('pause');
    }
  }

  //mobile fullscreen is different
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
  checkButtonHold(mouseX, mouseY)
}

function checkButtonHold(xPos, yPos){
  if (bIsMobileFullscreen) {
    game.checkButtons(yPos, height - xPos, HOLD);
  } else {
    game.checkButtons(xPos, yPos, HOLD);
  }
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
    game.board.swipeControl(mouseDown, mouseVec);
    mouseDown = undefined;//clear mouseDown because I don't want strange edge cases where mouseReleased is called twice (trust issues)
  }

}