// Questions and answers data
const questions = [
    {
        questionPartA: "If #dataPeople has #randomNumberOne hours every day to play, how many hours #dataGender gets in #randomNumberTwo days?"
    },
    {
        questionPartA: "#dataPeople has read #randomNumberOne every month, how many books #dataGender reads in #randomNumberTwo months?"
    }    
];

const objectsData = [
    {                 
        objectsFruits: ["apples", "bananas", "oranges", "grapes", "pears", "peaches", "plums", "cherries", "mangoes", "pineapples"],
        objectsTech: ["laptops", "tablets", "smartphones", "desktops", "smartwatches", "headphones", "speakers", "monitors", "keyboards", "mice"],
        objectsAnimals: ["dogs", "cats", "birds", "fish", "horses", "elephants", "tigers", "lions", "bears", "zebras"],
        objectsTime: ["hours", "minutes", "seconds" ],
        objectsDates: ["days", "weeks", "months", "years"],
        objectsPeople: ["Maria", "Alice", "Bob", "John", "Emma", "Sophia", "Michael", "David", "Olivia", "Liam"],
        linkPeopleGender: ["she", "she", "he", "he", "she", "she", "he", "he", "she", "he"]
    }
];

// Game variables
let currentQuestion = 0;
let score = 0;
let incorrect = 0;
let selectedAnswer = null;

// Function to display question and answers
function displayQuestion() {
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const submitButton = document.getElementById("submit-btn");
    const readButton = document.getElementById("read-btn");

    // Prepare base question text (support different question field names)
    const baseQuestion = questions[currentQuestion].question || questions[currentQuestion].questionPartA || '';

    // State to keep deterministic substitutions within the same question (e.g., person and their gender)
    const subState = { picks: {} };

    // Substitute tokens like #dataPeople or #randomNumberOne
    const questionText = substituteTokens(baseQuestion, subState);

    questionElement.textContent = questionText;
    answersElement.innerHTML = "";
    // If there are answer choices, substitute tokens in them too
    const rawAnswers = questions[currentQuestion].answers || [];
    rawAnswers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.textContent = substituteTokens(answer, subState);
        button.classList.add("btn-tag");
        button.addEventListener("click", () => selectAnswer(index));
        answersElement.appendChild(button);
    });

    submitButton.addEventListener("click", checkAnswer);
    readButton.addEventListener("click", readQuestion);
}

// Function to select answer
function selectAnswer(index) {
    const buttons = document.querySelectorAll(".btn-tag");
    buttons.forEach((button) => {
        button.classList.remove("active");
    });
    buttons[index].classList.add("active");
    selectedAnswer = index;
}

// Function to check answer
function checkAnswer() {
    const correctAnswer = questions[currentQuestion].correct;
    if (selectedAnswer === correctAnswer) {
        score++;
        document.getElementById("result").textContent = "Correct!";
    } else {
        incorrect++;
        document.getElementById("result").textContent = `Incorrect. The correct answer is ${questions[currentQuestion].answers[correctAnswer]}`;
    }

    document.getElementById("score").textContent = `Score: ${score} correct, ${incorrect} incorrect`;

    // Move to next question
    currentQuestion++;
    if (currentQuestion >= questions.length) {
        currentQuestion = 0;
    }

    displayQuestion();
}

// Function to read question
function readQuestion() {
    const text = questions[currentQuestion].question;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utter);
}

// Initialize game
displayQuestion();

// --- Token substitution helpers ---
// Substitute tokens of form #tokenName inside a string, using objectsData arrays and random numbers
function substituteTokens(text, state) {
    if (!text) return '';
    return text.replace(/#([A-Za-z0-9_]+)/g, (match, token) => {
        // randomNumber tokens: randomNumberOne, randomNumberTwo, etc.
        if (/^randomNumber/i.test(token)) {
            // keep deterministic within state.picks
            if (!state.picks[token]) {
                // generate random integer between 2 and 12
                state.picks[token] = Math.floor(Math.random() * 11) + 2;
            }
            return String(state.picks[token]);
        }

        // data tokens like dataPeople, dataGender -> map to objectsData
        if (/^data([A-Za-z0-9_]+)/.test(token)) {
            const keyPart = token.replace(/^data/, 'objects');
            // objectsData is an array with a single object holding arrays
            const poolObj = objectsData[0] || {};
            const pool = poolObj[keyPart];
            if (Array.isArray(pool)) {
                // If this is a paired key (e.g., People + Gender), attempt to reuse same index
                // Determine a base name for pairing, e.g., People pairs with linkPeopleGender
                const base = keyPart.replace(/s$/,''); // crude singularization
                const pairKey = 'link' + capitalize(base) + 'Gender';
                // If pairing exists, choose an index and store it
                if (poolObj[pairKey]) {
                    if (state.picks['_pairIndex'] === undefined) {
                        state.picks['_pairIndex'] = Math.floor(Math.random() * pool.length);
                    }
                    return pool[state.picks['_pairIndex']];
                }

                // Otherwise pick random
                if (!state.picks[token]) state.picks[token] = Math.floor(Math.random() * pool.length);
                return pool[state.picks[token]];
            }
        }

        // default: return token unchanged (without #)
        return token;
    });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }