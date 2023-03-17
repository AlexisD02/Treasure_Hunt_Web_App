const video = document.getElementById("myVideo");

// Play normally
video.play();

// Repeat
video.addEventListener("ended", function() {
    video.currentTime = 0;
    video.play();
});

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
}