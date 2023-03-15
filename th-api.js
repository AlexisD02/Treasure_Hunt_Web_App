const TH_BASE_URL = "https://codecyprus.org/th/api/"; // the base URL for the true treasure hunt API
const TH_TEST_URL = "https://codecyprus.org/th/test-api/"; // the base URL for the test treasure hunt API
const url = "https://alexisd02.github.io/CO1111/"; // the URL for a web page

const challengesList = document.getElementById('treasureHunts'); // a reference to an HTML element with an ID of treasureHunts
const answerQuestionMessage = document.getElementById('answerQuestionMessage'); // a reference to an HTML element with an ID of answerQuestionMessage
const messageBox = document.getElementById('message'); // a reference to an HTML element with an ID of message
const buttons = document.getElementById('buttons'); // a reference to an HTML element with an ID of buttons
const thead = document.getElementById('thead'); // a reference to an HTML element with an ID of thead
const tbody = document.getElementById('tbody'); // a reference to an HTML element with an ID of tbody
const title = document.getElementById('logo'); // a reference to an HTML element with an ID of logo
const previewWrapper = document.getElementById('preview_wrapper'); // a reference to an HTML element with an ID of preview_wrapper
const postScore = document.getElementById('postScore'); // a reference to an HTML element with an ID of postScore

const videoElement = document.createElement('video'); // an HTML video element created using document.createElement() function

let scanner = null, intervalID, map, locationArray = [], totalScore = 0;

/**
 * The function getChallenges() is an asynchronous function that sends an HTTP GET request to the treasure hunt API at the
 * URL listUrl and then processes the response using response.json(). If the response status is "OK", the function loops
 * through the treasureHunts array and creates HTML elements for each treasure hunt, including buttons to select each hunt.
 * The buttons have an onclick attribute which calls the select() function with the corresponding treasure hunt's UUID
 * and name as arguments. If the current date and time is before the treasure hunt's startsOn time, the button is disabled
 * and shows the startsOn time instead of the endsOn time. The HTML elements are added to the challengesList element.
 */
