const TH_BASE_URL = "https://codecyprus.org/th/api/"; // the true API base url
const TH_TEST_URL = "https://codecyprus.org/th/test-api/"; // the test API base url

/**
 * An asynchronous function to realize the functionality of getting the available 'treasure hunts' (using /list) and
 * processing the result to update the HTML with a bullet list with the treasure hunt names and descriptions. Also,
 * for each treasure hunt in the bullet list, a link is shown to trigger another function, the 'select'.
 * @return {Promise<void>}
 */
/*async function doList() {

    // call the web service and await for the reply to come back and be converted to JSON
    const reply = await fetch(TH_BASE_URL + "list");
    const json = await reply.json();

    // identify the spinner, if available, using the id 'loader'...
    let spinner = document.getElementById("loader");
    // .. and stop it (by hiding it)
    spinner.hidden = true;

    // access the "treasureHunts" array on the reply message
    let treasureHuntsArray = json.treasureHunts;
    let listHtml = "<ul>"; // dynamically form the HTML code to display the list of treasure hunts
    for(let i = 0; i < treasureHuntsArray.length; i++) {
        listHtml += // each treasure hunt item is shown with an individual DIV element
            "<li>" +
            "<b>" + treasureHuntsArray[i].name + "</b><br/>" + // the treasure hunt name is shown in bold...
            "<i>" + treasureHuntsArray[i].description + "</i><br/>" + // and the description in italics in the following line
            "<a href=\"javascript:select(\'" + treasureHuntsArray[i].uuid + "\')\">Start</a>" + // and the description in italics in the following line
            "</li>";
    }
    listHtml += "</ul>";
    // update the DOM with the newly created list
    document.getElementById("treasureHunts").innerHTML = listHtml;
}*/

const challengesList = document.getElementById('treasureHunts');
const answerQuestionMessage = document.getElementById('answerQuestionMessage');
const messageBox = document.getElementById('message');
const buttons = document.getElementById('buttons');
const thead = document.getElementById('thead');
const tbody = document.getElementById('tbody');
const title = document.getElementById('logo');

function getChallenges() {
    fetch("https://codecyprus.org/th/api/list")
        .then(response => response.json()) //Parse JSON text to JavaScript object
        .then(jsonObject => {
            challengesList.innerText = "Loaded!";
            const { status, treasureHunts } = jsonObject;
            if (jsonObject.status === "OK") {
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
                        listHtml += "</ul>";
                    }
                    if(currentDateTime.getTime() < startsOn){
                        listHtml += "<button class='list' id=\"disabled\"><li>" + // each treasure hunt item is shown with an individual DIV element
                            "<b id='bold_text'>" + name + "</b><br/><br/>" + // the treasure hunt name is shown in bold...
                            "<i>" + description + "</i><br/>" + // and the description in italics in the following line
                            "Starts: " + timeLeftToStart + "</li></button>";// and the description in italics in the following lin
                        listHtml += "</ul>";
                    }
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
 *
 * @param uuid this is the argument that corresponds to the UUID of the selected treasure hunt.
 * @param treasureName
 * @return {Promise<void>}
 */
function select(uuid, treasureName) {

    console.log("Selected treasure hunt with UUID: " + uuid);
    console.log(treasureName);

    buttons.innerHTML = "<a onclick=\"\" class=\"btn\"><b>Enter Code</b></a>";
    messageBox.innerHTML = "<p>We are looking for the '" + treasureName + "' treasure. Now tell us your name and " +
        "email, and we are ready to go!</p>";
    challengesList.innerHTML = "<form id=\"form\"><h2>Team</h2><br/><div id=\"center\"><label for=\"name\"><b>Name</b></label>" +
        "<br/><input type=\"text\" class=\"input\" id=\"name\" name=\"name\" placeholder=\"Enter your name\" required><br/><br/>" +
        "<label for=\"email\"><b>Email</b></label><br/><input type=\"email\" class=\"input\" id=\"email\" name=\"email\" placeholder=\"Enter your email\">" +
        "<br/><div id=\"error\"></div><button type=\"submit\">Submit</button></div></form>";
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const form = document.getElementById("form");
    const error = document.getElementById("error");
    form.addEventListener("submit", function start(event) {
        event.preventDefault(); // prevent the form from submitting

        const playerName = document.getElementById("name").value;
        const email = document.getElementById("email").value;

        // do something with the name and email values, such as sending them to a server

        const startUrl = `https://codecyprus.org/th/api/start?player=${playerName}&app=${treasureName}&treasure-hunt-id=${uuid}`;

        fetch(startUrl)
            .then(response => response.json())
            .then(jsonObject => {
                const {status, numOfQuestions, session} = jsonObject;
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
    });
}

function questions(session) {
    // Define the API endpoint URL

    const questionUrl = `https://codecyprus.org/th/api/question?session=${session}`;

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

            buttons.innerHTML += "<a onclick=\"\" class=\"btn\"><b>QR</b></a>";
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
                setInterval(getLocation, 31000, session);
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


        })
        .catch(error => console.error(error)); // Handle any errors
}

function answerQuestion(sessionId, answer) {
    const answerUrl = `https://codecyprus.org/th/api/answer?session=${sessionId}&answer=${encodeURIComponent(answer)}`;

    fetch(answerUrl)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, correct, completed, message, scoreAdjustment } = jsonObject;
            if (status === "OK") {
                if (completed) {
                    console.log("Congratulations, you have completed the treasure hunt!");
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

// Get location
function getLocation(sessionId) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const locationUrl = `https://codecyprus.org/th/api/location?session=${sessionId}&latitude=${latitude}&longitude=${longitude}`;
            fetch(locationUrl)
                .then(response => response.json())
                .then(jsonObject => {
                    const { status, message } = jsonObject;
                    console.log(status, message);
                })
                .catch(error => console.error(error));
        });
    }
    else {
        console.error("Geolocation is not supported by your browser.");
    }
}

// Skip question function
function skipQuestion(sessionId) {

    if(confirm("Are you sure you want to skip the current question?")) {
        const skipURL = `https://codecyprus.org/th/api/skip?session=${sessionId}`;

        console.log("\n");
        fetch(skipURL)
            .then(response => response.json())
            .then(jsonObject => {
                const {status, completed, message, scoreAdjustment} = jsonObject;
                if (status === "OK") {
                    console.log("Completed:" + completed);
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

    const scoreURL = `https://codecyprus.org/th/api/score?session=${sessionId}`;

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

    const leaderboardURL = `https://codecyprus.org/th/api/leaderboard?session=${sessionId}&sorted&limit=10`;

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
                buttons.innerHTML = "<a onclick=\"displayLeaderboard(\'" + sessionId + "\')\" class=\"btn\"><b>Reload</b></a>";
                buttons.innerHTML += "<a onclick=\"select(\'" + sessionId + "\' ,\'" + treasureHuntName + "\')\" class=\"btn\"><b>Play Again</b></a>";
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



