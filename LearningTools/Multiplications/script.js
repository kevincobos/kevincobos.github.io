// Questions and answers data
const questions = [
    {
        questionPartA: "If #dataPeople has #randomNumberOne hours every day to play, how many hours #linkPeopleGender gets in #randomNumberTwo days?"
    },
    {
        questionPartA: "#dataPeople has read #randomNumberOne every month, how many books #linkPeopleGender reads in #randomNumberTwo months?"
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
        ObjectsGender: ["she", "she", "he", "he", "she", "she", "he", "he", "she", "he"]
    }
];

// Game variables
let currentQuestion = 0;
let score = 0;
let incorrect = 0;
let selectedAnswer = null;
let currentOptions = [];
let currentCorrectIndex = null;
let currentQuestionText = '';
let listenersAdded = false;

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
    currentQuestionText = questionText;
    answersElement.innerHTML = "";

    // Build numeric correct answer by extracting first two integers from the questionText
    const nums = (questionText.match(/-?\d+/g) || []).map(Number);
    const a = nums[0] !== undefined ? nums[0] : 1;
    const b = nums[1] !== undefined ? nums[1] : 1;
    const correctValue = a * b;

    // Decide how many options: random between 4 and 6
    const totalOptions = Math.floor(Math.random() * 3) + 4; // 4..6

    // Generate distractors
    const optsSet = new Set();
    optsSet.add(correctValue);
    const maxDelta = Math.max(3, Math.floor(Math.abs(correctValue) * 0.25));
    while (optsSet.size < totalOptions) {
        const method = Math.floor(Math.random() * 3);
        let candidate;
        if (method === 0) {
            // small additive/subtractive
            const delta = Math.floor(Math.random() * (maxDelta + 1)) + 1;
            candidate = correctValue + (Math.random() < 0.5 ? -delta : delta);
        } else if (method === 1) {
            // perturb one factor
            const d = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 3) + 1);
            candidate = (a + d) * b;
        } else {
            // perturb other factor
            const d = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 3) + 1);
            candidate = a * (b + d);
        }
        if (!Number.isFinite(candidate)) continue;
        candidate = Math.round(candidate);
        if (candidate <= 0) candidate = Math.abs(candidate) + 1;
        if (candidate === correctValue) continue;
        optsSet.add(candidate);
    }

    // Convert to array and shuffle
    const optionsArr = Array.from(optsSet);
    for (let i = optionsArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArr[i], optionsArr[j]] = [optionsArr[j], optionsArr[i]];
    }

    currentOptions = optionsArr.map(v => String(v));
    currentCorrectIndex = currentOptions.indexOf(String(correctValue));

    // Render buttons
    selectedAnswer = null;
    currentOptions.forEach((optText, index) => {
        const button = document.createElement("button");
        button.textContent = optText;
        button.classList.add("btn-tag");
        button.addEventListener("click", () => selectAnswer(index));
        answersElement.appendChild(button);
    });

    // Add listeners once to avoid duplicates
    if (!listenersAdded) {
        submitButton.addEventListener("click", checkAnswer);
        readButton.addEventListener("click", readQuestion);
        listenersAdded = true;
        console.debug('Listeners added for submit and read buttons');
    }
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
    const correctAnswer = currentCorrectIndex;
    if (selectedAnswer === correctAnswer) {
        score++;
        document.getElementById("result").textContent = "Correct!";
    } else {
        incorrect++;
        const correctValue = currentOptions[correctAnswer];
        document.getElementById("result").textContent = `Incorrect. The correct answer is ${correctValue}`;
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
    // Use the currently displayed question text when available
    const text = currentQuestionText || substituteTokens(questions[currentQuestion].question || questions[currentQuestion].questionPartA || '', { picks: {} });

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        console.warn('Speech Synthesis not supported in this browser');
        return;
    }

    try {
        if (!text) {
            console.warn('No text available to read');
            return;
        }
        console.debug('Reading question text:', text);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        window.speechSynthesis.cancel(); // stop any ongoing speech
        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.error('Failed to speak text', err);
    }
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
                // generate random integer between 2 and 20
                state.picks[token] = Math.floor(Math.random() * 19) + 2;
            }
            return String(state.picks[token]);
        }

        // data tokens like dataPeople -> map to objectsData (find key case-insensitively)
        if (/^data([A-Za-z0-9_]+)/i.test(token)) {
            const base = token.replace(/^data/i, ''); // e.g., 'People'
            const poolObj = objectsData[0] || {};
            // find a matching key in poolObj that ends with the base (case-insensitive), e.g., objectsPeople
            const poolKey = Object.keys(poolObj).find(k => k.toLowerCase().endsWith(base.toLowerCase()));
            const pool = poolKey ? poolObj[poolKey] : undefined;
            if (Array.isArray(pool)) {
                // pick an index for this data token (deterministic for the question)
                if (state.picks[token] === undefined) state.picks[token] = Math.floor(Math.random() * pool.length);
                // also store pair index under base so gender tokens can reuse it
                state.picks['_pairIndex_' + base] = state.picks[token];
                return pool[state.picks[token]];
            }
        }

        // Gender tokens (e.g., linkPeopleGender, ObjectsGender, objectsGender)
        if (/Gender$/i.test(token)) {
            const poolObj = objectsData[0] || {};
            // derive base (e.g., 'People' from 'linkPeopleGender' or 'ObjectsGender' -> '')
            let base = token.replace(/Gender$/i, '');
            base = base.replace(/^(link|objects|Objects)/i, '');
            // try to find a stored pair index for this base
            let pairIndex = state.picks['_pairIndex_' + base];
            if (pairIndex === undefined) {
                // fallback: try any previously chosen data token index
                const anyKey = Object.keys(state.picks).find(k => k.toLowerCase().includes(base.toLowerCase()) && typeof state.picks[k] === 'number');
                if (anyKey) pairIndex = state.picks[anyKey];
            }
            // If still undefined, choose random index (based on first gender pool length)
            // Find a gender pool key in poolObj: key contains 'gender' and optionally base
            const genderKey = Object.keys(poolObj).find(k => k.toLowerCase().includes('gender') && (base === '' || k.toLowerCase().includes(base.toLowerCase())));
            let genderPool = genderKey ? poolObj[genderKey] : undefined;
            if (!Array.isArray(genderPool)) {
                // try any gender-like key
                const altGenderKey = Object.keys(poolObj).find(k => k.toLowerCase().includes('gender'));
                if (altGenderKey) {
                    genderPool = poolObj[altGenderKey];
                }
            }
            if (Array.isArray(genderPool)) {
                if (pairIndex === undefined) pairIndex = Math.floor(Math.random() * genderPool.length);
                // store pairIndex for future tokens with same base
                state.picks['_pairIndex_' + base] = pairIndex;
                return genderPool[pairIndex];
            }
        }

        // default: return token unchanged (without #)
        return token;
    });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }