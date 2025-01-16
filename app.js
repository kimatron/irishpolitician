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
        id: Date.now(), // Add unique ID for editing
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

    // Add click handler for flipping
    flashcard.addEventListener('click', (e) => {
        // Don't flip if clicking the edit button
        if (!e.target.classList.contains('edit-btn')) {
            isCardFlipped = !isCardFlipped;
            renderFlashcardContent();
        }
    });

    document.getElementById('flashcardContainer').innerHTML = '';
    document.getElementById('flashcardContainer').appendChild(flashcard);
}

// Edit politician function
window.editPolitician = function(id) {
    const politician = politicians.find(p => p.id === id);
    if (!politician) return;

    // Create modal for editing
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
                    <textarea id="editDetails" rows="3">${politician.details}</textarea>
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

    // Handle form submission
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

// Delete politician function
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

// Close edit modal
window.closeEditModal = function() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
    }
};

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

// Remove the flip button since we now flip by clicking
const flipButton = document.getElementById('flipCard');
flipButton.parentElement.removeChild(flipButton);

// Quiz functions remain the same
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

    let options = [currentQuestion.correctAnswer];
    while (options.length < 4) {
        const randomPolitician = politicians[Math.floor(Math.random() * politicians.length)];
        const option = randomPolitician[questionType.type];
        if (!options.includes(option)) {
            options.push(option);
        }
    }

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