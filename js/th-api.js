const TH_BASE_URL = "https://codecyprus.org/th/api/"; // the true API base url
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
const videoElement = document.createElement('video');
const button_qr = document.getElementById('button_qr');

let scanner = null, intervalID, map, locationArray = [], totalScore = 0, cameraIndex = 1, cameraArray;
/**
 * Fetches the list of treasure hunts from the server and displays them on the page.
 * The function sends a request to the server to get the list of treasure hunts, then
 * parses the JSON response and iterates through the treasure hunts to create an HTML
 * list of the treasure hunts. Each treasure hunt item is shown with an individual DIV
 * element, with the treasure hunt name in bold and the description in italics.
 * The function also checks if the current date and time is within the start and end
 * times of the treasure hunt, and if not, disables the button for that treasure hunt.
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
                        listHtml += "<button class='list' id=\"disabled\" onclick=\"alert('The current treasure hunt is temporarily unavailable.')\"><li>" + // each treasure hunt item is shown with an individual DIV element
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
 * Selects a treasure hunt with the given UUID and treasure name, and prompts the user for their name.
 * @param {string} uuid - The UUID of the selected treasure hunt.
 * @param {string} treasureName - The name of the selected treasure hunt.
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

/**
 * Submits the player's name and starts the treasure hunt with the given UUID and treasure name.
 * @param {string} uuid - The UUID of the selected treasure hunt.
 * @param {string} treasureName - The name of the selected treasure hunt.
 * @param {Event} event - The form submit event.
 */
function submitName(uuid, treasureName, event) {
    event.preventDefault(); // prevent the form from submitting
    const playerName = document.getElementById("name").value;
    const error = document.getElementById("error");
    start(uuid, treasureName, playerName, error);
}

/**
 * Starts the treasure hunt with the given UUID, treasure name, and player name, and displays any errors.
 * @param {string} uuid - The UUID of the selected treasure hunt.
 * @param {string} treasureName - The name of the selected treasure hunt.
 * @param {string} playerName - The name of the player.
 * @param {HTMLElement} error - The HTML element to display any errors.
 */
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

/**
 * Fetches a question from the API and displays it on the page.
 * Handles different question types and creates appropriate input elements for each type.
 * If the question can be skipped, adds a skip button.
 * If the question requires location, calls the getLocation function and sets an interval to update the location.
 * @param {string} session - The session ID.
 */
