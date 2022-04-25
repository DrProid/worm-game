var bgm = new Howl({
    src: ['./assets/audio/WORMS_BACKING_final.webm', './assets/audio/WORMS_BACKING_final.mp3', './assets/audio/WORMS_BACKING_final.wav'],
    loop: true
});

var bad = [];
var good = [];
var turn = [];
var boop = [];

for (let i = 0; i < 3; i++) {

    bad[i] = new Howl({
        src: [`./assets/audio/bad_chomp_${i + 1}.webm`, `./assets/audio/bad_chomp_${i + 1}.mp3`, `./assets/audio/bad_chomp_${i + 1}.wav`]
    })

    good[i] = new Howl({
        src: [`./assets/audio/good_chomp_${i + 1}.webm`, `./assets/audio/good_chomp_${i + 1}.mp3`, `./assets/audio/good_chomp_${i + 1}.wav`]
    })

    turn[i] = new Howl({
        src: [`./assets/audio/turn_${i + 1}.webm`, `./assets/audio/turn_${i + 1}.mp3`, `./assets/audio/turn_${i + 1}.wav`],
        volume: 0.2
    })

    boop[i] = new Howl({
        src: [`./assets/audio/menu_boop_${i + 1}.webm`, `./assets/audio/menu_boop_${i + 1}.mp3`, `./assets/audio/menu_boop_${i + 1}.wav`]
    })
}

var gameStartingSound = new Howl({
    src: [`./assets/audio/game_starting.webm`, `./assets/audio/game_starting.mp3`, `./assets/audio/game_starting.wav`]
})

var mouseClickSound = new Howl({
    src: [`./assets/audio/mouse_click.webm`, `./assets/audio/mouse_click.mp3`, `./assets/audio/mouse_click.wav`]
})

var backgroundMusic = bgm.play();

function badSound() {
    random(bad).play();
}

function goodSound() {
    random(good).play();
}

function turnSound() {
    random(turn).play();
}

function boopSound() {
    random(boop).play();
}

function mouseSound() {
    mouseClickSound.play();
}

function gameStartSound() {
    gameStartingSound.play();
}