getChallenges();
function getChallenges() {
    const listUrl = TH_BASE_URL + `list`;

    fetch(listUrl)
        .then(response => response.json()) //Parse JSON text to JavaScript object
        .then(jsonObject => {
            challengesList.innerText = "";
            const { status, treasureHunts } = jsonObject;
            if (status === "OK") {
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
                        listHtml += "<button class='list' id=\"disabled\" onclick=\"alert('This treasure hunt has not started yet, but will start soon.')\"><li>" + // each treasure hunt item is shown with an individual DIV element
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

/**
 * When the select function is called with an uuid and a treasureName argument, it logs a message to the console indicating
 * that a particular treasure hunt has been selected. Then, it sets the innerHTML of several HTML elements to empty strings,
 * effectively clearing their content. It sets the messageBox element's innerHTML to a message asking the user to enter
 * their name to start the game, and it sets the challengesList element's innerHTML to an HTML form containing a single
 * input field for the user's name. Finally, it adds an event listener to the form's submit button that calls the submitName
 * function when the button is clicked.
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
 * The submitName function is called when the user submits their name via the form's submit button.
 * It prevents the form from submitting normally (which would reload the page), retrieves the value of the name input field,
 * and calls the start function with the uuid, treasureName, playerName, and error arguments.
 */
function submitName(uuid, treasureName, event) {
    event.preventDefault(); // prevent the form from submitting
    const playerName = document.getElementById("name").value;
    const error = document.getElementById("error");
    start(false, uuid, treasureName, playerName);
}

/**
 * The start function constructs a URL to start the treasure hunt game by appending various query parameters to a base URL
 * (TH_BASE_URL). It uses the fetch API to make a GET request to the constructed URL and retrieve a JSON response.
 * If the response's status field is "OK", the function logs a message indicating that the game has started and the number
 * of questions to be answered, and calls the questions function to start the first question. If the response's status
 * field is not "OK", the function logs an error message and displays the first error message in the errorMessages field
 * of the JSON response in the error element.
 */

let start_hunt = document.getElementById("tH");
function start(test, uuid, treasureName, playerName) {
    let startUrl;

    let table = "<table class='table-style'>";

    if (test === true) {
        startUrl = TH_TEST_URL + `start?player=${playerName}&app=${treasureName}&treasure-hunt-id=${uuid}`;
    }

    if (test === false) {
        startUrl = TH_BASE_URL + `start?player=${playerName}&app=${treasureName}&treasure-hunt-id=${uuid}`;
    }

    fetch(startUrl)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, numOfQuestions, session, errorMessages} = jsonObject;
            if (status === "OK") {
                console.log(`Treasure hunt started with session ID: ${session}`);
                console.log(`Total number of questions: ${numOfQuestions}`);
                questions(false, session);
            }
            /*else {
                error.innerHTML = jsonObject.errorMessages[0];
                console.log(status, jsonObject.errorMessages[0]);
            }*/

            if (status === "ERROR") {
                if (playerName === null) {
                    table += "<td>" + errorMessages[0] + "</td>";
                    table += "<td>" + "Treasure-hunt Name: " + treasureName + "</td>";
                    table += "<td>" + "Treasure-hunt Id: " + uuid + "</td>";
                    table += "<td><img src='" + (null ? 'images/correct.png' : 'images/wrong.png') + "' alt='Success or failed icon'/>";
                }
                else if (treasureName === null) {
                    table += "<td>" + "Player Name: " + playerName + "</td>";
                    table += "<td>" + errorMessages[1] + "</td>";
                    table += "<td>" + "Treasure-hunt Id: " + uuid + "</td>";
                    table += "<td><img src='" + (null ? 'images/correct.png' : 'images/wrong.png') + "' alt='Success or failed icon'/>";
                }
                else if (uuid === null) {
                    table += "<td>" + "Player Name: " + playerName + "</td>";
                    table += "<td>" + "Treasure-hunt Name: " + treasureName + "</td>";
                    table += "<td>" + errorMessages[2] + "</td>";
                    table += "<td><img src='" + (null ? 'images/correct.png' : 'images/wrong.png') + "' alt='Success or failed icon'/>";
                }
                // If none of the variables are null, add their values to the table
                else {
                    table += "<td>" + "Player Name: " + playerName + "</td>";
                    table += "<td>" + "Treasure-hunt Name: " + treasureName + "</td>";
                    table += "<td>" + "Treasure-hunt Id: " + uuid + "</td>";
                    table += "<td><img src='" + ('images/correct.png') + "' alt='Success or failed icon'/>";
                }

                // Close the table tag
                table += "</table>";

                // Add the table to the start_hunt element
                start_hunt.innerHTML += table;
                console.log(errorMessages);
                console.log(temp_list);

            }
        })
        .catch(error => console.error(error));
}

function questions(test, session, test_question_type) {
    // Define the API endpoint URL
    let questionsUrl;

    if (test === true) {
        questionsUrl = TH_TEST_URL + "question?question-type=" + test_question_type +"&can-be-skipped=true&requires-location=true";
    }

    if (test === false) {
        questionsUrl = TH_BASE_URL + `question?session=${session}`;
    }

    // Make a GET request to the API endpoint using fetch()
    fetch(questionsUrl)
        .then(response => response.json()) // Parse the response as JSON
        .then(jsonObject => {
            const { questionText, questionType, canBeSkipped, requiresLocation, currentQuestionIndex,
                correctScore, wrongScore, skipScore } = jsonObject;

            console.log("Can be Skipped: " + canBeSkipped);

            totalScore += correctScore;
            score(false, session);
            buttons.innerHTML = "";
            // Call skipQuestion function
            if(canBeSkipped === true) {
                buttons.innerHTML = "<a onclick=\"skipQuestion(\'" + session + "\')\" class=\"btn\"><b>Skip</b></a>";
            }

            buttons.innerHTML += "<a href=\"#\" class=\"btn\" id=\"qr-button\"><span class=\"material-icons\">qr_code_scanner</span></a>";
            buttons.innerHTML += "<a onclick=\"\" class=\"btn\"><b>Menu</b></a>";

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

            document.getElementById('qr-button').addEventListener('click', () => {
                if (scanner) {
                    QRScannerStop();
                    return;
                }

                function isUrl(content) {
                    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
                    return urlRegex.test(content);
                }

                Instascan.Camera.getCameras().then((cameras) => {
                    if (cameras) {
                        if (cameras[1]) {
                            scanner = new Instascan.Scanner({
                                video: videoElement,
                                mirror: false
                            });
                            scanner.start(cameras[1]);
                        }
                        else {
                            scanner = new Instascan.Scanner({
                                video: videoElement,
                                mirror: true // flip video horizontally
                            });
                            scanner.start(cameras[0]);
                        }
                        scanner.addListener('scan', (content) => {
                            if (isUrl(content)) {
                                answerQuestionMessage.innerHTML = "<a href='" + content + "' target='_blank'>Click to view</a>";
                            }
                            else {
                                answerQuestionMessage.innerHTML = "";
                            }
                            document.getElementById('answer').value = content;
                            QRScannerStop();
                        });
                        previewWrapper.appendChild(videoElement);
                    }
                    else {
                        console.error('No cameras found.');
                        alert("No cameras found");
                    }
                }).catch((error) => {
                    console.error(error);
                    alert("Camera access has been denied. Please enable your camera or search for a device with a camera.");
                });
            });

        })
        .catch(error => console.error(error)); // Handle any errors
}

function QRScannerStop() {
    scanner.stop();
    scanner = null;
    previewWrapper.innerHTML = '';
}

/**
 * This code defines a function answerQuestion that takes two arguments: sessionId and answer. This function is used to
 * answer a question in the treasure hunt game. The fetch function is then used to send a GET request to the answer URL.
 * The response is then parsed as JSON using the response.json() method. The JSON object is destructured to extract status,
 * correct, completed, message, and scoreAdjustment properties. If the status property is equal to "OK", the function checks
 * whether the treasure hunt is completed or not. If the treasure hunt is completed, the function displays a "Congratulations"
 * message, stops the interval timer, and displays the leaderboard by calling the displayLeaderboard function. Otherwise,
 * if the answer is correct, the function displays a "Correct answer" message, stops the QR scanner if it is running,
 * and calls the questions function to get the next question. If the answer is incorrect, the function displays an error message.
 * In all cases, the function logs the scoreAdjustment to the console and calls the score function to display the current
 * score for the treasure hunt. If the status property is not equal to "OK", the function logs the status property to the console.
 */
function answerQuestion(test, sessionId, answer, correct, completed) {
    let answerUrl;

    if (test === true) {
        answerUrl = TH_TEST_URL + `answer?correct=${correct}&completed=${completed}&${sessionId}`;
    }

    if (test === false) {
        answerUrl = TH_BASE_URL + `answer?session=${sessionId}&answer=${encodeURIComponent(answer)}`;

    }

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
                score(false, sessionId);
            }
            else {
                console.log(status);
            }
        })
        .catch(error => console.error(error));
}