function questions(session) {
    // Define the API endpoint URL

    const questionUrl = TH_BASE_URL + `question?session=${session}`;

    challengesList.innerHTML = "<div class=\"loader\"></div>";

// Make a GET request to the API endpoint using fetch()
    fetch(questionUrl)
        .then(response => response.json()) // Parse the response as JSON
        .then(jsonObject => {
            const {
                questionText, questionType, canBeSkipped, requiresLocation, currentQuestionIndex,
                correctScore, wrongScore, skipScore
            } = jsonObject;

            console.log("Question-Text: " + questionText);
            console.log("Question-Type: " + questionType);
            console.log("Can be Skipped: " + canBeSkipped);
            console.log("Requires Location?: " + requiresLocation);
            console.log("Question index: " + currentQuestionIndex);
            console.log("Score if correct answer: " + correctScore);
            console.log("Score if wrong answer: " + wrongScore);
            console.log("Score if skip to answer: " + skipScore);

            totalScore += correctScore;
            score(session);
            buttons.innerHTML = "";

            // Call skipQuestion function
            if (canBeSkipped === true) {
                buttons.innerHTML = "<a onclick=\"skipQuestion(\'" + session + "\')\" class=\"btn\"><b>Skip</b></a>";
            }

            buttons.innerHTML += "<a href=\"#\" class=\"btn\" id=\"qr-button\"><span class=\"material-icons\">qr_code_scanner</span></a>";

            messageBox.innerHTML = "<p>" + questionText + "</p>";

            if (canBeSkipped === false) {
                messageBox.innerHTML += "<p class=\"skip_text\">Cannot be skipped!</p>";
            }

            answerQuestionMessage.innerHTML = "";

            const formSubmitHandler = (event) => {
                event.preventDefault(); // prevent the form from submitting
                if (questionType === "INTEGER" || questionType === "NUMERIC" || questionType === "TEXT") {
                    const answer = document.getElementById("answer").value;
                    answerQuestion(session, answer);
                }
            };

            const createForm = (formContent) => {
                challengesList.innerHTML = `<form id="form"><div id="center">${formContent}</div></form>`;
                let form = document.getElementById("form");
                form.addEventListener("submit", formSubmitHandler);
            };

            switch (questionType) {
                case "BOOLEAN":
                    createForm(`
                    <button type="submit" onclick="answerQuestion(\'${session}\', \'true\')" class="answer" name="answer" value="true">True</button>
                    <button type="submit" onclick="answerQuestion(\'${session}\', \'false\')" class="answer" name="answer" value="false">False</button>
                `);
                    break;
                case "INTEGER":
                case "NUMERIC":
                    createForm(`
                    <div class="input-wrapper"><label for="answer"></label>
                        <input type="${questionType === "INTEGER" ? "number" : "number"}" class="input" id="answer" name="answer" placeholder="Enter a${questionType === "INTEGER" ? "n integer" : " number"}..." ${questionType === "NUMERIC" ? 'step="0.01"' : ''} required>
                    </div>
                    <button type="submit">Submit</button>`);
                    break;
                case "MCQ":
                    createForm(`
                    <button type="submit" onclick="answerQuestion(\'${session}\', \'A\')" class="answer" name="answer" value="A">A</button>
                    <button type="submit" onclick="answerQuestion(\'${session}\', \'B\')" class="answer" name="answer" value="B">B</button>
                    <button type="submit" onclick="answerQuestion(\'${session}\', \'C\')" class="answer" name="answer" value="C">C</button>
                    <button type="submit" onclick="answerQuestion(\'${session}\', \'D\')" class="answer" name="answer" value="D">D</button>
                `);
                    break;
                case "TEXT":
                    createForm(`
                    <div class="input-wrapper"><label for="answer"></label>
                        <input type="text" class="input" id="answer" name="answer" placeholder="Answer here..." required>
                    </div>
                    <button type="submit">Submit</button>`);
                    break;
            }

            if (requiresLocation === true) {
                getLocation(session);
                intervalID = setInterval(() => { getLocation(session); }, 31000);
            } else {
                clearInterval(intervalID);
            }

            document.getElementById('qr-button').addEventListener('click', startQRCodeScanner);
        })
        .catch(error => console.error(error)); // Handle any errors
}


/**
 * Switches the camera used for scanning QR codes.
 * If there are multiple cameras available, it cycles through them.
 */
function switchCamera() {
    cameraIndex = (cameraIndex + 1) % cameraArray.length;
    scanner.start(cameraArray[cameraIndex]);
}

/**
 * Checks if the given content is a valid URL.
 * @param {string} content - The content to be checked for URL validity.
 * @returns {boolean} - Returns true if the content is a valid URL, false otherwise.
 */
function isUrl(content) {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(content);
}

/**
 * Starts the QR code scanner using the available camera(s).
 * If a scanner is already running, it stops the scanner.
 */
