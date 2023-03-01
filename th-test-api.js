// *** Note ***
// Each function for NOW follows the same principle

/* The functions handleTestList and handleTestLeaderboard have loops,
   they do so because the API json file of each function contains a list/array to which we want to see the data */

/* The rest of the functions are just showing the "values" in each json file of the respective API,
   for better understanding visit the link provided in the test.html and hit "Try It" button to view a sample json
 */



function handleTestList(table_num) {
    /*handleList(caller, true);*/

    let t_Hunts = document.getElementById("tH"); // 1. Get the dedicated id from the html file, in this case test.html

    const test_listURL = `https://codecyprus.org/th/test-api/list?number-of-ths=${table_num}` // // 2. Get the appropriate API link
    console.log(test_listURL);

    // 3. Fetch then fetch data from the provided API json
    fetch(test_listURL)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, treasureHunts } = jsonObject; // 4. Declare variables for each key in the json file respectively
            if(status === "OK") {
                t_Hunts.innerHTML = "<p>" + "Treasure Hunts" + "</p>"; // 5. Overwrite the initial text in the html

                // 6. Loop through the array in the json file named treasureHunt and show available key:values
                for (let i = 0; i < treasureHunts.length; i++) {
                    let list_t_Hunts = document.createElement("ul");
                    let treasure_hunt_count = document.createElement("p");

                    treasure_hunt_count.innerHTML = "<p><i>" + "Treasure-Hunt " + (i+1) + ":" + "</i></p>";
                    list_t_Hunts.appendChild(treasure_hunt_count);

                    console.log("Treasure-Hunt " + (i+1) + ":");
                    Object.entries(treasureHunts[i]).forEach(([key, value]) => {
                        console.log(`${key} : ${value}`);

                        let list_key_values = document.createElement("li");

                        list_key_values.innerHTML = "<p>" + `${key}` + ":" + `${value}` + "</p>";
                        list_t_Hunts.appendChild(list_key_values);
                    });
                    console.log('\n');

                    t_Hunts.appendChild(list_t_Hunts);
                }
            }
        })
        .catch(error => console.error(error));


}


function handleTestStart() {
    /*let params = {"player": "INACTIVE"}; // explicitly request an error
    handleStart(params, caller, true);*/

    let message = document.getElementById("message");
    const inactive_start = `https://codecyprus.org/th/test-api/start?player=inactive`;
    const empty_start = `https://codecyprus.org/th/test-api/start?player=empty`;
    const player_start = `https://codecyprus.org/th/test-api/start?player=player`;
    const app_start = `https://codecyprus.org/th/test-api/start?player=app`;
    const unknown_start = `https://codecyprus.org/th/test-api/start?player=unknown`;
    const missing_start = `https://codecyprus.org/th/test-api/start?player=missing_parameter`;

    //console.log(select("werewolf", "sh iii"));

    fetch(inactive_start)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, errorMessages } = jsonObject;
            if(status === "ERROR") {
                message.innerHTML = "<p>" + errorMessages + "</p>";
            }
        })
        .catch(error => console.error(error));

    fetch(empty_start)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, errorMessages } = jsonObject;
            if(status === "ERROR") {
                message.innerHTML += "<p>" + errorMessages + "</p>";
            }
        })
        .catch(error => console.error(error));

    fetch(player_start)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, errorMessages } = jsonObject;
            if(status === "ERROR") {
                message.innerHTML += "<p>" + errorMessages + "</p>";
            }
        })
        .catch(error => console.error(error));

    fetch(app_start)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, errorMessages } = jsonObject;
            if(status === "ERROR") {
                message.innerHTML += "<p>" + errorMessages + "</p>";
            }
        })
        .catch(error => console.error(error));

    fetch(unknown_start)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, errorMessages } = jsonObject;
            if(status === "ERROR") {
                message.innerHTML += "<p>" + errorMessages + "</p>";
            }
        })
        .catch(error => console.error(error));

    fetch(missing_start)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, errorMessages } = jsonObject;
            if(status === "ERROR") {
                message.innerHTML += "<p>" + errorMessages + "</p>";
            }
        })
        .catch(error => console.error(error));
}

