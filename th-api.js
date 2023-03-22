const TH_BASE_URL = "https://codecyprus.org/th/api/"; // the true API base url
const TH_TEST_URL = "https://codecyprus.org/th/test-api/"; // the test API base url
const url = "https://alexisd02.github.io/CO1111/"; // Replace with the actual URL

const challengesList = document.getElementById('treasureHunts');
const answerQuestionMessage = document.getElementById('answerQuestionMessage');
const messageBox = document.getElementById('message');
const buttons = document.getElementById('buttons');
const thead = document.getElementById('thead');
const tbody = document.getElementById('tbody');
const title = document.getElementById('logo');
const previewWrapper = document.getElementById('preview_wrapper');
const postScore = document.getElementById('postScore');

let scanner = null, intervalID, map, locationArray = [], totalScore = 0;

/**
 * An asynchronous function to realize the functionality of getting the available 'treasure hunts' (using /list) and
 * processing the result to update the HTML with a bullet list with the treasure hunt names and descriptions. Also,
 * for each treasure hunt in the bullet list, a link is shown to trigger another function, the 'select'.
 */
function getChallenges() {
    const listUrl = TH_BASE_URL + `list`;

    fetch(listUrl)
        .then(response => response.json()) //Parse JSON text to JavaScript object
        .then(jsonObject => {
            const { status, treasureHunts } = jsonObject;
            if (status === "OK") {
                challengesList.innerHTML = "";
                console.log(treasureHunts);
                const currentDateTime = new Date(); // Create a new Date object representing the current date and time
                console.log(currentDateTime.toLocaleString());
                for (let i = 0; i < treasureHunts.length; i++) {
                    const { endsOn, startsOn, uuid, name, description } = treasureHunts[i];
                    const timeLeftToEnd = new Date(endsOn).toLocaleString();
                    const timeLeftToStart = new Date(startsOn).toLocaleString();
                    let listHtml = "<ul class='lists'>";
                    if(currentDateTime.getTime() >= startsOn && currentDateTime.getTime() <= endsOn) {
                        listHtml += "<button class='list' onclick=\"select(\'" + uuid + "\', \'" + name + "\')\"><li>" + // each treasure hunt item is shown with an individual DIV element
                            "<b id='bold_text'>" + name + "</b><br/><br/>" + // the treasure hunt name is shown in bold...
                            "<i>" + description + "</i><br/>" + // and the description in italics in the following line
                            "Ends: " + timeLeftToEnd + "</li></button>";// and the description in italics in the following lin
                    }
                    else if(currentDateTime.getTime() < startsOn){
                        listHtml += "<button class='list' id=\"disabled\"><li>" + // each treasure hunt item is shown with an individual DIV element
                            "<b id='bold_text'>" + name + "</b><br/><br/>" + // the treasure hunt name is shown in bold...
                            "<i>" + description + "</i><br/>" + // and the description in italics in the following line
                            "Starts: " + timeLeftToStart + "</li></button>";// and the description in italics in the following lin
                    }
                    listHtml += "</ul>";
                    challengesList.innerHTML += listHtml;
                }
            }
            else {
                console.log(jsonObject.status);
            }
        });
}

getChallenges();

/**
 * This function is called when a particular treasure hunt is selected. This is merely a placeholder as you're expected
 * to realize this function-or an equivalent-to perform the necessary actions after a treasure hunt is selected.
 */

function select(uuid, treasureName) {
    console.log("Selected treasure hunt with UUID: " + uuid);
    console.log(treasureName);

    buttons.innerHTML = "";
    messageBox.innerHTML = "<p>We are looking for the '" + treasureName + "' treasure. Now tell us your name, " +
        "and we are ready to go!</p>";
    challengesList.innerHTML = "<form id=\"form\"><div id=\"center\"><label for=\"name\"><b>Name</b></label>" +
        "<br/><input type=\"text\" class=\"input\" id=\"name\" name=\"name\" placeholder=\"Enter your name\" required><br/>" +
        "<div id=\"error\"></div><button type=\"submit\">Submit</button></div></form>";
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const form = document.getElementById("form");
    form.addEventListener("submit", submitName.bind(null, uuid, treasureName));
}