function startQRCodeScanner() {
    if (scanner) {
        QRScannerStop();
        return;
    }

    Instascan.Camera.getCameras()
        .then((cameras) => {
            cameraArray = cameras;
            if (cameras.length > 0) {
                // Find the back camera or use the first available camera
                const backCamera = cameras[1] || cameras[0];

                // Check if the selected camera is the front camera
                const isFrontCamera = cameras.length > 1 && backCamera === cameras[0];

                scanner = new Instascan.Scanner({
                    video: videoElement,
                    mirror: isFrontCamera, // Set mirror to true for front camera and false for back camera
                });
                scanner.start(backCamera);
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

/**
 * Stops the QR code scanner if it is running.
 * Clears the scanner instance, video element, and switch camera button.
 */
function QRScannerStop() {
    if (scanner) {
        scanner.stop();
        scanner = null;
        previewWrapper.innerHTML = '';
        button_qr.innerHTML = '';
    }
}

/**
 * Submits the user's answer to the current question in the treasure hunt game.
 * If the answer is correct, the function proceeds to the next question or
 * displays the leaderboard if the game is completed. If the answer is incorrect,
 * an error message is displayed. The user's score is also updated accordingly.
 * @param {string} sessionId - The unique identifier for the user's game session.
 * @param {string} answer - The user's answer to the current question.
 */
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
                        if (scanner) {
                            QRScannerStop();
                        }
                        questions(sessionId);

                        // Show a temporary message
                        showTemporaryMessage("Correct answer! Well done", 1500);
                    }
                    else {
                        console.log(message);
                        answerQuestionMessage.innerHTML = "<p style='color: red; background-color: #FFFFFF'>" + message + "</p>";
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

function showTemporaryMessage(message, duration) {
    const tempMessageDiv = document.createElement("div");
    tempMessageDiv.className = "temporary-message";
    tempMessageDiv.innerHTML = message;

    document.body.appendChild(tempMessageDiv);

    setTimeout(() => {
        document.body.removeChild(tempMessageDiv);
    }, duration);
}

/**
 * Initializes the map and adds a polyline and markers for each location in the locationArray.
 * The map is centered and zoomed to fit the bounds of the polyline.
 * The markers display a permanent tooltip with the location index.
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

/**
 * Checks if the browser supports geolocation and requests the user's location.
 * If the user grants permission, it calls getLocationData with the sessionId.
 * If the user denies permission or geolocation is not supported, it displays an error message.
 * @param {string} sessionId - The session ID to be used in the getLocationData function.
 */
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

/**
 * Gets the user's current location and adds it to the locationArray.
 * Sends the location data to the server using a fetch request with the provided sessionId.
 * If there is an error getting the location or sending the data, it displays an error message.
 * @param {string} sessionId - The session ID to be used in the fetch request URL.
 */
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

/**
 * Skips the current question in the treasure hunt game.
 * If the user confirms to skip the question, a request is sent to the server to update the game state.
 * If the game is completed, the leaderboard is displayed. Otherwise, the next question is loaded.
 * @param {string} sessionId - The unique identifier of the user's game session.
 */
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

/**
 * This function fetches the score of a player in a treasure hunt game session and displays it.
 * It also allows the player to share their score on Facebook and Twitter if the game is completed.
 * @param {string} sessionId - The unique identifier of the game session.
 */
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
                    messageBox.innerHTML = `<p style='color: green'>Congratulations! You have completed the treasure hunt with a score of ${score}/${totalScore}</p>`;

                    postScore.innerHTML = `<a id="fb"><i class="fa-brands fa-square-facebook"></i><span>Share</span></a>
                    <a id="twitter"><i class="fa-brands fa-square-twitter"></i><span>Share</span></a>`;

                    const shareOnFacebook = () => {
                        const navUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=I%20just%20scored%20${score}%20points%20on%20the%20Treasure%20Hunt%20game!%20Can%20you%20beat%20me%3F%20My%20score%20is%20${score}.`;
                        window.open(navUrl , '_blank');
                    }

                    const fb = document.getElementById('fb');
                    fb.addEventListener('click', shareOnFacebook);

                    const shareOnTwitter = () => {
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

/**
 * Displays the leaderboard for a given treasure hunt session.
 * Fetches the leaderboard data from the server and updates the HTML elements
 * to show the leaderboard table with player rankings, names, scores, and completion times.
 * Also provides options to reload the leaderboard or play the game again.
 * @param {string} sessionId - The session ID of the treasure hunt.
 */
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