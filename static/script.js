let questions = [];
let currentIndexFlipcard = 0;
let currentIndexQuiz = 0;
let currentMode = 'flipcard';
let quizAnswered = false;
let quizAnswers = {}; // Track quiz answers: {questionIndex: true/false}
let quizOptionOrder = {}; // Track shuffled order per question index
let currentQuizCorrectIndex = null;

// Helper functions to get/set current index based on mode
function getCurrentIndex() {
    return currentMode === 'flipcard' ? currentIndexFlipcard : currentIndexQuiz;
}

function setCurrentIndex(value) {
    if (currentMode === 'flipcard') {
        currentIndexFlipcard = value;
    } else {
        currentIndexQuiz = value;
    }
}

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
    quizAnswered = false;
    
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
        findNextFlipcard();
    } else {
        findNextQuiz();
    }
    updateProgressBar();
}

function showFlipcard() {
    if (questions.length === 0) return;

    const currentQ = getCurrentQuestion();
    if (!currentQ) return;
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
    if (!currentQ) return;
    if (currentQ.type !== 'quiz') {
        findNextQuiz();
        return;
    }

    quizAnswered = false;
    currentQuizCorrectIndex = null;
    document.getElementById('quizQuestion').textContent = currentQ.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const questionIndex = getCurrentIndex();
    const { options, correctIndex } = getShuffledOptions(questionIndex, currentQ.options, currentQ.correct);
    currentQuizCorrectIndex = correctIndex;

    options.forEach((option, index) => {
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
    const isCorrect = selectedIndex === currentQuizCorrectIndex;
    
    // Track the answer
    quizAnswers[getCurrentIndex()] = isCorrect;
    
    const options = document.querySelectorAll('.option');

    options.forEach((option, index) => {
        option.classList.add('disabled');
        if (index === currentQuizCorrectIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });

    document.getElementById('nextQuizBtn').disabled = false;
}

function getCurrentQuestion() {
    return questions[getCurrentIndex()];
}

function getShuffledOptions(questionIndex, options, correctIndex) {
    if (quizOptionOrder[questionIndex]) {
        return quizOptionOrder[questionIndex];
    }

    const indexedOptions = options.map((option, index) => ({ option, index }));
    for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }

    const shuffledOptions = indexedOptions.map(item => item.option);
    const shuffledCorrectIndex = indexedOptions.findIndex(item => item.index === correctIndex);
    const result = { options: shuffledOptions, correctIndex: shuffledCorrectIndex };
    quizOptionOrder[questionIndex] = result;
    return result;
}
function getQuestionsOfCurrentType() {
    return questions.filter(q => q.type === currentMode);
}
function findNextFlipcard() {
    const startIndex = getCurrentIndex();
    let index = startIndex;
    while (index < questions.length) {
        if (questions[index].type === 'flipcard') {
            setCurrentIndex(index);
            showFlipcard();
            return true;
        }
        index++;
    }
    // No more flipcards found, revert index
    setCurrentIndex(startIndex);
    return false;
}

function findNextQuiz() {
    const startIndex = getCurrentIndex();
    let index = startIndex;
    while (index < questions.length) {
        if (questions[index].type === 'quiz') {
            setCurrentIndex(index);
            showQuiz();
            return true;
        }
        index++;
    }
    // No more quiz questions found, revert index
    setCurrentIndex(startIndex);
    return false;
}

function previousCard() {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        if (currentMode === 'flipcard') {
            findNextFlipcard();
        } else {
            findNextQuiz();
        }
    }
}

function nextCard() {
    const currentIndex = getCurrentIndex();
    if (currentMode === 'flipcard') {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            const found = findNextFlipcard();
            if (!found) {
                setCurrentIndex(0);
                findNextFlipcard();
            }
        } else {
            setCurrentIndex(0);
            findNextFlipcard();
        }
    } else {
        // Quiz mode
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
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
    const currentIndex = getCurrentIndex();
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentIndex === 0;
    if (currentMode === 'flipcard') {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = currentIndex === questions.length - 1;
    }
}

function updateProgressBar() {
    const currentIndex = getCurrentIndex();
    const modeQuestions = getQuestionsOfCurrentType();
    
    if (modeQuestions.length === 0) {
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('currentIndex').textContent = '0';
        document.getElementById('totalCount').textContent = '0';
        return;
    }
    
    // Find position of current question in the filtered list
    let positionInMode = 0;
    for (let i = 0; i <= currentIndex; i++) {
        if (questions[i].type === currentMode) {
            positionInMode++;
        }
    }
    
    const progress = (positionInMode / modeQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentIndex').textContent = positionInMode;
    document.getElementById('totalCount').textContent = modeQuestions.length;
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
                Quiz<span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
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
    currentIndexQuiz = 0;
    switchMode('quiz');
}
