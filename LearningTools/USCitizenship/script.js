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

// Get DOM elements once
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const submitButton = document.getElementById("submit-btn");
const readButton = document.getElementById("read-btn");

function init() {
    // Add event listeners once
    submitButton.addEventListener("click", checkAnswer);
    readButton.addEventListener("click", readQuestion);

    // Start display
    displayQuestion();
}

// Function to display question and answers
function displayQuestion() {
    if (!questions || questions.length === 0) {
        questionElement.textContent = "No questions available.";
        answersElement.innerHTML = "";
        return;
    }

    const q = questions[currentQuestion];
    questionElement.textContent = q.question;
    answersElement.innerHTML = "";
    selectedAnswer = null;

    // Build answer objects that keep the original index so we can shuffle display
    const options = q.answers.map((answer, index) => ({ text: answer, origIndex: index }));

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    options.forEach((opt, displayIndex) => {
        const button = document.createElement("button");
        button.textContent = opt.text;
        button.classList.add("btn-tag");
        // store original index so correctness check can use the question.correct (which references original indexes)
        button.dataset.orig = String(opt.origIndex);
        button.addEventListener("click", () => selectAnswer(displayIndex, button));
        answersElement.appendChild(button);
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
    if (!questions || questions.length === 0) return;
    const text = questions[currentQuestion].question;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
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
    } catch (err) {
        console.error('Failed to load questions.json, using fallback questions. Error:', err);
        questions = fallbackQuestions;
    }

    init();
}

// Start
loadQuestions();