const TH_TEST_URL = "https://codecyprus.org/th/test-api/"; // the base URL for the test treasure hunt API

// Test List
function handleTestList() {
    let input_number = document.getElementById("user_input").value;

    let challengesList = document.getElementById('treasureHunts');

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

                    listHtml += "<button class='list' id=\"disabled\"><li>" + // each treasure hunt item is shown with an individual DIV element
                            "<b id='bold_text'>" + name + "</b><br/><br/>" + // the treasure hunt name is shown in bold...
                            "<i>" + description + "</i><br/>" + // and the description in italics in the following line
                            "Starts: " + timeLeftToStart + "</li></button>";// and the description in italics in the following lin

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
let start_test_cases = [
    { player: "A", treasure_name: "treasure-hunt1", id: "id1" },
    { player: "B", treasure_name: null, id: "id2" },
    { player: null, treasure_name: "treasure-hunt2", id: "unknown" },
    { player: "C", treasure_name: "treasure-hunt3", id: null }
]

function handleTestStart() {
    let start_hunt = document.getElementById('tH');
    start_hunt.innerHTML = "Results";

    for (let i = 0; i < start_test_cases.length; i++) {

        let table = "<table class='table-style'>";

        let test_startUrl = TH_TEST_URL + `start?player=${start_test_cases[i].player}&app=${start_test_cases[i].treasure_name}&treasure-hunt-id=${start_test_cases[i].id}`

        fetch(test_startUrl)
            .then(response => response.json())
            .then(jsonObject => {
                const {status, numOfQuestions, session, errorMessages} = jsonObject;

                if (status === "ERROR") {
                    if (start_test_cases[i].player === null) {
                        table += "<td>" + errorMessages[0] + "</td>";
                        table += "<td>" + "Treasure-hunt Name: " + start_test_cases[i].treasure_name + "</td>";
                        table += "<td>" + "Treasure-hunt Id: " + start_test_cases[i].id + "</td>";
                        table += "<td><img src='" + (null ? 'images/correct.png' : 'images/wrong.png') + "' alt='Success or failed icon'/>";
                    }
                    else if (start_test_cases[i].treasure_name === null) {
                        table += "<td>" + "Player Name: " + start_test_cases[i].player + "</td>";
                        table += "<td>" + errorMessages[1] + "</td>";
                        table += "<td>" + "Treasure-hunt Id: " + start_test_cases[i].id + "</td>";
                        table += "<td><img src='" + (null ? 'images/correct.png' : 'images/wrong.png') + "' alt='Success or failed icon'/>";
                    }
                    else if (start_test_cases[i].id === null) {
                        table += "<td>" + "Player Name: " + start_test_cases[i].player + "</td>";
                        table += "<td>" + "Treasure-hunt Name: " + start_test_cases[i].treasure_name + "</td>";
                        table += "<td>" + errorMessages[2] + "</td>";
                        table += "<td><img src='" + (null ? 'images/correct.png' : 'images/wrong.png') + "' alt='Success or failed icon'/>";
                    }
                    // If none of the variables are null, add their values to the table
                    else {
                        table += "<td>" + "Player Name: " + start_test_cases[i].player + "</td>";
                        table += "<td>" + "Treasure-hunt Name: " + start_test_cases[i].treasure_name + "</td>";
                        table += "<td>" + "Treasure-hunt Id: " + start_test_cases[i].id + "</td>";
                        table += "" + ("<td><img src='../images/correct.png' alt='Success or failed icon'/>") + "";
                    }

                    // Close the table tag
                    table += "</table>";

                    // Add the table to the start_hunt element
                    start_hunt.innerHTML += table;
                    console.log(errorMessages);

                }
            })
            .catch(error => console.error(error));
    }

}

//--------------
// Test Question
function handleTestQuestion() {
    let type = document.getElementById('question-type').value; // Get selected option
    //questions(true, "steadfast", type); // Call function from main program

    let buttons = document.getElementById('buttons');
    let messageBox = document.getElementById('message');
    let answerQuestionMessage = document.getElementById('answerQuestionMessage');
    let challengesList = document.getElementById('treasureHunts');

    let test_questionsUrl = TH_TEST_URL + `question?question-type=${type}&can-be-skipped=true&requires-location=true`;

    let session = "test_session";

    // Make a GET request to the API endpoint using fetch()
    fetch(test_questionsUrl)
        .then(response => response.json()) // Parse the response as JSON
        .then(jsonObject => {
            const { questionText, questionType, canBeSkipped, requiresLocation, currentQuestionIndex,
                correctScore, wrongScore, skipScore } = jsonObject;

            console.log("Can be Skipped: " + canBeSkipped);

            /*totalScore += correctScore;
            score(false, session);*/
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

            /*console.log("Requires Location?: " + requiresLocation);
            if(requiresLocation === true) {
                getLocation(session);
                intervalID = setInterval(() => { getLocation(session); }, 31000);
            }
            else{
                clearInterval(intervalID);
            }*/

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

// Clear question when 'Clear' button is clicked
function clearTestQuestion() {
    let clear_button = document.getElementById('buttons');
    clear_button.innerHTML = "Questions to show up here...";

    let clear_message = document.getElementById('message');
    clear_message.innerHTML = "";

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
    let selectedOption = document.querySelector('input[name="myOption"]:checked');

    let answer = document.getElementById('answer');
    answer.innerHTML = "";

    let answerQuestionMessage = document.getElementById('answerQuestionMessage');
    answerQuestionMessage.innerHTML = "";

    let treasure_hunts = document.getElementById('treasureHunts');
    treasure_hunts.innerHTML = "";

    let test_answerUrl;

    if (selectedOption.value === "true") {
        test_answerUrl = TH_TEST_URL + `answer?correct&completed=true`;
    }
    else if (selectedOption.value === "false") {
        test_answerUrl = TH_TEST_URL + `answer?completed=true`;
    }

    fetch(test_answerUrl)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, correct, completed, message, scoreAdjustment } = jsonObject;
            if (status === "OK") {
                if (completed) {
                    if (correct) {
                        console.log(message);
                        answerQuestionMessage.innerHTML = "<p style='color: green'>" + message + "</p>";
                        answerQuestionMessage.innerHTML += "Score adjustment: " + scoreAdjustment;
                    }
                    else {
                        console.log(message);
                        answerQuestionMessage.innerHTML = "<p style='color: red'>" + message + "</p>";
                        answerQuestionMessage.innerHTML += "Score adjustments: " + scoreAdjustment;
                    }
                }

                console.log("Score adjustment: " + scoreAdjustment);
            }
            else {
                console.log(status);
            }
        })
        .catch(error => console.error(error));
}

// Clear answer when 'Clear' button is clicked
function clearTestAnswer() {
    let clear_message = document.getElementById('answer');
    clear_message.innerHTML = "Answer text to show up here...";

    let clear_answer_question = document.getElementById('answerQuestionMessage');
    clear_answer_question.innerHTML = "";

    let treasure_hunts = document.getElementById('treasureHunts');
    treasure_hunts.innerHTML = "";
}

//--------------
function handleTestScore() {
    let title = document.getElementById('logo');
    title.innerHTML = "";
    let user_score = document.getElementById('user-score').value;

    let messageBox = document.getElementById('message');

    let test_scoreUrl = TH_TEST_URL + `score?score=${user_score}`;

    console.log("Score-section\n");
    fetch(test_scoreUrl)
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
                }
            }
        })
        .catch(error => console.error(error));
}


//--------------
// Test leaderboard
function handleTestLeaderboard() {
    let leaderboard_input = document.getElementById('leaderboard-input').value; // Get input from the user

    let selected_option = document.querySelector('input[name="myOption"]:checked');

    let leaderboard_data = document.getElementById('leaderboard-data');

    let sort_true = document.getElementById('leaderboard-sort-true');
    let sort_false = document.getElementById('leaderboard-sort-false');

    let leaderboard_id = document.getElementById("leaderboard");

    // Check checked if either true of false box is selected
    let test_leaderboard_api

    if (selected_option.value === "true") {
        test_leaderboard_api = `https://codecyprus.org/th/test-api/leaderboard?sorted&hasPrize&size=${leaderboard_input}`;
    }
    else if (selected_option.value === "false") {
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

    leaderboard_data.innerHTML = "";
}

// Clear leaderboard when 'Clear' button is clicked
function clearTestLeaderboard () {
    let clear_leaderboard = document.getElementById('leaderboard');
    clear_leaderboard.innerHTML = "Leaderboard to show up here...";

    let clear_leaderboard_data = document.getElementById('leaderboard-data');
    clear_leaderboard_data.innerHTML = "";
}