function submitName(uuid, treasureName, event) {
    event.preventDefault(); // prevent the form from submitting
    const playerName = document.getElementById("name").value;
    const error = document.getElementById("error");
    start(uuid, treasureName, playerName, error);
}

function start(uuid, treasureName, playerName, error) {
    const startUrl = TH_BASE_URL + `start?player=${playerName}&app=${treasureName}&treasure-hunt-id=${uuid}`;

    fetch(startUrl)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, numOfQuestions, session } = jsonObject;
            if (status === "OK") {
                console.log(`Treasure hunt started with session ID: ${session}`);
                console.log(`Total number of questions: ${numOfQuestions}`);
                questions(session);
            } else {
                error.innerHTML = jsonObject.errorMessages[0];
                console.log(status, jsonObject.errorMessages[0]);
            }
        })
        .catch(error => console.error(error));
}

function questions(session) {
    // Define the API endpoint URL

    const questionUrl = TH_BASE_URL + `question?session=${session}`;

    challengesList.innerHTML = "<div class=\"loader\"></div>";

    // Make a GET request to the API endpoint using fetch()
    fetch(questionUrl)
        .then(response => response.json()) // Parse the response as JSON
        .then(jsonObject => {
            const { questionText, questionType, canBeSkipped, requiresLocation, currentQuestionIndex,
                correctScore, wrongScore, skipScore } = jsonObject;

            console.log("Can be Skipped: " + canBeSkipped);

            totalScore += correctScore;
            score(session);
            buttons.innerHTML = "";
            // Call skipQuestion function
            if(canBeSkipped === true) {
                buttons.innerHTML = "<a onclick=\"skipQuestion(\'" + session + "\')\" class=\"btn\"><b>Skip</b></a>";
            }

            buttons.innerHTML += "<a href=\"#\" class=\"btn\" id=\"qr-button\"><span class=\"material-icons\">qr_code_scanner</span></a>";

            // Log the retrieved question and its details to the console
            console.log("Question-Text: " + questionText);
            messageBox.innerHTML = "<p>" + questionText + "</p>";

            if(canBeSkipped === false) {
                messageBox.innerHTML += "<p class=\"skip_text\">Cannot be skipped!</p>";
            }

            answerQuestionMessage.innerHTML = "";

            console.log("Question-Type: " + questionType);
            if(questionType === "BOOLEAN") {
                challengesList.innerHTML = "<form id=\"form\"><div id=\"center\">" +
                    "<button type=\"submit\" onclick=\"answerQuestion(\'" + session + "\', \'true\')\" class=\"answer\" " +
                    "name=\"answer\" value=\"true\">True</input>" +
                    "<button type=\"submit\" onclick=\"answerQuestion(\'" + session + "\', \'false\')\" class=\"answer\" " +
                    "name=\"answer\" value=\"false\">False</input></div></form>";
            }

            if(questionType === "INTEGER") {
                challengesList.innerHTML = "<form id=\"form\"><div id=\"center\"><div class=\"input-wrapper\"><label for=\"answer\"></label>" +
                    "<input type=\"number\" class=\"input\" id=\"answer\" name=\"answer\" placeholder=\"Enter an integer...\" required>" +
                    "</div><button type=\"submit\">Submit</button></div></form>";
            }

            if(questionType === "NUMERIC") {
                challengesList.innerHTML = "<form id=\"form\"><div id=\"center\"><div class=\"input-wrapper\"><label for=\"answer\"></label>" +
                    "<input type=\"number\" class=\"input\" id=\"answer\" name=\"answer\" placeholder=\"Enter an number...\" step=\"0.01\" required>" +
                    "</div><button type=\"submit\">Submit</button></div></form>";
            }

            if(questionType === "MCQ") {
                challengesList.innerHTML = "<form id=\"form\"><div id=\"center\"><label for=\"response\"></label>" +
                    "<button type=\"submit\" onclick=\"answerQuestion(\'" + session + "\', \'A\')\" " +
                    "class=\"answer\" name=\"answer\" value=\"A\">A</input>" +
                    "<button type=\"submit\" onclick=\"answerQuestion(\'" + session + "\', \'B\')\" " +
                    "class=\"answer\" name=\"answer\" value=\"B\">B</input>" +
                    "<button type=\"submit\" onclick=\"answerQuestion(\'" + session + "\', \'C\')\" " +
                    "class=\"answer\" name=\"answer\" value=\"C\">C</input>" +
                    "<button type=\"submit\" onclick=\"answerQuestion(\'" + session + "\', \'D\')\" " +
                    "class=\"answer\" name=\"answer\" value=\"D\">D</input></div></form>";
            }

            if(questionType === "TEXT") {
                challengesList.innerHTML = "<form id=\"form\"><div id=\"center\"><div class=\"input-wrapper\"><label for=\"answer\"></label>" +
                    "<input type=\"text\" class=\"input\" id=\"answer\" name=\"answer\" placeholder=\"Answer here...\" required>" +
                    "</div><button type=\"submit\">Submit</button></div></form>";
            }

            console.log("Requires Location?: " + requiresLocation);
            if(requiresLocation === true) {
                getLocation(session);
                intervalID = setInterval(() => { getLocation(session); }, 31000);
            }
            else{
                clearInterval(intervalID);
            }

            console.log("Question index: " + currentQuestionIndex);
            console.log("Score if correct answer: " + correctScore);
            console.log("Score if wrong answer: " + wrongScore);
            console.log("Score if skip to answer: " + skipScore);


            let form = document.getElementById("form");
            form.addEventListener("submit", function(event) {
                event.preventDefault(); // prevent the form from submitting
                if(questionType === "INTEGER" || questionType === "NUMERIC" || questionType === "TEXT") {
                    const answer = document.getElementById("answer").value;
                    answerQuestion(session, answer);
                }
            });
            document.getElementById('qr-button').addEventListener('click', startQRCodeScanner);
        })
        .catch(error => console.error(error)); // Handle any errors
}

