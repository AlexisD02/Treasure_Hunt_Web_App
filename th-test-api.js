// Test List
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
    questions(true, "steadfast", type); // Call function from main program
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
