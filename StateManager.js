/*
The StateManager class.
Responsibilities:
    -Manage game loop (start/stop game)
    -Manage UI based on game state
    -keeps track of scores
*/

class StateManager {

  constructor() {
    // this.changeState('ready');
    // let bCanStore = false;
    // if (storageAvailable("localStorage")) {
    //   bCanStore = true;
    //   checkStorage();
    // }
    this.underBoardUIElements = {};
    makeDesktop(this);
    makeGameWindow(this);
    // this.board = new BoardManager(30, 60, this.underBoardUIElements.gameWindow.dim);
    this.overBoardUIElements = {};
    // makeWelcomeUI(this);
    makePauseUI(this);


    this.changeState('ready');

  }

  startGame() {
    this.changeState('play');
    this.board.startGame();
  }

  togglePause(forceState) {
    if (forceState != undefined) {
      this.changeState(forceState);// this.state = forceState;
    } else if (this.state == 'pause') {
      this.changeState('play');
    } else if (this.state == 'play') {
      this.changeState('pause');
    }
  }

  handleResize() {

    let parentPos = { xOff: 0, yOff: 0 };
    let parentDim = { width: width, height: height };

    for (let name in this.underBoardUIElements) {
      this.underBoardUIElements[name].calculateWindow(parentPos, parentDim)
    }

    this.board.calculateWindow(parentPos, parentDim);

    for (let name in this.overBoardUIElements) {
      this.overBoardUIElements[name].calculateWindow(parentPos, parentDim)
    }

  }

  addUI(name, parentPos, parentDim, anchor, image, bIsOver = true) {
    if (bIsOver) {
      this.overBoardUIElements[name] = new UIContainer(parentPos, parentDim, anchor, image);
    } else {
      this.underBoardUIElements[name] = new UIContainer(parentPos, parentDim, anchor, image);
    }
  }

  addGameWindow(parentPos, parentDim, anchor, image, cols, rows) {
    this.board = new BoardElement(parentPos, parentDim, anchor, image, cols, rows);
  }

  checkButtons(xPos, yPos, type) {
    let bButtonWasClicked = false;
    for (let name in this.overBoardUIElements) {
      if (this.overBoardUIElements[name].checkButtons(xPos, yPos, type)) {
        bButtonWasClicked = true;
      }
    }
    for (let name in this.board.elements) {
      if (this.board.elements[name].checkButtons(xPos, yPos, type)) {
        bButtonWasClicked = true;
      }
    }
    for (let name in this.underBoardUIElements) {
      if (this.underBoardUIElements[name].checkButtons(xPos, yPos, type)) {
        bButtonWasClicked = true;
      }
    }
    return bButtonWasClicked;
  }

  changeState(state) {
    switch (state) {
      case 'ready':
        this.underBoardUIElements.desktop.setInteractable(true);
        this.board.setInteractable(false);
        this.board.setVisible(false);
        break;
      case 'play':
        this.overBoardUIElements.pause.setVisible(false);
        this.overBoardUIElements.pause.setInteractable(false);
        this.underBoardUIElements.desktop.setInteractable(false);
        this.board.setInteractable(true);
        this.board.setVisible(true);
        break;
        case 'pause':
          this.overBoardUIElements.pause.setVisible(true);
          this.overBoardUIElements.pause.setInteractable(true);
          this.underBoardUIElements.desktop.setInteractable(false);
          // this.board.setInteractable(false);
          // this.board.setVisible(true);
        break;
      default:
        console.error("unknown state sent to changeState : " + state);
    }
    this.state = state;
  }

  draw() {
    //draw all of the UI that apears under game board
    for (let key in this.underBoardUIElements) {
      this.underBoardUIElements[key].draw();
    }

    // if (this.state == 'ready') {
    //   // text("Start Game", width / 2, height / 2);
    //   this.uiElements.welcome.setVisible(true);
    // }
    if (this.state == 'play' || this.state == 'pause') {
      this.board.draw();
    }
    // if (this.state == 'pause') {
    //   //replace this with a pause dialogue and button
    //   // text("Press enter or click to Unpause", width / 2, height / 2);
    // }

    //draw all of the UI that apears on top of game board
    for (let key in this.overBoardUIElements) {
      this.overBoardUIElements[key].draw();
    }
  }

  update() {
    this.board.update(this.state);
  }

}

/***********************local storage functions**********************/

function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

function checkStorage() {
  if (!localStorage.length > 0) {
    console.log("no \"highscores\" ");
    populateScores();
  } else {
    console.log("has \"highscores\" ");
    printScores();
    // clearScores();
  }
}

function populateScores() {
  for (let i = 0; i < 3; i++) {
    localStorage["score" + i] = i * 100 + 100;
  }
}

function printScores() {
  console.log(localStorage);
  // for(let i = 0; i < 3; i++){
  //   print("i:" + localStorage["score"+i]);
  // }
}

function clearScores() {
  localStorage.clear();
}


// localStorage.gameData = JSON.stringify(gameDataObj))

// let gameDataObj = JSON.parse(localStorage.gameData)

//store top ~5 personal best scores locally

/***********************visibility detection**********************/

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
  console.log("Automatic pausing is only available in a browser such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

function handleVisibilityChange() {
  if (document[hidden]) {
    if (game.state == 'play') game.togglePause('pause');
  }
}

/***********************mobile detection**********************/

var isMobile = false; //initiate as false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
  || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
  isMobile = true;
}