let cameraIndex = 0; // The index of the selected camera.
let cameraArray; // An array of all available cameras.
const videoElement = document.createElement('video');
const button_qr = document.getElementById('button_qr');

function switchCamera() {
    cameraIndex = (cameraIndex + 1) % cameraArray.length;
    scanner.start(cameraArray[cameraIndex]);
}

function isUrl(content) {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(content);
}

function startQRCodeScanner() {
    if (scanner) {
        QRScannerStop();
        return;
    }

    Instascan.Camera.getCameras()
        .then((cameras) => {
            cameraArray = cameras;
            if (cameras.length > 0) {
                scanner = new Instascan.Scanner({
                    video: videoElement,
                    mirror: cameras.length === 1,
                });
                scanner.start(cameras[cameraIndex]);
                button_qr.innerHTML = '<button id="switchCamera" onclick="switchCamera();">Switch camera</button>';
                scanner.addListener('scan', (content) => {
                    answerQuestionMessage.innerHTML = isUrl(content) ? `<a href="${content}" target="_blank">Click to view</a>` : '';
                    document.getElementById('answer').value = content;
                    QRScannerStop();
                });
                previewWrapper.appendChild(videoElement);
            } else {
                console.error('No cameras found.');
                alert('No cameras found');
            }
        })
        .catch((error) => {
            console.error(error);
            alert('Camera access has been denied. Please enable your camera or search for a device with a camera.');
        });
}

function QRScannerStop() {
    if (scanner) {
        scanner.stop();
        scanner = null;
        previewWrapper.innerHTML = '';
        button_qr.innerHTML = '';
    }
}

