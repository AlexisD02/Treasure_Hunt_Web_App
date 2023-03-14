//const TH_BASE_URL = "https://codecyprus.org/th/api/"; // the true API base url
//const TH_TEST_URL = "https://codecyprus.org/th/test-api/"; // the test API base url
//const challengesList = document.getElementById('treasureHunts');
//const answerQuestionMessage = document.getElementById('answerQuestionMessage');


//const title = document.getElementById('logo');
//const previewWrapper = document.getElementById('preview_wrapper');
//const videoElement = document.createElement('video');
//let scanner = null, intervalID, map, locationArray = [];

/**
 * An asynchronous function to realize the functionality of getting the available 'treasure hunts' (using /list) and
 * processing the result to update the HTML with a bullet list with the treasure hunt names and descriptions. Also,
 * for each treasure hunt in the bullet list, a link is shown to trigger another function, the 'select'.
 */
// Clear treasure list


function handleTestList() {
    let input_number = document.getElementById("user_input").value;

    const listUrl = TH_TEST_URL + `list?number-of-ths=${input_number}`;

    fetch(listUrl)
        .then(response => response.json()) //Parse JSON text to JavaScript object
        .then(jsonObject => {
            const { status, treasureHunts } = jsonObject;
            if (status === "OK") {
                console.log(treasureHunts);
                const currentDateTime = new Date(); // Create a new Date object representing the current date and time
                console.log(currentDateTime.toLocaleString());

                challengesList.innerHTML = "";

                for (let i = 0; i < treasureHunts.length; i++) {
                    const { endsOn, startsOn, uuid, name, description } = treasureHunts[i];
                    const timeLeftToEnd = new Date(endsOn).toLocaleString();
                    const timeLeftToStart = new Date(startsOn).toLocaleString();
                    let listHtml = "<ul class='lists'>";
                    if(currentDateTime.getTime() >= startsOn && currentDateTime.getTime() <= endsOn) {
                        listHtml += "<button class='list' onclick=\"handleTestStart(\'" + uuid + "\', \'" + name + "\')\"><li>" + // each treasure hunt item is shown with an individual DIV element
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
//--------------
/**
 * This function is called when a particular treasure hunt is selected. This is merely a placeholder as you're expected
 * to realize this function-or an equivalent-to perform the necessary actions after a treasure hunt is selected.
 */

// handleTestStart test cases
/*let start_test_cases = [
    { player: "A", treasure_name: "treasure-hunt1", id: "id1" },
    { player: "B", treasure_name: "", id: "id2" },
    { player: "", treasure_name: "treasure-hunt2", id: "id3" },
    { player: "C", treasure_name: "treasure-hunt3", id: ""}
]

const messageBox = document.getElementById('message');
const buttons = document.getElementById('buttons');
const thead = document.getElementById('thead');
const tbody = document.getElementById('tbody');*/

let start_test_cases = [
    { player: "A", treasure_name: "treasure-hunt1", id: "id1" },
    { player: "B", treasure_name: null, id: "id2" },
    { player: null, treasure_name: "treasure-hunt2", id: "unknown" },
    { player: "C", treasure_name: "treasure-hunt3", id: null }
]

function handleTestStart() {
    start_hunt.innerHTML = "Results";

    for (let i = 0; i < start_test_cases.length; i++) {
        start(true, start_test_cases[i].id, start_test_cases[i].treasure_name, start_test_cases[i].player);
    }

}

//--------------
// Test Question
function handleTestQuestion() {
    let type = document.getElementById('question-type').value; // Get selected option
    questions(true, "steadfast", type, true, true, true); // Call function from main program
}

// Clear question when 'Clear' button is clicked
function clearTestQuestion() {
    let clear_button = document.getElementById('buttons');
    clear_button.innerHTML = "Questions to show up here...";

    let clear_message = document.getElementById('message');
    clear_message.innerHTML = "";

    let clear_text = document.getElementById('loaded-lists');
    clear_text.innerHTML = "";

    let clear_treasure_hunts = document.getElementById('treasureHunts');
    clear_treasure_hunts.innerHTML = "";
}

//--------------
let answer_test_cases = [
    {session: "test-session1", correct: true, completed: false},
    {session: "test-session2", correct: false, completed: false},
    {session: "test-session3", correct: true, completed: true},
    {session: "test-session4", correct: false, completed: true}
]

// Test Answer
function handleTestAnswer() {
    let clear_message = document.getElementById('answer');
    clear_message.innerHTML = "";

    let clear_answer_question = document.getElementById('answerQuestionMessage');
    clear_answer_question.innerHTML = "";

    let loaded_lists = document.getElementById('loaded-lists');
    loaded_lists.innerHTML = "";

    let treasure_hunts = document.getElementById('treasureHunts');
    treasure_hunts.innerHTML = "";


    let answer_true = document.getElementById('answer-true');
    let answer_false = document.getElementById('answer-false');

    if (answer_true.checked) {
        answerQuestion(true, "testing-session", answer, true, false);
    }
    else if (answer_false.checked) {
        answerQuestion(true, "testing-session", answer, false, false);
    }
}

// Clear answer when 'Clear' button is clicked
function clearTestAnswer() {
    let clear_message = document.getElementById('answer');
    clear_message.innerHTML = "Answer text to show up here...";

    let clear_answer_question = document.getElementById('answerQuestionMessage');
    clear_answer_question.innerHTML = "";

    let loaded_lists = document.getElementById('loaded-lists');
    loaded_lists.innerHTML = "";

    let treasure_hunts = document.getElementById('treasureHunts');
    treasure_hunts.innerHTML = "";
}
//--------------
function handleTestScore() {
    let element_score = document.getElementById('logo');
    element_score.innerHTML = "";
    let user_score = document.getElementById('user-score').value;
    score(true, "random-session", user_score);
}
//--------------
// Test leaderboard
function handleTestLeaderboard() {
    let leaderboard_input = document.getElementById('leaderboard-input').value; // Get input from the user
    let leaderboard_data = document.getElementById('leaderboard-data');

    let sort_true = document.getElementById('leaderboard-sort-true');
    let sort_false = document.getElementById('leaderboard-sort-false');

    let leaderboard_id = document.getElementById("leaderboard");

    // Check checked if either true of false box is selected
    let test_leaderboard_api
    if (sort_true.checked) {
        test_leaderboard_api = `https://codecyprus.org/th/test-api/leaderboard?sorted&hasPrize&size=${leaderboard_input}`;
    }
    else if (sort_false.checked) {
        test_leaderboard_api = `https://codecyprus.org/th/test-api/leaderboard?sorted=false&hasPrize&size=${leaderboard_input}`;
    }

    // Fetch information from the test api
    fetch(test_leaderboard_api)
        .then(response => response.json())
        .then(jsonObject => {
            const {status, numOfPlayers, sorted, limit, hasPrize, leaderboard, treasureHuntName} = jsonObject;
            if (status === "OK") {
                leaderboard_id.innerHTML = `Number of players: ${numOfPlayers}<br>`;
                leaderboard_id.innerHTML += `Sorted: ${sorted}<br><br>`;
                leaderboard.forEach(player => {
                    let row = document.createElement("tr");

                    let playerData = document.createElement("td");
                    playerData.style.paddingRight = "50px";
                    playerData.innerText = "Player: " + player.player;

                    let scoreData = document.createElement("td");
                    scoreData.style.paddingRight = "50px";
                    scoreData.innerText = "Score: " + player.score;

                    let completionTimeData = document.createElement("td");
                    completionTimeData.style.paddingRight = "50px";
                    completionTimeData.innerText = "Completion Time: " + player.completionTime;

                    row.appendChild(playerData);
                    row.appendChild(scoreData);
                    row.appendChild(completionTimeData);

                    leaderboard_data.appendChild(row);
                });
            }
        })
}

// Clear leaderboard when 'Clear' button is clicked
function clearTestLeaderboard () {
    let clear_leaderboard = document.getElementById('leaderboard');
    clear_leaderboard.innerHTML = "Leaderboard to show up here...";

    let clear_leaderboard_data = document.getElementById('leaderboard-data');
    clear_leaderboard_data.innerHTML = "";
}

/*

function questions(session) {
    // Define the API endpoint URL

    const questionUrl = TH_BASE_URL + `question?session=${session}`;

    // Make a GET request to the API endpoint using fetch()
    fetch(questionUrl)
        .then(response => response.json()) // Parse the response as JSON
        .then(jsonObject => {
            const { questionText, questionType, canBeSkipped, requiresLocation, currentQuestionIndex,
                correctScore, wrongScore, skipScore } = jsonObject;

            console.log("Can be Skipped: " + canBeSkipped);

            score(session);
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

                scanner = new Instascan.Scanner({ video: videoElement });
                scanner.addListener('scan', (content) => {
                    if (isUrl(content)) {
                        answerQuestionMessage.innerHTML = "<a href='" + content + "' target='_blank'>Click to view</a>";
                    }
                    document.getElementById('answer').value = content;
                    QRScannerStop();
                });
                Instascan.Camera.getCameras().then((cameras) => {
                    if (cameras.length > 0) {
                        scanner.start(cameras[0]);
                        previewWrapper.appendChild(videoElement);
                    } else {
                        console.error('No cameras found.');
                    }
                }).catch((error) => {
                    console.error(error);
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

/!*
*To add the location updates to the minimap using Leaflet library, you can follow these steps:

* Define a global variable map to store the map object and initialize it in the initMap() function only if it is undefined.
* Define a global variable locationArray to store the locations visited by the user.
* In the getLocation() function, push the new location to the locationArray and call the updateMap()
* function to add the location to the minimap.
* Define the updateMap() function to draw the path between the locations and update the map with markers and the path.
* In the initMap() function, initialize the map and add the path layer to it.

*!/
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
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            locationArray.push([latitude, longitude]);
            const locationUrl = TH_BASE_URL + `location?session=${sessionId}&latitude=${latitude}&longitude=${longitude}`;
            fetch(locationUrl)
                .then(response => response.json())
                .then(jsonObject => {
                    const { status, message } = jsonObject;
                    console.log(status, message);
                })
                .catch(error => console.error(error));
        });
    } else {
        console.error("Geolocation is not supported by your browser.");
    }
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
            }
        })
        .catch(error => console.error(error));
}

function displayLeaderboard(sessionId) {

    const leaderboardURL = TH_BASE_URL + `leaderboard?session=${sessionId}&sorted&limit=10`;

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
                messageBox.innerHTML = "<p><b>Scoreboard</b></p>";
                challengesList.innerHTML = "";
                answerQuestionMessage.innerHTML = "";
                buttons.innerHTML = "<a onclick=\"displayLeaderboard(\'" + sessionId + "\')\" class=\"btn\"><b>Reload</b></a>";
                buttons.innerHTML += "<a onclick=\"location.reload();\" class=\"btn\"><b>Play Again</b></a>";

                if (scanner) {
                    QRScannerStop();
                }

                // add event listener to show map button
                document.getElementById("map").style.display = "block";
                if (locationArray.length > 0) {
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
}*/
