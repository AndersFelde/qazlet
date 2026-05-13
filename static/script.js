let questions = [];
let currentIndex = 0;
let currentMode = 'flipcard';
let quizAnswered = false;
let quizAnswers = {}; // Track quiz answers: {questionIndex: true/false}

// Load questions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    setupEventListeners();
});

function loadQuestions() {
    fetch('/api/questions')
        .then(response => response.json())
        .then(data => {
            questions = data;
            updateTotalCount();
            initializeMode();
        })
        .catch(error => console.error('Error loading questions:', error));
}

function setupEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            switchMode(e.target.dataset.mode);
        });
    });

    // Flipcard click to flip
    document.getElementById('flipcard').addEventListener('click', function() {
        this.classList.toggle('flipped');
    });

    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', previousCard);
    document.getElementById('nextBtn').addEventListener('click', nextCard);
    document.getElementById('nextQuizBtn').addEventListener('click', nextCard);
    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
}

function switchMode(mode) {
    currentMode = mode;
    currentIndex = 0;
    quizAnswered = false;
    quizAnswers = {}; // Reset answers when switching modes
    
    document.querySelectorAll('.mode-content').forEach(el => {
        el.classList.add('hidden');
    });

    if (mode === 'flipcard') {
        document.getElementById('flipcardMode').classList.remove('hidden');
    } else {
        document.getElementById('quizMode').classList.remove('hidden');
    }

    initializeMode();
}

function initializeMode() {
    if (currentMode === 'flipcard') {
        showFlipcard();
    } else {
        showQuiz();
    }
    updateProgressBar();
}

function showFlipcard() {
    if (questions.length === 0) return;

    const currentQ = getCurrentQuestion();
    if (currentQ.type !== 'flipcard') {
        findNextFlipcard();
        return;
    }

    document.getElementById('questionText').textContent = currentQ.question;
    document.getElementById('answerText').textContent = currentQ.answer;
    document.getElementById('flipcard').classList.remove('flipped');
    
    updateNavButtons();
    updateProgressBar();
}

function showQuiz() {
    if (questions.length === 0) return;

    const currentQ = getCurrentQuestion();
    if (currentQ.type !== 'quiz') {
        findNextQuiz();
        return;
    }

    quizAnswered = false;
    document.getElementById('quizQuestion').textContent = currentQ.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    currentQ.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => selectQuizAnswer(index));
        optionsContainer.appendChild(optionEl);
    });

    document.getElementById('nextQuizBtn').disabled = true;
    updateNavButtons();
    updateProgressBar();
}

function selectQuizAnswer(selectedIndex) {
    if (quizAnswered) return;

    quizAnswered = true;
    const currentQ = getCurrentQuestion();
    const isCorrect = selectedIndex === currentQ.correct;
    
    // Track the answer
    quizAnswers[currentIndex] = isCorrect;
    
    const options = document.querySelectorAll('.option');

    options.forEach((option, index) => {
        option.classList.add('disabled');
        if (index === currentQ.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });

    document.getElementById('nextQuizBtn').disabled = false;
}

function getCurrentQuestion() {
    return questions[currentIndex];
}

function findNextFlipcard() {
    const startIndex = currentIndex;
    while (currentIndex < questions.length) {
        if (questions[currentIndex].type === 'flipcard') {
            showFlipcard();
            return true;
        }
        currentIndex++;
    }
    // No more flipcards found, revert index
    currentIndex = startIndex;
    return false;
}

function findNextQuiz() {
    const startIndex = currentIndex;
    while (currentIndex < questions.length) {
        if (questions[currentIndex].type === 'quiz') {
            showQuiz();
            return true;
        }
        currentIndex++;
    }
    // No more quiz questions found, revert index
    currentIndex = startIndex;
    return false;
}

function previousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        if (currentMode === 'flipcard') {
            findNextFlipcard();
        } else {
            findNextQuiz();
        }
    }
}

function nextCard() {
    if (currentMode === 'flipcard') {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            findNextFlipcard();
        }
    } else {
        // Quiz mode
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            const found = findNextQuiz();
            if (!found) {
                // No more quiz questions, show results
                showResults();
            }
        } else {
            // Already at end, show results
            showResults();
        }
    }
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === questions.length - 1;
}

function updateProgressBar() {
    const progress = ((currentIndex + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentIndex').textContent = currentIndex + 1;
}

function updateTotalCount() {
    document.getElementById('totalCount').textContent = questions.length;
}

function showResults() {
    // Calculate score
    const quizQuestions = questions.filter(q => q.type === 'quiz');
    let correctCount = 0;
    
    quizQuestions.forEach((q, idx) => {
        if (quizAnswers[questions.indexOf(q)] === true) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / quizQuestions.length) * 100);
    
    // Update results display
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('scoreText').textContent = `You got ${correctCount} out of ${quizQuestions.length} correct`;
    
    // Build results list
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    
    quizQuestions.forEach((q, idx) => {
        const questionIdx = questions.indexOf(q);
        const isCorrect = quizAnswers[questionIdx];
        
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${isCorrect ? 'correct' : 'incorrect'}`;
        resultItem.innerHTML = `
            <div class="result-header">
                <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
                <span class="result-question">${q.question}</span>
            </div>
            <div class="result-details">
                <p><strong>Correct answer:</strong> ${q.options[q.correct]}</p>
            </div>
        `;
        resultsList.appendChild(resultItem);
    });
    
    // Show results screen
    document.querySelectorAll('.mode-content').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById('resultsMode').classList.remove('hidden');
}

function restartQuiz() {
    quizAnswers = {};
    quizAnswered = false;
    currentIndex = 0;
    switchMode('quiz');
}
