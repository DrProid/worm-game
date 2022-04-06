/*
The GameManager class.
Responsibilities:
    -Manage game loop (start/stop game)
    -Show windows based on game state
    -keeps track of scores
*/



class GameManager {

    constructor() {
    // let bCanStore = false;
      this.rows = 30;
      this.cols = 60;
      this.board = new BoardManager();
      // if (storageAvailable("localStorage")) {
      //   bCanStore = true;
      //   checkStorage();
      // }
      // this.startGame();
      this.state = 'ready';
      this.calculateBoardWindow(width, height);
    }
    
    startGame() {
      this.state = 'play';
      this.board.spawnWorm(floor(this.cols/2), floor(this.rows/2));
    }
    
    togglePause(forceState){
      if(forceState != undefined){
        this.state = forceState;
      }else if(this.state == 'pause'){
        this.state = 'play';
      }else if(this.state == 'play'){
        this.state = 'pause';
      }
    }

    draw() {
      if(this.state == 'play' || this.state == 'pause'){
        this.board.draw(this.rows, this.cols, this.gridSize);
      }
      if(this.state == 'pause'){
        //replace this with a pause dialogue and button
        text("Press enter to Unpause", width/2,height/2);
      }
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
    game.togglePause('pause');
  }
}