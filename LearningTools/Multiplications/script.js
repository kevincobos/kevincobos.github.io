// Questions and answers data
const questions = [
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

// Function to display question and answers
function displayQuestion() {
    const questionElement = document.getElementById("question");
    const answersElement = document.getElementById("answers");
    const submitButton = document.getElementById("submit-btn");
    const readButton = document.getElementById("read-btn");

    questionElement.textContent = questions[currentQuestion].question;
    answersElement.innerHTML = "";
    questions[currentQuestion].answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.textContent = answer;
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