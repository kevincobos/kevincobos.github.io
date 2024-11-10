// List of common Spanish phrases
const phrases = [
    "Tengo hambre", 
    "Estoy cansado", 
    "¿Cómo estás?", 
    "¿Necesito ir al baño?", 
    "Me llamo Rento", 
    "Muchas gracias", 
    "Hace calor", 
    "Hace frío", 
    "Tengo sed", 
    "Necesito ir a dormir", 
    "Estoy feliz", 
    "Me duele la cabeza", 
    "Necesito ayuda"
];

// Function to create and speak the phrase
function createButton(phrase) {
    const button = document.createElement("button");
    button.innerText = phrase;
    button.onclick = () => speakPhrase(phrase);
    return button;
}

// Function to use the Web Speech API to speak the phrase
function speakPhrase(phrase) {
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "es-ES"; // Spanish language code
    window.speechSynthesis.speak(utterance);
}

// Dynamically create buttons and place them in the grid
function createButtons() {
    const container = document.getElementById("container");

    // Clear any existing buttons
    container.innerHTML = "";

    // Create a button for each phrase
    phrases.forEach(phrase => {
        const button = createButton(phrase);
        container.appendChild(button);
    });
}

// Adjust layout based on screen orientation
function adjustLayout() {
    if (window.innerHeight > window.innerWidth) {
        // Portrait mode (3x4 grid)
        document.querySelector('.container').style.gridTemplateColumns = 'repeat(3, 1fr)';
        document.querySelector('.container').style.gridTemplateRows = 'repeat(4, 1fr)';
    } else {
        // Landscape mode (4x3 grid)
        document.querySelector('.container').style.gridTemplateColumns = 'repeat(4, 1fr)';
        document.querySelector('.container').style.gridTemplateRows = 'repeat(3, 1fr)';
    }
}

// Initial setup
window.onload = () => {
    adjustLayout();
    createButtons();
}

// Re-adjust layout on window resize
window.onresize = adjustLayout;