function handleTestQuestion() {
    /*let params = {"player": "INACTIVE"}; // explicitly request an error
    handleStart(params, caller, true);*/

    let questions = document.getElementById("questions");
    const test_questionsURL = "https://codecyprus.org/th/test-api/question?completed&question-type=RANDOM&can-be-skipped&requires-location";

    fetch(test_questionsURL)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, completed, questionText,
                    questionType, canBeSkipped, requiresLocation,
                    numOfQuestions, currentQuestionIndex,
                    correctScore, wrongScore, skipScore } = jsonObject;

            if(status === "OK") {
                questions.innerHTML = "<p><i>" + "Shown Questions" + "</i></p>"; // This line like other similar will overwrite what the initial text in the test.html

                console.log(completed);
                questions.innerHTML += "<p>" + completed + "</p>"; // Using "+=" will append to that id (in this case questions) showing all data, instead of overwriting

                console.log(questionText);
                questions.innerHTML += "<p>" + questionText + "</p>";

                console.log(questionType);
                questions.innerHTML += "<p>" + questionType + "</p>";

                console.log(canBeSkipped);
                questions.innerHTML += "<p>" + canBeSkipped + "</p>";

                console.log(requiresLocation);
                questions.innerHTML += "<p>" + requiresLocation + "</p>";

                console.log(numOfQuestions);
                questions.innerHTML += "<p>" + numOfQuestions + "</p>";

                console.log(currentQuestionIndex);
                questions.innerHTML += "<p>" + currentQuestionIndex + "</p>";

                console.log(correctScore);
                questions.innerHTML += "<p>" + correctScore + "</p>";

                console.log(wrongScore);
                questions.innerHTML += "<p>" + wrongScore + "</p>";

                console.log(skipScore);
                questions.innerHTML += "<p>" + skipScore + "</p>";

            }
        })
        .catch(error => console.error(error));
}

function handleTestAnswer() {
    /*let params = {"player": "INACTIVE"}; // explicitly request an error
    handleStart(params, caller, true);*/

    let answer = document.getElementById("answers");
    const test_answerURL = "https://codecyprus.org/th/test-api/answer?correct&completed=false";

    fetch(test_answerURL)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, correct, completed, message, scoreAdjustment } = jsonObject;
            if(status === "OK") {
                answer.innerHTML = "<p><i>" + "Shown Answers" + "</i></p>";

                console.log(correct);
                answer.innerHTML += "<p>" + correct + "</p>";

                console.log(completed);
                answer.innerHTML += "<p>" + completed + "</p>";

                console.log(message);
                answer.innerHTML += "<p>" + message + "</p>";

                console.log(scoreAdjustment);
                answer.innerHTML += "<p>" + scoreAdjustment + "</p>";
            }
        })
        .catch(error => console.error(error));
}

function handleTestScore() {
    /*let params = {"player": "INACTIVE"}; // explicitly request an error
    handleStart(params, caller, true);*/

    let _score = document.getElementById("score");
    const test_scoreURL = "https://codecyprus.org/th/test-api/score?score=42&completed=true&finished=true&error=true";

    fetch(test_scoreURL)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, completed, finished, player, score, hasPrize } = jsonObject;
            if(status === "ERROR") {
                _score.innerHTML = "<p><i>" + "Shown Score" + "</i></p>";

                console.log(completed);
                _score.innerHTML += "<p>" + completed + "</p>";

                console.log(finished);
                _score.innerHTML += "<p>" + finished + "</p>";

                console.log(message);
                _score.innerHTML += "<p>" + player + "</p>";

                console.log(score);
                _score.innerHTML += "<p>" + score + "</p>"

                console.log(hasPrize);
                _score.innerHTML += "<p>" + hasPrize + "</p>";
            }
        })
        .catch(error => console.error(error));
}

function handleTestLeaderboard() {
    /*handleList(caller, true);*/

    let leader_board = document.getElementById("leaderboard");

    const test_leaderboardURL = "https://codecyprus.org/th/test-api/leaderboard?sorted&hasPrize&size=42";

    fetch(test_leaderboardURL)
        .then(response => response.json())
        .then(jsonObject => {
            const { status, numOfPlayers, sorted, limit, hasPrize, leaderboard, treasureHuntName } = jsonObject;
            if(status === "OK") {
                leader_board.innerHTML = "<p><i>" + " Leaderboard" + "</i></p>";

                console.log(numOfPlayers);
                leader_board.innerHTML += "<p>" + numOfPlayers + "</p>";

                console.log(sorted);
                leader_board.innerHTML += "<p>" + sorted + "</p>";

                console.log(limit);
                leader_board.innerHTML += "<p>" + limit + "</p>";

                console.log(hasPrize);
                leader_board.innerHTML += "<p>" + hasPrize + "</p>";

                console.log(treasureHuntName);
                leader_board.innerHTML += "<p>" + treasureHuntName + "</p>";

                for (let i = 0; i < leaderboard.length; i++) {
                    let leaderboard_ul = document.createElement("ul");
                    let treasure_hunt_count = document.createElement("p");
                    treasure_hunt_count.innerHTML = "<p><i>" + "Leaderboard log " + (i+1) + ":" + "</i></p>";
                    leaderboard_ul.appendChild(treasure_hunt_count);

                    console.log("Leaderboard log " + (i+1) + ":");
                    Object.entries(leaderboard[i]).forEach(([key, value]) => {
                        console.log(`${key} : ${value}`);

                        let list_key_values = document.createElement("li");
                        list_key_values.innerHTML = "<p>" + `${key}` + ":" + `${value}` + "</p>";
                        leaderboard_ul.appendChild(list_key_values);

                        leader_board.innerHTML += "<br>";

                    });
                    console.log('\n');

                    leader_board.appendChild(leaderboard_ul);
                }
            }
        })
        .catch(error => console.error(error));
}