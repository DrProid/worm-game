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
  game = new StateManager();
}

function draw() {
  background(220);

  game.update();
  game.draw();
  fill('black');
  text(frameRate().toFixed(0), 100, 100);
}

function windowResized() {
  divWidth = document.getElementById('worm-game').offsetWidth;
  divHeight = document.getElementById('worm-game').offsetHeight;
  if(game.state == 'play'){
    game.togglePause('pause');
  }
  resizeCanvas(divWidth, divHeight);
  game.board.calculateBoardWindow(width, height);
}

//controls input
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      if(game.state == 'play') game.board.worm.changeDirection(LEFT);
      break;
    case RIGHT_ARROW:
      if(game.state == 'play') game.board.worm.changeDirection(RIGHT);
      break;
    case UP_ARROW:
      if(game.state == 'play') game.board.worm.changeDirection(UP);
      break;
    case DOWN_ARROW:
      if(game.state == 'play') game.board.worm.changeDirection(DOWN);
      break;
    case ENTER:
      if (game.state == 'ready') {
        game.startGame();
      } else if(game.state == 'play' || game.state == 'pause'){
        game.togglePause();
      }
      break;
    default:
      console.log("Some other key pressed. keycode = " + keyCode);
      break;
  }
}

function mouseClicked(){
  if(game.state=='ready'){
    game.startGame();
  }
}