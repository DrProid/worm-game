var bgm = new Howl({
    src: ['WORMS_UNMIXED_01.mp3'],
    loop: true
});

var backgroundMusic = bgm.play();

//not much here yet. I don't know the architecture until I think of the neccesity
//probably need something to queue track changes for the background music
//and some kind of sfx player on button presses and stuff.