function answerQuestion(sessionId, answer) {
    const answerUrl = TH_BASE_URL + `answer?session=${sessionId}&answer=${encodeURIComponent(answer)}`;

    fetch(answerUrl)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, correct, completed, message, scoreAdjustment } = jsonObject;
            if (status === "OK") {
                if (completed) {
                    console.log("Congratulations, you have completed the treasure hunt!");
                    clearInterval(intervalID);
                    displayLeaderboard(sessionId);
                }
                else {
                    if (correct) {
                        console.log("Correct answer! " + message);
                        answerQuestionMessage.innerHTML = "<p style='color: green'>Correct answer! " + message + "</p>";
                        if (scanner) {
                            QRScannerStop();
                        }
                        questions(sessionId);
                    }
                    else {
                        console.log(message);
                        answerQuestionMessage.innerHTML = "<p style='color: red'>" + message + "</p>";
                    }
                }
                console.log("Score adjustment: " + scoreAdjustment);
                score(sessionId);
            }
            else {
                console.log(status);
            }
        })
        .catch(error => console.error(error));
}

/*
*To add the location updates to the minimap using Leaflet library, you can follow these steps:

* Define a global variable map to store the map object and initialize it in the initMap() function only if it is undefined.
* Define a global variable locationArray to store the locations visited by the user.
* In the getLocation() function, push the new location to the locationArray and call the updateMap()
* function to add the location to the minimap.
* Define the updateMap() function to draw the path between the locations and update the map with markers and the path.
* In the initMap() function, initialize the map and add the path layer to it.

*/
function initMap() {
    if (!map) {
        map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
    }

    const pathLayer = L.polyline(locationArray, {color: 'red'}).addTo(map);
    map.fitBounds(pathLayer.getBounds());

    locationArray.forEach((location, index) => {
        const marker = L.marker(location).addTo(map);
        marker.bindTooltip(`Location ${index+1}`, {permanent: true, direction: 'top', offset: [-14, -10]});
        // display the label permanently at the top of the marker with a 14 pixel leftward and 10 pixel upward offset.
    });
}


// hide the map initially
document.getElementById("map").style.display = "none";

// Get location
function getLocation(sessionId) {
    if (!navigator.permissions || !navigator.permissions.query) {
        console.error('Geolocation is not supported by your browser.');
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
        if (permission.state === 'granted') {
            getLocationData(sessionId);
        } else if (permission.state === 'prompt') {
            console.log('Please enable location services for this app');
            alert('Please enable location services for this app');
            navigator.geolocation.getCurrentPosition(
                () => getLocationData(sessionId),
                () => {
                    console.log('User denied location services');
                    alert('User denied location services');
                }
            );
        } else {
            console.log('Location services are not available');
            alert('Location services are not available');
        }
    });
}

function getLocationData(sessionId) {
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        locationArray.push([latitude, longitude]);
        const locationUrl = TH_BASE_URL + `location?session=${sessionId}&latitude=${latitude}&longitude=${longitude}`;
        fetch(locationUrl)
            .then((response) => response.json())
            .then((jsonObject) => {
                const { status, message } = jsonObject;
                console.log(status, message);
            })
            .catch((error) => {
                console.error(error);
                alert('There was an error getting your location data');
            });
    }, (error) => {
        console.error(error);
        alert('There was an error getting your location');
    });
}

// Skip question function
function skipQuestion(sessionId) {

    if(confirm("Are you sure you want to skip the current question?")) {
        const skipURL = TH_BASE_URL + `skip?session=${sessionId}`;

        console.log("\n");
        fetch(skipURL)
            .then(response => response.json())
            .then(jsonObject => {
                const {status, completed, message, scoreAdjustment} = jsonObject;
                if (status === "OK") {
                    console.log("Completed:" + completed);
                    if (scanner) {
                        QRScannerStop();
                    }
                    if (completed) {
                        console.log("Congratulations, you have completed the treasure hunt!");
                        displayLeaderboard(sessionId);
                    } else {
                        console.log("Message:" + message);
                        console.log("Score-Adjustment: " + scoreAdjustment);
                        questions(sessionId);
                    }
                }
            })
            .catch(error => console.error(error));
    }
}

