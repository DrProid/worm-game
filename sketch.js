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

function windowResized() {
  divWidth = document.getElementById('worm-game').offsetWidth;
  divHeight = document.getElementById('worm-game').offsetHeight;
  resizeCanvas(divWidth, divHeight);
  game.calculateBoardWindow(width, height);
}

//controls input
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      game.board.worm.changeDirection(LEFT);
      break;
    case RIGHT_ARROW:
      game.board.worm.changeDirection(RIGHT);
      break;
    case UP_ARROW:
      game.board.worm.changeDirection(UP);
      break;
    case DOWN_ARROW:
      game.board.worm.changeDirection(DOWN);
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





class Button {
  //size
  //position
  //callback
  //image
}