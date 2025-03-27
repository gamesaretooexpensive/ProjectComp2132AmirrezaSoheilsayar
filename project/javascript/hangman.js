// Custom object to represent a word and its hint
function GameWord(word, hint) {
    this.word = word;
    this.hint = hint;
    this.getLetters = function() {
        return this.word.split("");
    };
}

function fetchWords() {
    return fetch("../answer-hint-key.json") // make sure path is relative
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to load data");
            }
        })
        .then(function(incomingData) {
            const randomIndex = Math.floor(Math.random() * incomingData.length);
            const selectedWord = incomingData[randomIndex].word;
            const selectedHint = incomingData[randomIndex].hint;

            return new GameWord(selectedWord, selectedHint);
        })
        .catch(function(error) {
            console.error("Error fetching word data: ", error);
        });
}

// Main game logic
$(document).ready(function() {

    fetchWords().then(function(data) {
        let word = data.word;
        let hint = data.hint;
        let letters = data.getLetters(); // now using the object method
        let counter = 6;
        let guessedLetters = [];

        $('#hint').text('Hint: ' + hint);

        function updateGuessCounter() {
            $('#guessCounter').text('Guesses left: ' + counter);
        }

        function updateHangmanImage() {
            let imageIndex = 6 - counter;
            if (imageIndex > 7) imageIndex = 7;
            $("#hangman-image").attr("src", `../images/hangman-0${imageIndex}.png?${new Date().getTime()}`);
        }

        function fillWordWindow(word) {
            const element = document.getElementById("letters-window");
            let html = '';

            for (let i = 0; i < word.length; i++) {
                html += `<li class="small-box" data-letter="${letters[i].toUpperCase()}">_</li>`;
            }

            element.innerHTML = html;
        }

        function checkIfWordGuessed() {
            const revealedLetters = $(".small-box.revealed").length;
            if (revealedLetters === letters.length) {
                setTimeout(() => {
                    $('#end-message')
                        .text("Congratulations! You've guessed the word.")
                        .hide()
                        .fadeIn(2000);
                    disableAllKeys();
                }, 100);
            }
        }

        function disableAllKeys() {
            $("input[type='button']").not("#play-again-btn")
                .prop("disabled", true)
                .removeClass("key-enabled")
                .addClass("key-disabled");
            $(document).off("keydown");
        }

        function enableAllKeys() {
            $("input[type='button']").not("#play-again-btn")
                .prop("disabled", false)
                .removeClass("key-disabled")
                .addClass("key-enabled");

            $(document).on('keydown', function(event) {
                handleGuess(event.key);
            });
        }

        function handleGuess(keyPressed) {
            keyPressed = keyPressed.toUpperCase();
            let button = $("#" + keyPressed + "-Key");

            if (!/^[A-Z]$/.test(keyPressed) || guessedLetters.includes(keyPressed)) return;
            guessedLetters.push(keyPressed);

            let matchFound = false;

            $(".small-box").each(function () {
                if ($(this).attr("data-letter") === keyPressed) {
                    $(this).text(keyPressed).addClass("revealed");
                    matchFound = true;
                }
            });

            if (!matchFound) {
                counter--;
                updateGuessCounter();
                updateHangmanImage();

                if (counter <= 0) {
                    setTimeout(() => {
                        $('#end-message')
                            .text("Game Over! You've run out of guesses.")
                            .hide()
                            .fadeIn(2000);
                        disableAllKeys();
                    }, 100);
                }
            }

            if (button.length) {
                button.prop("disabled", true)
                    .removeClass("key-enabled")
                    .addClass("key-disabled");
            }

            checkIfWordGuessed();
        }

        $(document).on('keydown', function(event) {
            handleGuess(event.key);
        });

        $(document).on('click', 'input[type="button"][name="key"]', function() {
            let keyPressed = $(this).val();
            handleGuess(keyPressed);
        });

        function restartGame() {
            fetchWords().then(function(data) {
                word = data.word;
                hint = data.hint;
                letters = data.getLetters();

                counter = 6;
                guessedLetters = [];

                fillWordWindow(word);
                updateGuessCounter();
                $("#hangman-image").attr("src", "../images/hangman-00.png");

                $('#hint').text('Hint: ' + hint);
                $('#end-message').hide();
                enableAllKeys();
            });
        }

        $("#play-again-btn").on("click", function() {
            restartGame();
        });

        fillWordWindow(word);
        updateGuessCounter();
    });
});
