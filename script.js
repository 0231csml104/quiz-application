const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const questionCountSelect = document.getElementById("question-count");

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const progressEl = document.getElementById("progress");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;

// Start Quiz
startBtn.addEventListener("click", async () => {
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  const questionCount = parseInt(questionCountSelect.value, 10) || 5;

  const url = `https://opentdb.com/api.php?amount=${questionCount}&category=${category}&difficulty=${difficulty}&type=multiple`;
  let data = null;
  try{
    const res = await fetch(url);
    data = await res.json();
  } catch(err){
    console.warn('Fetch failed, using local fallback:', err);
    data = { response_code: 1, results: [] };
  }

  // If remote failed or returned no results, use a small local fallback set
  if(!data || !Array.isArray(data.results) || data.results.length === 0){
    // local fallback questions (same shape as OpenTDB)
    questions = [
      {question: 'What does HTML stand for?', correct_answer: 'HyperText Markup Language', incorrect_answers: ['Hyperlinks and Text Markup','Home Tool Markup Language','Hyperlinking Text Mark Language']},
      {question: 'Which planet is known as the Red Planet?', correct_answer: 'Mars', incorrect_answers: ['Venus','Jupiter','Saturn']},
      {question: 'Which language runs in a web browser?', correct_answer: 'JavaScript', incorrect_answers: ['Python','C#','Java']},
      {question: 'What does CSS stand for?', correct_answer: 'Cascading Style Sheets', incorrect_answers: ['Computer Style Sheets','Creative Style System','Colorful Style Sheet']},
      {question: 'What is the chemical symbol for water?', correct_answer: 'H2O', incorrect_answers: ['O2','HO2','H2']}
    ];
    if(questionCount < questions.length) questions = questions.slice(0, questionCount);
    // notify user
    alert('Online questions not available — using local question set.');
  } else {
    questions = data.results;
  }

  if (!questions || questions.length === 0) {
    alert("No questions available for this category/difficulty. Try again.");
    return;
  }

  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
});

// Show Question
function showQuestion() {
  resetState();
  startTimer();

  let currentQuestion = questions[currentQuestionIndex];
  questionEl.innerHTML = decodeHTML(currentQuestion.question);

  progressEl.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  let answers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  answers = shuffleArray(answers);

  answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.innerText = decodeHTML(answer);
    btn.addEventListener("click", () => selectAnswer(btn, currentQuestion.correct_answer));
    optionsEl.appendChild(btn);
  });
}

// Decode HTML entities
function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Shuffle answers
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Select Answer
function selectAnswer(btn, correctAnswer) {
  clearInterval(timer);
  const isCorrect = btn.innerText === decodeHTML(correctAnswer);
  if (isCorrect) {
    btn.classList.add("correct");
    score++;
  } else {
    btn.classList.add("wrong");
  }

  Array.from(optionsEl.children).forEach(b => {
    b.disabled = true;
    if (b.innerText === decodeHTML(correctAnswer)) {
      b.classList.add("correct");
    }
  });

  nextBtn.classList.remove("hidden");
  nextBtn.disabled = false;
}

// Next Question
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

// Show Result
function showResult() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreEl.innerText = `${score} / ${questions.length}`;
}

// Restart Quiz
restartBtn.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

// Reset state
function resetState() {
  clearInterval(timer);
  timeLeft = 30;
  timerEl.innerText = `Time Left: ${timeLeft}s`;
  nextBtn.classList.add("hidden");
  nextBtn.disabled = true;
  optionsEl.innerHTML = "";
  progressEl.innerText = "";
}

// Timer
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerText = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      // disable options and reveal correct answer
      Array.from(optionsEl.children).forEach(b=>{
        b.disabled = true;
      });
      const currentQuestion = questions[currentQuestionIndex];
      if(currentQuestion){
        Array.from(optionsEl.children).forEach(b=>{
          if(b.innerText === decodeHTML(currentQuestion.correct_answer)) b.classList.add('correct');
        });
      }
      nextBtn.classList.remove("hidden");
      nextBtn.disabled = false;
    }
  }, 1000);
}
