// Store politicians data
let politicians = JSON.parse(localStorage.getItem('politicians')) || [];
let currentCardIndex = 0;
let isCardFlipped = false;
let score = 0;
let currentQuestion = null;
let isQuizActive = false;

// Handle custom inputs for party and role
document.getElementById('party').addEventListener('change', function() {
    const customPartyInput = document.getElementById('customParty');
    customPartyInput.style.display = this.value === 'custom' ? 'block' : 'none';
    if (this.value !== 'custom') {
        customPartyInput.value = '';
    }
});

document.getElementById('role').addEventListener('change', function() {
    const customRoleInput = document.getElementById('customRole');
    customRoleInput.style.display = this.value === 'custom' ? 'block' : 'none';
    if (this.value !== 'custom') {
        customRoleInput.value = '';
    }
});

// Add politician form handling
document.getElementById('politicianForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    let partyValue = document.getElementById('party').value;
    if (partyValue === 'custom') {
        partyValue = document.getElementById('customParty').value;
    }

    let roleValue = document.getElementById('role').value;
    if (roleValue === 'custom') {
        roleValue = document.getElementById('customRole').value;
    }

    const politician = {
        id: Date.now(),
        name: document.getElementById('name').value,
        photo: document.getElementById('photo').value || '/api/placeholder/200/200',
        location: document.getElementById('location').value,
        party: partyValue,
        role: roleValue,
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
            resetQuiz();
        }
    });
});

// Flashcard functions
function updateFlashcards() {
    if (politicians.length === 0) {
        document.getElementById('flashcardContainer').innerHTML = 
            '<p style="text-align: center; color: var(--text-light);">No politicians added yet. Start by adding some politicians!</p>';
        return;
    }

    const politician = politicians[currentCardIndex];
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    
    function renderFlashcardContent() {
        if (isCardFlipped) {
            flashcard.innerHTML = `
                <div class="flashcard-content">
                    <h3>${politician.name}</h3>
                    <p><strong>Location:</strong> ${politician.location}</p>
                    <p><strong>Party:</strong> ${politician.party}</p>
                    ${politician.role ? `<p><strong>Role:</strong> ${politician.role}</p>` : ''}
                    ${politician.details ? `<p><strong>Details:</strong> ${politician.details}</p>` : ''}
                    <button class="btn edit-btn" onclick="editPolitician(${politician.id})">Edit</button>
                </div>
            `;
        } else {
            flashcard.innerHTML = `
                <div class="flashcard-content">
                    <img src="${politician.photo}" alt="${politician.name}">
                    <h3>${politician.name}</h3>
                </div>
            `;
        }
    }

    renderFlashcardContent();

    flashcard.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn')) {
            isCardFlipped = !isCardFlipped;
            renderFlashcardContent();
        }
    });

    document.getElementById('flashcardContainer').innerHTML = '';
    document.getElementById('flashcardContainer').appendChild(flashcard);
}

// Navigation for flashcards
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

// Quiz functions
function resetQuiz() {
    score = 0;
    isQuizActive = true;
    document.getElementById('score').textContent = score;
    generateQuestion();
}

function generateQuestion() {
    if (!isQuizActive) return;
    
    if (politicians.length < 4) {
        document.getElementById('quizQuestion').innerHTML = 
            '<p style="color: var(--text-light);">Add at least 4 politicians to start the quiz!</p>';
        document.getElementById('quizOptions').innerHTML = '';
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

    // Skip if the selected politician doesn't have the required information
    if (!currentQuestion.correctAnswer) {
        generateQuestion();
        return;
    }

    document.getElementById('quizQuestion').textContent = 
        questionType.question.replace('{name}', correctPolitician.name);

    // Generate options
    let options = [currentQuestion.correctAnswer];
    let attempts = 0;
    while (options.length < 4 && attempts < 20) {
        const randomPolitician = politicians[Math.floor(Math.random() * politicians.length)];
        const option = randomPolitician[questionType.type];
        if (option && !options.includes(option)) {
            options.push(option);
        }
        attempts++;
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    const optionsHTML = options.map(option => `
        <div class="quiz-option" onclick="checkAnswer('${option.replace(/'/g, "\\'")}')">${option}</div>
    `).join('');

    document.getElementById('quizOptions').innerHTML = optionsHTML;
}

function checkAnswer(selected) {
    if (!currentQuestion || !isQuizActive) return;

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

    // Wait before showing next question
    setTimeout(() => {
        if (isQuizActive) {
            generateQuestion();
        }
    }, 1500);
}

// Edit politician function
window.editPolitician = function(id) {
    const politician = politicians.find(p => p.id === id);
    if (!politician) return;

    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h2>Edit Politician</h2>
            <form id="editForm">
                <div class="form-group">
                    <label for="editName">Name:</label>
                    <input type="text" id="editName" value="${politician.name}" required>
                </div>
                <div class="form-group">
                    <label for="editPhoto">Photo URL:</label>
                    <input type="text" id="editPhoto" value="${politician.photo}">
                </div>
                <div class="form-group">
                    <label for="editLocation">Town/County:</label>
                    <input type="text" id="editLocation" value="${politician.location}" required>
                </div>
                <div class="form-group">
                    <label for="editParty">Political Party:</label>
                    <input type="text" id="editParty" value="${politician.party}" required>
                </div>
                <div class="form-group">
                    <label for="editRole">Ministerial Role:</label>
                    <input type="text" id="editRole" value="${politician.role}">
                </div>
                <div class="form-group">
                    <label for="editDetails">Additional Details:</label>
                    <textarea id="editDetails" rows="3">${politician.details || ''}</textarea>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn">Save Changes</button>
                    <button type="button" class="btn delete-btn" onclick="deletePolitician(${politician.id})">Delete</button>
                    <button type="button" class="btn" onclick="closeEditModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const updatedPolitician = {
            ...politician,
            name: document.getElementById('editName').value,
            photo: document.getElementById('editPhoto').value,
            location: document.getElementById('editLocation').value,
            party: document.getElementById('editParty').value,
            role: document.getElementById('editRole').value,
            details: document.getElementById('editDetails').value
        };

        const index = politicians.findIndex(p => p.id === id);
        politicians[index] = updatedPolitician;
        localStorage.setItem('politicians', JSON.stringify(politicians));
        closeEditModal();
        updateFlashcards();
    });
};

window.deletePolitician = function(id) {
    if (confirm('Are you sure you want to delete this politician?')) {
        politicians = politicians.filter(p => p.id !== id);
        localStorage.setItem('politicians', JSON.stringify(politicians));
        closeEditModal();
        if (currentCardIndex >= politicians.length) {
            currentCardIndex = Math.max(0, politicians.length - 1);
        }
        updateFlashcards();
    }
};

window.closeEditModal = function() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
    }
};

// Initialize the app
updateFlashcards();