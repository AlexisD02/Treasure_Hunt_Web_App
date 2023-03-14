const video = document.getElementById("myVideo");

// Play normally
video.play();

// Repeat
video.addEventListener("ended", function() {
    video.currentTime = 0;
    video.play();
});
