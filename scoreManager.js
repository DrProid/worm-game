
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
        print("no \"highscores\" ");
        populateScores();
    } else {
        print("has \"highscores\" ");
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
    print(localStorage);
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