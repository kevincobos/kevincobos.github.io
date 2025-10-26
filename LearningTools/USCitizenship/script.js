// Load questions from a JSON file (questions.json). If fetch fails, fall back to inline data.
let questions = [];
const fallbackQuestions = [
    {
    "question": "The idea of self-government is in the first three words of the Constitution. What are these words?",
    "question_es": "La idea de autogobierno está en las tres primeras palabras de la Constitución. ¿Cuáles son estas palabras?",
    "answers": [
      "We the People",
      "In God We Trust",
      "E pluribus unum",
      "One Nation United"
    ],
    "answers_es": [
      "Nosotros el Pueblo",
      "En Dios Confiamos",
      "De muchos, uno",
      "Una Nación Unida"
    ],
    "correct": 1
  },
  {
    "question": "What is an amendment?",
    "question_es": "¿Qué es una enmienda?",
    "answers": [
      "A change (to the Constitution)",
      "A speech by Congress",
      "A federal law",
      "A presidential veto"
    ],
    "answers_es": [
      "Un cambio (a la Constitución)",
      "Un discurso del Congreso",
      "Una ley federal",
      "Un veto presidencial"
    ],
    "correct": 1
  },
  {
    "question": "What do we call the first ten amendments to the Constitution?",
    "question_es": "¿Cómo llamamos a las primeras diez enmiendas de la Constitución?",
    "answers": [
      "The Bill of Rights",
      "The Federalist Papers",
      "The Preamble",
      "The Articles of Confederation"
    ],
    "answers_es": [
      "La Carta de Derechos",
      "Los Papeles Federalistas",
      "El Preámbulo",
      "Los Artículos de la Confederación"
    ],
    "correct": 1
  },
  {
    "question": "What is one right or freedom from the First Amendment?",
    "question_es": "¿Cuál es un derecho o libertad de la Primera Enmienda?",
    "answers": [
      "Speech",
      "Voting",
      "Trial by jury",
      "Owning property"
    ],
    "answers_es": [
      "La libertad de expresión",
      "Votar",
      "Juicio por jurado",
      "Poseer propiedad"
    ],
    "correct": 1
  },
  {
    "question": "What is the economic system in the United States?",
    "question_es": "¿Cuál es el sistema económico de los Estados Unidos?",
    "answers": [
      "Capitalist economy",
      "Socialist economy",
      "Communist economy",
      "Feudal system"
    ],
    "answers_es": [
      "Economía capitalista",
      "Economía socialista",
      "Economía comunista",
      "Sistema feudal"
    ],
    "correct": 1
  },
  {
    "question": "Name one branch or part of the government.",
    "question_es": "Nombra una rama o parte del gobierno.",
    "answers": [
      "Congress",
      "The Police Department",
      "The Federal Reserve",
      "The Post Office"
    ],
    "answers_es": [
      "El Congreso",
      "El Departamento de Policía",
      "La Reserva Federal",
      "El Servicio Postal"
    ],
    "correct": 1
  },
  {
    "question": "Who makes federal laws?",
    "question_es": "¿Quién hace las leyes federales?",
    "answers": [
      "Congress",
      "The President",
      "The Supreme Court",
      "The Governors"
    ],
    "answers_es": [
      "El Congreso",
      "El Presidente",
      "La Corte Suprema",
      "Los Gobernadores"
    ],
    "correct": 1
  },
  {
    "question": "What are the two parts of the U.S. Congress?",
    "question_es": "¿Cuáles son las dos partes del Congreso de los Estados Unidos?",
    "answers": [
      "The Senate and House of Representatives",
      "The Cabinet and the President",
      "The Supreme Court and the Senate",
      "The House and the States"
    ],
    "answers_es": [
      "El Senado y la Cámara de Representantes",
      "El Gabinete y el Presidente",
      "La Corte Suprema y el Senado",
      "La Cámara y los Estados"
    ],
    "correct": 1
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
        submitButton.textContent = 'Check Answer';
        readButton.textContent = 'Read Question';
    } else {
        submitButton.textContent = 'Chequear Respuesta';
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
    document.getElementById("result").textContent = currentLanguage === 'en' ? "Please select an answer." : "Por favor seleccione una respuesta.";
    return;
    }

    const correctAnswer = questions[currentQuestion].correct - 1; // Convert 1-based to 0-based index
    if (selectedAnswer === correctAnswer) {
        score++;
    //document.getElementById("result").textContent = currentLanguage === 'en' ? "Correct!" : "¡Correcto!";
    showResultModal(true);
    } else {
        incorrect++;
        const answers = currentLanguage === 'en' ? questions[currentQuestion].answers : questions[currentQuestion].answers_es;
    const incorrectMsg = currentLanguage === 'en' ? 'Incorrect. The correct answer is' : 'Incorrecto. La respuesta correcta es';
  document.getElementById("result").textContent = `${incorrectMsg} ${answers[correctAnswer]}`;
  showResultModal(false);
    }

    document.getElementById("score").textContent = `Score: ${score} correct, ${incorrect} incorrect`;

    // Move to next question
    currentQuestion++;
    if (currentQuestion >= questions.length) {
        currentQuestion = 0;
    }

    displayQuestion();
}

// Modal handling
function showResultModal(isCorrect) {
  const modal = document.getElementById('result-modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const q = questions[currentQuestion];

  if (isCorrect) {
    title.textContent = currentLanguage === 'en' ? 'Correct!' : '¡Correcto!';
    title.className = 'modal-title-correct';
    body.innerHTML = currentLanguage === 'en' ? '<p>Good job.</p>' : '<p>Buen trabajo.</p>';
  } else {
    title.textContent = currentLanguage === 'en' ? 'Incorrect' : 'Incorrecto';
    title.className = 'modal-title-incorrect';
    const questionText = currentLanguage === 'en' ? q.question : q.question_es;
    const correctAns = currentLanguage === 'en' ? q.answers[q.correct - 1] : q.answers_es[q.correct - 1];
    body.innerHTML = `<p>${questionText}</p><p><strong>${currentLanguage === 'en' ? 'Correct answer:' : 'Respuesta correcta:'}</strong> ${correctAns}</p>`;
  }

  // Localize continue button
  const cont = document.getElementById('modal-continue');
  cont.textContent = currentLanguage === 'en' ? 'Continue' : 'Continuar';

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');

  // Ensure only one set of listeners
  cont.onclick = () => {
    closeModal();
    // advance to next question
    currentQuestion++;
    if (currentQuestion >= questions.length) currentQuestion = 0;
    displayQuestion();
  };
  
}

function closeModal() {
  const modal = document.getElementById('result-modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
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