let questions = [];
let currentIndex = 0;
let currentMode = 'flipcard';
let quizAnswered = false;

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
}

function switchMode(mode) {
    currentMode = mode;
    currentIndex = 0;
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
            return;
        }
        currentIndex++;
    }
    currentIndex = startIndex;
    showFlipcard();
}

function findNextQuiz() {
    const startIndex = currentIndex;
    while (currentIndex < questions.length) {
        if (questions[currentIndex].type === 'quiz') {
            showQuiz();
            return;
        }
        currentIndex++;
    }
    currentIndex = startIndex;
    showQuiz();
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
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        if (currentMode === 'flipcard') {
            findNextFlipcard();
        } else {
            findNextQuiz();
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
