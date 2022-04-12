/*
The StateManager class.
Responsibilities:
    -Manage game loop (start/stop game)
    -Manage UI based on game state
    -keeps track of scores
*/

class StateManager {

  constructor() {
    this.board = new BoardManager(30, 60);
    // this.changeState('ready');
    // let bCanStore = false;
    // if (storageAvailable("localStorage")) {
    //   bCanStore = true;
    //   checkStorage();
    // }
    this.uiElements = {};

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
    this.board.calculateBoardWindow(width, height);

    let parentPos = { xOff: 0, yOff: 0 };
    let parentDim = { width: width, height: height };
    for (let name in this.uiElements) {
      this.uiElements[name].calculateWindow(parentPos, parentDim)
    }
  }

  addUI(name, parentPos, parentDim, anchor) {
    this.uiElements[name] = new UIContainer(parentPos, parentDim, anchor);
  }

  checkButtons(xPos, yPos, type) {
    for (let name in this.uiElements) {
      this.uiElements[name].checkButtons(xPos, yPos, type);
    }
  }

  changeState(state) {
    switch (state) {
      case 'ready':
        this.uiElements.welcome.setVisible(true);
        break;
      case 'play':
        this.uiElements.welcome.setVisible(false);
        break;
      case 'pause':
        this.uiElements.welcome.setVisible(true);
        break;
      default:
        console.error("unknown state sent to changeState : " + state);
    }
    this.state = state;
  }

  draw() {
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

    //draw all of the UI
    for (let key in this.uiElements) {
      this.uiElements[key].draw();
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


