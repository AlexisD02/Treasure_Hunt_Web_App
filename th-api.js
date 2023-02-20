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

function getChallenges() {
    fetch("https://codecyprus.org/th/api/list")
        .then(response => response.json()) //Parse JSON text to JavaScript object
        .then(jsonObject => {
            challengesList.innerText = "Loaded!";
            if (jsonObject.status === "OK") {
                const treasureHuntsArray = jsonObject.treasureHunts;
                console.log(treasureHuntsArray);
                for (let i = 0; i < treasureHuntsArray.length; i++) {
                    let listHtml = "<ul class='lists'>";
                    const weeks_left = Math.floor(treasureHuntsArray[i].endsOn / 604800); // from sec to weeks
                    listHtml += "<button class='list' onclick=\"select(\'" + treasureHuntsArray[i].uuid + "\', \'" + treasureHuntsArray[i].name + "\')\"><li>" + // each treasure hunt item is shown with an individual DIV element
                        "<b id='bold_text'>" + treasureHuntsArray[i].name + "</b><br/><br/>" + // the treasure hunt name is shown in bold...
                        "<i>" + treasureHuntsArray[i].description + "</i><br/>" + // and the description in italics in the following line
                        "Ends in: " + weeks_left + " weeks</li></button>";// and the description in italics in the following lin
                    challengesList.innerHTML += listHtml;
                    listHtml += "</ul>";
                }
            }
            else {
                console.log("ERROR");
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
const messageStart = document.getElementById('messageStart');
function select(uuid, treasureName) {

    //window.location.href = "start_css.html";

    console.log("Selected treasure hunt with UUID: " + uuid);
    console.log(treasureName);
    // todo add your own code ...

    //messageStart.innerHTML += "<p> This is '" + treasureName + "' treasure. Now tell us your " +
        //"name and email, and we are ready to go!</p>";

    const playerName = prompt("Please enter your name or nickname:");
    const startUrl = `https://codecyprus.org/th/api/start?player=${playerName}&app=${treasureName}&treasure-hunt-id=${uuid}`;

    fetch(startUrl)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, numOfQuestions, session } = jsonObject;
            if(status === "OK") {
                console.log(`Treasure hunt started with session ID: ${session}`);
                console.log(`Total number of questions: ${numOfQuestions}`);
                questions(session);
            }
            else{
                console.log(status);
            }
        })
        .catch(error => console.error(error));
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
            // Log the retrieved question and its details to the console
            console.log("Question-Text: " + questionText);
            console.log("Question-Type: " + questionType);

            console.log("Can be Skipped: " + canBeSkipped);
            // Call skipQuestion function
            //if(canBeSkipped === true) {
                //skipQuestion(session);
            //}

            console.log("Requires Location?: " + requiresLocation);
            //if(requiresLocation === true){
                getLocation(session);
                setInterval(getLocation, 31000, session);
            //}

            console.log("Question index: " + currentQuestionIndex);
            console.log("Score if correct answer: " + correctScore);
            console.log("Score if wrong answer: " + wrongScore);
            console.log("Score if skip to answer: " + skipScore);
            answerQuestion(session, prompt("Enter an answer:"));
            displayLeaderboard(session);

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
                if (correct) {
                    console.log("Correct answer! " + message);
                    console.log("Score adjustment: " + scoreAdjustment);
                    questions(sessionId);
                }
                else {
                    console.log(message);
                    console.log("Score adjustment: " + scoreAdjustment);
                    questions(sessionId);
                }
                if (completed) {
                    console.log("Congratulations, you have completed the treasure hunt!");
                    //displayLeaderboard(sessionId);
                }
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

    const skipURL = `https://codecyprus.org/th/api/skip?session=${sessionId}`;

    console.log("\n");
    fetch(skipURL)
        .then(response => response.json())
        .then(jsonObject => {
            const {status, completed, message, scoreAdjustment} = jsonObject;
            if (status === "OK") {
                console.log("Completed:" + completed);
                console.log("Message:" + message);
                console.log("Score-Adjustment: " + scoreAdjustment);
            }
        })
        .catch(error => console.error(error));
}

function score(sessionId) {

    const scoreURL = `https://codecyprus.org/th/api/score?session=${sessionId}`;

    console.log("Score-section\n");
    fetch(scoreURL)
        .then(response => response.json())
        .then(jsonObject => {
            const {status, completed, finished, player, score} = jsonObject;
            if (status === "OK") {
                console.log("Completed:" + completed);
                console.log("Finished:" + finished);
                console.log("Player:" + player);
                console.log("Score:" + score);
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
                for (let i = 0; i < leaderboard.length; i++) {
                    const playerName = leaderboard[i].player;
                    const score = leaderboard[i].score;
                    const completionTime = leaderboard[i].completionTime === 0 ? "Unfinished" : new Date(leaderboard[i].completionTime).toLocaleString();
                    console.log(`${i + 1}. ${playerName} - Score: ${score}, Completion Time: ${completionTime}`);
                }
            }
            else {
                console.log(status + ': ' + jsonObject.errorMessages);
            }
        })
        .catch(error => console.error(error));
}



