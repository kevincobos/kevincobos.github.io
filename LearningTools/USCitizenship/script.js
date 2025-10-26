// Load questions from a JSON file (questions.json). If fetch fails, fall back to inline data.
let questions = [];
const fallbackQuestions = [
    {
        question: "What is the capital of France?",
        answers: ["Berlin", "Paris", "London", "Rome"],
        correct: 1
    },
    {
        question: "What is the largest planet in our solar system?",
        answers: ["Earth", "Saturn", "Jupiter", "Uranus"],
        correct: 2
    },
    {
        question: "Who painted the Starry Night?",
        answers: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Claude Monet"],
        correct: 1
    }
];

// Game variables
let currentQuestion = 0;
let score = 0;
let incorrect = 0;
let selectedAnswer = null;
let currentLanguage = 'en'; // Track current language

// Utility: Fisher-Yates shuffle (mutates array)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Get DOM elements once
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const submitButton = document.getElementById("submit-btn");
const readButton = document.getElementById("read-btn");

function init() {
    // Add event listeners once
    submitButton.addEventListener("click", checkAnswer);
    readButton.addEventListener("click", readQuestion);

    // Language toggle listeners
    document.getElementById('lang-en').addEventListener('change', () => {
        currentLanguage = 'en';
        updateLanguageUI();
        displayQuestion();
    });
    document.getElementById('lang-es').addEventListener('change', () => {
        currentLanguage = 'es';
        updateLanguageUI();
        displayQuestion();
    });

    // Start display
    displayQuestion();
}

// Update UI elements based on selected language
function updateLanguageUI() {
    if (currentLanguage === 'en') {
        submitButton.textContent = 'Submit';
        readButton.textContent = 'Read Question';
    } else {
        submitButton.textContent = 'Enviar';
        readButton.textContent = 'Leer Pregunta';
    }
}

// Function to display question and answers
function displayQuestion() {
    if (!questions || questions.length === 0) {
        questionElement.textContent = "No questions available.";
        answersElement.innerHTML = "";
        return;
    }

    const q = questions[currentQuestion];
    const questionText = currentLanguage === 'en' ? q.question : q.question_es;
    questionElement.textContent = questionText;
    answersElement.innerHTML = "";
    selectedAnswer = null;

    // Build answer objects that keep the original index so we can shuffle display
    const answers = currentLanguage === 'en' ? q.answers : q.answers_es;
    const options = answers.map((answer, index) => ({ text: answer, origIndex: index }));

    // Shuffle display order of answers
    shuffleArray(options);

    // Create a div to hold buttons in a vertical stack
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("d-grid", "gap-2"); // Bootstrap classes for vertical stack with gaps
    answersElement.appendChild(buttonContainer);

    options.forEach((opt, displayIndex) => {
        const button = document.createElement("button");
        button.textContent = opt.text;
        button.classList.add("btn-tag", "w-100", "text-start"); // Make full width and left-align text
        // store original index so correctness check can use the question.correct (which references original indexes)
        button.dataset.orig = String(opt.origIndex);
        button.addEventListener("click", () => selectAnswer(displayIndex, button));
        buttonContainer.appendChild(button); // Append to container instead of answersElement
    });
}

// Function to select answer
function selectAnswer(index, buttonElem) {
    const buttons = document.querySelectorAll(".btn-tag");
    buttons.forEach((button) => button.classList.remove("active"));
    buttonElem.classList.add("active");
    // Store the original answer index (from the question's answers array) so checkAnswer can compare to question.correct
    const orig = buttonElem.dataset.orig;
    selectedAnswer = orig !== undefined ? parseInt(orig, 10) : index;
}

// Function to check answer
function checkAnswer() {
    if (selectedAnswer === null) {
        document.getElementById("result").textContent = "Please select an answer.";
        return;
    }

    const correctAnswer = questions[currentQuestion].correct - 1; // Convert 1-based to 0-based index
    if (selectedAnswer === correctAnswer) {
        score++;
        document.getElementById("result").textContent = "Correct!";
    } else {
        incorrect++;
        const answers = currentLanguage === 'en' ? questions[currentQuestion].answers : questions[currentQuestion].answers_es;
    const incorrectMsg = currentLanguage === 'en' ? 'Incorrect. The correct answer is' : 'Incorrecto. La respuesta correcta es';
    document.getElementById("result").textContent = `${incorrectMsg} ${answers[correctAnswer]}`;
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
    if (!questions || questions.length === 0) return;
    const q = questions[currentQuestion];
    const text = currentLanguage === 'en' ? q.question : q.question_es;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'en' ? "en-US" : "es-ES";
    speechSynthesis.speak(utterance);
}

// Load external JSON then initialize
async function loadQuestions() {
    try {
        const res = await fetch('./questions.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid data');
        questions = data;
        // Randomize question order once per load/session
        shuffleArray(questions);
    } catch (err) {
        console.error('Failed to load questions.json, using fallback questions. Error:', err);
        questions = fallbackQuestions;
        shuffleArray(questions);
    }

    init();
}

// Start
loadQuestions();