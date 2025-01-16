// Store politicians data
let politicians = JSON.parse(localStorage.getItem('politicians')) || [];
let currentCardIndex = 0;
let isCardFlipped = false;
let score = 0;
let currentQuestion = null;

// Add politician form handling
document.getElementById('politicianForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const politician = {
        name: document.getElementById('name').value,
        photo: document.getElementById('photo').value || '/api/placeholder/200/200',
        location: document.getElementById('location').value,
        party: document.getElementById('party').value,
        role: document.getElementById('role').value,
        details: document.getElementById('details').value
    };
    politicians.push(politician);
    localStorage.setItem('politicians', JSON.stringify(politicians));
    this.reset();
    alert('Politician added successfully!');
    updateFlashcards();
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'quiz') {
            generateQuestion();
        }
    });
});

// Flashcard functions
function updateFlashcards() {
    if (politicians.length === 0) {
        document.getElementById('flashcardContainer').innerHTML = '<p>No politicians added yet. Add some politicians first!</p>';
        return;
    }

    const politician = politicians[currentCardIndex];
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    
    if (isCardFlipped) {
        flashcard.innerHTML = `
            <h3>${politician.name}</h3>
            <p><strong>Location:</strong> ${politician.location}</p>
            <p><strong>Party:</strong> ${politician.party}</p>
            ${politician.role ? `<p><strong>Role:</strong> ${politician.role}</p>` : ''}
            ${politician.details ? `<p><strong>Details:</strong> ${politician.details}</p>` : ''}
        `;
    } else {
        flashcard.innerHTML = `
            <img src="${politician.photo}" alt="${politician.name}">
            <h3>${politician.name}</h3>
        `;
    }

    document.getElementById('flashcardContainer').innerHTML = '';
    document.getElementById('flashcardContainer').appendChild(flashcard);
}

document.getElementById('prevCard').addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        isCardFlipped = false;
        updateFlashcards();
    }
});

document.getElementById('nextCard').addEventListener('click', () => {
    if (currentCardIndex < politicians.length - 1) {
        currentCardIndex++;
        isCardFlipped = false;
        updateFlashcards();
    }
});

document.getElementById('flipCard').addEventListener('click', () => {
    isCardFlipped = !isCardFlipped;
    updateFlashcards();
});

// Quiz functions
function generateQuestion() {
    if (politicians.length < 4) {
        document.getElementById('quizQuestion').innerHTML = 'Add at least 4 politicians to start the quiz!';
        document.getElementById('quizOptions').innerHTML = '';
        document.getElementById('nextQuestion').style.display = 'none';
        return;
    }

    const questionTypes = [
        { type: 'party', question: 'Which political party does {name} belong to?' },
        { type: 'location', question: 'Which town/county is {name} from?' },
        { type: 'role', question: 'What is the ministerial role of {name}?' }
    ];

    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const correctPolitician = politicians[Math.floor(Math.random() * politicians.length)];
    
    currentQuestion = {
        politician: correctPolitician,
        type: questionType.type,
        correctAnswer: correctPolitician[questionType.type]
    };

    document.getElementById('quizQuestion').textContent = 
        questionType.question.replace('{name}', correctPolitician.name);

    // Generate options
    let options = [currentQuestion.correctAnswer];
    while (options.length < 4) {
        const randomPolitician = politicians[Math.floor(Math.random() * politicians.length)];
        const option = randomPolitician[questionType.type];
        if (!options.includes(option)) {
            options.push(option);
        }
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    const optionsHTML = options.map(option => `
        <div class="quiz-option" onclick="checkAnswer('${option}')">${option}</div>
    `).join('');

    document.getElementById('quizOptions').innerHTML = optionsHTML;
    document.getElementById('nextQuestion').style.display = 'none';
}

function checkAnswer(selected) {
    if (!currentQuestion) return;

    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => {
        option.style.pointerEvents = 'none';
        if (option.textContent === currentQuestion.correctAnswer) {
            option.classList.add('correct');
        } else if (option.textContent === selected && selected !== currentQuestion.correctAnswer) {
            option.classList.add('incorrect');
        }
    });

    if (selected === currentQuestion.correctAnswer) {
        score++;
        document.getElementById('score').textContent = score;
    }

    document.getElementById('nextQuestion').style.display = 'block';
}

document.getElementById('nextQuestion').addEventListener('click', generateQuestion);

// Initialize flashcards
updateFlashcards();