/**
 * The function initMap() initializes and displays a Leaflet map, adds a polyline layer to represent a path, and adds
 * markers with tooltips for each location in locationArray.
 * First, the function checks if the map variable is already defined. If it is not, the function initializes the map
 * variable using Leaflet and sets the initial view to a center point of [0, 0] with a zoom level of 2. Then, a tile layer
 * from OpenStreetMap is added to the map.
 * Next, a polyline layer is created using the locationArray parameter, which is an array of coordinates representing
 * the path to display on the map. The polyline layer is added to the map using Leaflet's addTo() method. The getBounds()
 * method is called on the polyline layer to fit the map's view to the bounds of the path.
 * After that, a marker is added to the map for each location in locationArray. The forEach() method is used to iterate
 * through the array, and for each location, a marker is created using Leaflet's L.marker() method and added to the map
 * using the addTo() method. A tooltip is then bound to the marker using the bindTooltip() method, displaying the label
 * "Location" followed by the index of the location in locationArray. The permanent option is set to true so that the
 * tooltip is always displayed, and the direction option is set to 'top' to display the tooltip above the marker.
 * Finally, the offset option is set to [-14, -10] to position the tooltip 14 pixels to the left and 10 pixels up from
 * the top center of the marker.
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
 * The function getLocation() is responsible for obtaining the user's geolocation data and passing it on to the
 * getLocationData() function. It first checks if the browser supports geolocation by checking for the
 * navigator.permissions and navigator.permissions.query properties. If these properties are not available, it logs an
 * error message and displays an alert to the user. If the browser does support geolocation, it then checks the current
 * permission state for geolocation using navigator.permissions.query({ name: 'geolocation' }).
 * If the permission state is already "granted", meaning the user has already given permission for the app to access
 * their location, it calls getLocationData() directly. If the permission state is "prompt", meaning the user
 * has not yet decided whether to grant permission, it logs a message and displays an alert to the user requesting that
 * they enable location services for the app. It then calls navigator.geolocation.getCurrentPosition() to prompt the user
 * to grant permission. If the user grants permission, it calls getLocationData(); if the user denies permission,
 * it logs a message and displays an alert to the user. If the permission state is anything other than "granted" or "prompt",
 * it logs a message and displays an alert to the user stating that location services are not available.
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
 * The function getLocationData() retrieves the current location of the user and sends a request to the server
 * to update the user's location.
 * It uses the navigator.geolocation.getCurrentPosition() method to obtain the user's current latitude and longitude
 * coordinates. It then pushes these coordinates to the locationArray array, which is used to display a path of the user's
 * location history on the map.
 * Next, it constructs the locationUrl by concatenating the session ID and the latitude and longitude coordinates of the user,
 * and sends a fetch() request to the server using this URL. The response from the server is parsed as a JSON object.
 * If the request is successful, the function logs the status and message from the server's response. If there is an error,
 * the function logs the error message and displays an alert to the user.
 * Overall, this function updates the user's location and sends a request to the server to update the user's location data.
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
 * The skipQuestion() function prompts the user with a confirmation message and then sends a request to skip the current
 * question in the treasure hunt game.
 * First, it displays a confirmation dialog box asking the user if they are sure they want to skip the current question.
 * If the user confirms, the function constructs a URL to skip the question for the current session by appending the
 * "sessionId" to the base URL with the skip endpoint. It then uses the fetch() function to send a request to the URL.
 * The response from the server is then parsed as JSON and the status, completed, message, and scoreAdjustment properties
 * are extracted from the response object.
 * If the status property is "OK", the function checks whether the completed property is true. If so, it means that the
 * user has completed the treasure hunt game and the displayLeaderboard() function is called to display the leaderboard.
 * If completed is false, the function logs the message and scoreAdjustment to the console and calls the questions()
 * function to display the next question.
 * If the user cancels the confirmation dialog box, the function does nothing.
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

function score(test, sessionId, test_score) {
    let scoreUrl;

    if (test === true) {
        scoreUrl = TH_TEST_URL + `score?score=${test_score}`;
    }

    if (test === false) {
        scoreUrl = TH_BASE_URL + `score?session=${sessionId}`;

    }

    console.log("Score-section\n");
    fetch(scoreUrl)
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
                        const navUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=I%20just%20scored%20${score}%20points%20on%20the%20Treasure%20Hunt%20game!%20Can%20you%20beat%20me%3F`;
                        window.open(navUrl , '_blank');
                    }

                    const fb = document.getElementById('fb');
                    fb.addEventListener('click', shareOnFacebook);

                    function shareOnTwitter() {
                        const navUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=I%20just%20scored%20${score}/${totalScore}%20points%20on%20the%20Treasure%20Hunt%20game!%20Can%20you%20beat%20me%3F`;
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

function displayLeaderboard(test, sessionId, sorted, size) {
    let leaderboardUrl;

    if (test === true) {
        return TH_TEST_URL + `leaderboard?${sorted}&size=${size}`;
    }

    if (test === false) {
        leaderboardUrl = TH_BASE_URL + `leaderboard?session=${sessionId}&sorted&limit=10`;

    }

    fetch(leaderboardUrl)
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