function score(sessionId) {

    const scoreURL = TH_BASE_URL + `score?session=${sessionId}`;

    console.log("Score-section\n");
    fetch(scoreURL)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, completed, finished, player, score } = jsonObject;
            if (status === "OK") {
                console.log("Completed: " + completed);
                console.log("Finished: " + finished);
                console.log("Player: " + player);
                console.log("Score: " + score);
                title.innerHTML = "Score: " + score;
                if(completed) {
                    messageBox.innerHTML = "<p style='color: green'>Congratulations! You have completed the treasure " +
                        "hunt with a score of " + score + "/" + totalScore + "</p>";

                    postScore.innerHTML = "<a id=\"fb\"><i class=\"fa-brands fa-square-facebook\"></i><span>Share</span></a>" +
                        "<a id=\"twitter\"><i class=\"fa-brands fa-square-twitter\"></i><span>Share</span></a>";

                    function shareOnFacebook() {
                        const navUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=I%20just%20scored%20${score}%20points%20on%20the%20Treasure%20Hunt%20game!%20Can%20you%20beat%20me%3F%20My%20score%20is%20${score}.`;
                        window.open(navUrl , '_blank');
                    }

                    const fb = document.getElementById('fb');
                    fb.addEventListener('click', shareOnFacebook);

                    function shareOnTwitter() {
                        const navUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=I%20just%20scored%20${score}%20points%20on%20the%20Treasure%20Hunt%20game!%20Can%20you%20beat%20me%3F%20My%20score%20is%20${score}.`;
                        window.open(navUrl , '_blank');
                    }

                    const twitter = document.getElementById('twitter');
                    twitter.addEventListener('click', shareOnTwitter);
                    totalScore = score;
                }
            }
        })
        .catch(error => console.error(error));
}

function displayLeaderboard(sessionId) {

    const leaderboardURL = TH_BASE_URL + `leaderboard?session=${sessionId}&sorted&limit=10`;

    challengesList.innerHTML = "";
    thead.innerHTML = "";
    tbody.innerHTML = "";
    answerQuestionMessage.innerHTML = "<div class=\"loader\"></div>";

    fetch(leaderboardURL)
        .then(response => response.json())
        .then(jsonObject => {
            const {status, numOfPlayers, sorted, limit, hasPrize, leaderboard, treasureHuntName} = jsonObject;
            if (status === "OK") {
                console.log("Treasure Hunt: " + treasureHuntName);
                console.log("Number of Players: " + numOfPlayers);
                console.log("Sorted: " + sorted);
                console.log("Limit: " + limit);
                console.log("Has prize: " + hasPrize);
                console.log("Leaderboard:");

                challengesList.innerHTML = "";
                answerQuestionMessage.innerHTML = "<b>Scoreboard</b>";
                buttons.innerHTML = "<a onclick=\"displayLeaderboard(\'" + sessionId + "\')\" class=\"btn\"><b>Reload</b></a>";
                buttons.innerHTML += "<a onclick=\"location.reload();\" class=\"btn\"><b>Play Again</b></a>";

                if (scanner) {
                    QRScannerStop();
                }

                if (locationArray.length > 0) {
                    document.getElementById("mapInfo").innerHTML = "<b>Your path since the beginning of the treasure hunt</b>";
                    document.getElementById("map").style.display = "block";
                    initMap();
                }

                thead.innerHTML = "<tr class=\"tr\"><th class=\"th\">Rank</th>" +
                    "<th class=\"th\">Name</th><th class=\"th\">Score</th><th class=\"th\">Completion Time</th></tr>";
                tbody.innerHTML = "";
                for (let i = 0; i < leaderboard.length; i++) {
                    const { player, score, completionTime } = leaderboard[i];
                    const completionTimeDate = completionTime === 0 ? "Unfinished" : new Date(completionTime).toLocaleString();
                    tbody.innerHTML += "<tr class=\"tr\"><td class=\"td\">" + (i + 1) + "</td><td class=\"td\">" + player + "</td>" +
                        "<td class=\"td\">" + score + "</td><td class=\"td\">" + completionTimeDate + "</td></tr>";

                    console.log(`${i + 1}. ${player} - Score: ${score}, Completion Time: ${completionTimeDate}`);
                }
            }
            else {
                console.log(status + ': ' + jsonObject.errorMessages);
            }
        })
        .catch(error => console.error(error));
}