function playSoundAndVideo() {
    // Sync sound and video when playing or pausing a video
    video = document.getElementById('videoIN');
    audio = document.getElementById('audioIN');
    video.currentTime = audio.currentTime;
    if (audio.paused) {
        video.pause();
    } else {
        video.play();
    }
}

function playVideoAndSound() {
        // Sync sound and video when playing or pausing a video
        video = document.getElementById('videoIN');
        audio = document.getElementById('audioIN');
        audio.currentTime = video.currentTime;
        if (video.paused) {
            audio.play();
            video.play();
        } else {
            video.pause();
            audio.pause();
        }
}
