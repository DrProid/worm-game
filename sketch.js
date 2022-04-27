let game;
//LEFT and RIGHT already exist as string constants (for aligning) so I used those
//but I had to make UP and DOWN myself
const UP = 'up';
const DOWN = 'down';

const CLICK = "click";
const HOLD = "hold";

let mouseDown;

let bIsDebugMode = true;
let version = "v0.197";

let suppressPauseTimer = 0;

var divWidth = document.getElementById('worm-game').offsetWidth;
var divHeight = document.getElementById('worm-game').offsetHeight;

let cnv;//canvas context

let imageList = {};
let retroFont;

function preload() {
  //font
  retroFont = loadFont('./assets/images/fonts/Retro Gaming.ttf');

  imageList.wormDance = loadImage('./assets/images/wormdance_02.gif');

  //welcome
  if (isMobile) {
    imageList.tutorial = loadImage('./assets/images/UI_Window_Wormgame_Tutorial_Tablet.png');
  } else {
    imageList.tutorial = loadImage('./assets/images/UI_Window_Wormgame_Tutorial.png');
  }
  imageList.tutorialOkIdle = loadImage('./assets/images/UI_Window_Wormgame_Tutorial_Button_OK_Idle.png');
  imageList.tutorialOkClick = loadImage('./assets/images/UI_Window_Wormgame_Tutorial_Button_OK_Click.png');
  imageList.tutorialXIdle = loadImage('./assets/images/UI_Window_Wormgame_Tutorial_Button_X_Idle.png');
  imageList.tutorialXClick = loadImage('./assets/images/UI_Window_Wormgame_Tutorial_Button_X_Click.png');
  
  //desktop
  imageList.bg = loadImage('./assets/images/UI_BackGround.png');
  imageList.bucketIdle = loadImage('./assets/images/UI_Icon_Bucket_Idle.png');
  imageList.bucketClick = loadImage('./assets/images/UI_Icon_Bucket_Click.png');
  imageList.wormGameIdle = loadImage('./assets/images/UI_Icon_wormgame_idle.png');
  imageList.wormGameClick = loadImage('./assets/images/UI_Icon_wormgame_click.png');
  imageList.appleIdle = loadImage('./assets/images/UI_Icon_apple_idle.png');
  imageList.appleClick = loadImage('./assets/images/UI_Icon_apple_click.png');
  imageList.notepadIdle = loadImage('./assets/images/UI_Icon_Credits_Idle.png');
  imageList.notepadClick = loadImage('./assets/images/UI_Icon_Credits_Click.png');
  
  //credits
  imageList.creditsWindow = loadImage('./assets/images/UI_Window_Credits.png');
  imageList.creditsXIdle = loadImage('./assets/images/UI_Window_Credits_Button_X_Idle.png');
  imageList.creditsXClick = loadImage('./assets/images/UI_Window_Credits_Button_X_Click.png');
  
  //taskbar
  imageList.livesWindow = loadImage('./assets/images/UI_Window_Lives.png');
  imageList.life = loadImage('./assets/images/UI_Hearts.gif');
  imageList.scoreWindow = loadImage('./assets/images/UI_Window_Counter.png');


  //game window
  imageList.gameWindow = loadImage('./assets/images/UI_Window_Wormgame.png');
  imageList.gameWindowXClick = loadImage('./assets/images/UI_Window_Wormgame_X_Click.png');
  imageList.gameWindowXIdle = loadImage('./assets/images/UI_Window_Wormgame_X_Idle.png');
  imageList.gameWindowFullscreenClick = loadImage('./assets/images/UI_Window_Wormgame_Fullscreen_Click.png');
  imageList.gameWindowFullscreenIdle = loadImage('./assets/images/UI_Window_Wormgame_Fullscreen_Idle.png');
  imageList.gameWindowPauseClick = loadImage('./assets/images/UI_Window_Wormgame_Pause_Click.png');
  imageList.gameWindowPauseIdle = loadImage('./assets/images/UI_Window_Wormgame_Pause_Idle.png');

  //pause
  imageList.pauseWindow = loadImage('./assets/images/UI_Window_Pause.png');
  imageList.resumeIdle = loadImage('./assets/images/UI_Window_Pause_Button_Idle.png');
  imageList.resumeClick = loadImage('./assets/images/UI_Window_Pause_Button_Click.png');

  //game over
  imageList.gameOverWindow = loadImage('./assets/images/UI_Window_EndScreen.png');
  imageList.playAgainIdle = loadImage('./assets/images/UI_Window_EndScreen_Button_PlayAgain_Idle.png');
  imageList.playAgainClick = loadImage('./assets/images/UI_Window_EndScreen_Button_PlayAgain_Click.png');

  //worm
  imageList.wormHeadIdle = loadImage('./assets/images/worm/Char_Head_Idle.png');
  imageList.wormHeadOpen = loadImage('./assets/images/worm/Char_Head_Open.png');
  imageList.wormHeadBad = loadImage('./assets/images/worm/Char_Head_Bad.png');
  imageList.wormHeadGood = loadImage('./assets/images/worm/Char_Head_Good.png');
  imageList.wormBody = loadImage('./assets/images/worm/Char_Body.png');

  //food
  imageList.good = [];
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_Apple.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_Banana.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_Carrot.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_Coffee.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_Egg.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_Greens.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_leaves.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_paper.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_teabag.png'));
  imageList.good.push(loadImage('./assets/images/food/T_Food_Good_tomato.png'));
  imageList.bad = [];
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Cheese.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Chili.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Citrus.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Garlic.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Meat.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Oil.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Onion.png'));
  imageList.bad.push(loadImage('./assets/images/food/T_Food_Bad_Pineapple.png'));

  //facts
  imageList.facts = [];
  for (let i = 1; i <= 8; i++) {
    imageList.facts.push(loadImage('./assets/images/facts/UI_Window_Wormfact_0' + i + '.png'));
  }
  imageList.factXIdle = loadImage('./assets/images/facts/UI_Window_Wormfact_Button_X_Idle.png')
  imageList.factXClick = loadImage('./assets/images/facts/UI_Window_Wormfact_Button_X_Click.png')
}

function setup() {
  cursor('./assets/images/Cursor.png', 3, 4);
  cnv = createCanvas(divWidth, divHeight);
  cnv.elt.style.left = "50%";
  cnv.elt.style.top = "50%";
  cnv.elt.style.transform = 'translate(-50%,-50%)';

  cnv.parent("worm-game");

  game = new StateManager();

}

function draw() {
  background(220);

  //if images haven't loaded
  //display the loading screen

  //else

  game.update();
  game.draw();

  //check to see if any of the icons are being held down
  if (mouseIsPressed) {
    checkButtonHold(mouseX, mouseY);
  } else {
    //set all buttons to unheld state
    game.normalButtons();
  }

  if (bIsDebugMode) {
    push();
    fill('white');
    textSize(20);
    text(version, 20, 20)
    // text(width, 60, 60);
    // text(height, 160, 60);
    // text(windowWidth, 60, 80);
    // text(windowHeight, 160, 80);
    // text(displayWidth, 60, 100);
    // text(displayHeight, 160, 100);
    text(game.level, 60, 60)
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
  if (bIsMobileFullscreen && divHeight > divWidth) {
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
      if (game.state == 'play') game.board.changeDirection(LEFT);
      break;
    case RIGHT_ARROW:
    case 68: //D
      if (game.state == 'play') game.board.changeDirection(RIGHT);
      break;
    case UP_ARROW:
    case 87: //W
      if (game.state == 'play') game.board.changeDirection(UP);
      break;
    case DOWN_ARROW:
    case 83: //S
      if (game.state == 'play') game.board.changeDirection(DOWN);
      break;
    case ENTER:
      if (game.state == 'ready') {
        game.startGame();
      } else if (game.state == 'play' || game.state == 'pause') {
        game.togglePause();
      }
      break;
    default:
      // console.log("Some other key pressed. keycode = " + keyCode);
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
  checkButtonHold(mouseX, mouseY);
  mouseSound();
}

function checkButtonHold(xPos, yPos) {
  if (bIsMobileFullscreen && divHeight > divWidth) {
    game.checkButtons(yPos, height - xPos, HOLD);
  } else {
    game.checkButtons(xPos, yPos, HOLD);
  }
}

function swipeControlEnd() {

  let bButtonWasClicked = false;
  // let bExitToReady = false;
  // if (game.state == "scraps" || game.state == 'credits') {
  //   //override of scraps to go away on a click anywhere
  //   bExitToReady = true;
  // }
  if (bIsMobileFullscreen && divHeight > divWidth) {
    bButtonWasClicked = game.checkButtons(mouseY, height - mouseX);
  } else {
    bButtonWasClicked = game.checkButtons(mouseX, mouseY);
  }
  // if(bExitToReady){
  //   game.changeState('ready');
  //   game.underBoardUIElements.credits.elements.creditsX.state = 0;
  //   game.underBoardUIElements.scraps.elements.scrapsX.state = 0;
    
  // }
  if (isMobile && !bButtonWasClicked && game.state == 'play' && mouseDown != undefined) {
    //game swipe controls
    let mouseVec = createVector(mouseX, mouseY);//get current mouse or touch location
    game.board.swipeControl(mouseDown, mouseVec);
    mouseDown = undefined;//clear mouseDown because I don't want strange edge cases where mouseReleased is called twice (trust issues)
  }

}