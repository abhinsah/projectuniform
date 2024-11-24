let questions = [];
let currentQuestion = 0;
let userResponses = {};
let score = 0;
let timer;
let timeLimit;
const subjects = [
    { name: "9th Chemistry", file: "chemistry.json", img: "chemistry.webp" },
    { name: "9th Biology", file: "biology.json", img: "bio.webp" },
    { name: "10th Chemistry", file: "chemistry10.json", img: "chemistry10.webp" },
    { name: "Physical Geography", file: "phygeo.json", img: "phygeo.webp" },
    { name: "9th Physics", file: "phy.json", img: "physics.webp" },
    { name: "10th Biology", file: "bio10.json", img: "bio10.webp" },
    { name: "10th Physics", file: "phy10.json", img: "physics10.webp" },
    { name: "English", file: "history.json", img: "eng.webp" },
    { name: "Indian Geography", file: "indgeo.json", img: "indgeo.webp" },
    { name: "Ancient History", file: "anc.json", img: "ancient.webp" },
    { name: "Medieval History", file: "med.json", img: "medieval.webp" },
    { name: "Modern History", file: "mod.json", img: "modern.webp" },
    { name: "Macro Eco", file: "macro.json", img: "macro.webp" },
    { name: "Micro Eco", file: "micro.json", img: "micro.webp" },
    { name: "Environment Studies", file: "history.json", img: "env.webp" },
    { name: "Current Affairs", file: "history.json", img: "ca.webp" },
];

// Load subject boxes on home page
function loadSubjects() {
    const container = document.getElementById("subject-container");
    container.innerHTML = subjects.map(
        (subject) => `
        <div class="subject-box" onclick="selectSubject('${subject.file}')">
            <img src="${subject.img}" alt="${subject.name}">
            <h3>${subject.name}</h3>
        </div>
    `
    ).join("");
}

// Load questions for the selected subject
async function selectSubject(file) {
    try {
        const response = await fetch(file);
        questions = await response.json();

        if (questions.length === 0) {
            alert("No questions available.");
            return;
        }

        document.getElementById("home-page").style.display = "none";
        document.getElementById("time-selection-page").style.display = "block";
        document.getElementById("question-count").innerText = `This test contains ${questions.length} questions.`;
    } catch (error) {
        console.error("Error loading questions:", error);
        alert("No Questions Found For This Subject, Check Others");
    }
}

// Start the timer
function startTimer() {
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timer';
    timerDisplay.style.position = 'fixed';
    timerDisplay.style.top = '10px';
    timerDisplay.style.right = '10px';
    timerDisplay.style.backgroundColor = '#fff';
    timerDisplay.style.border = '1px solid #ddd';
    timerDisplay.style.padding = '10px';
    timerDisplay.style.fontSize = '16px';
    timerDisplay.style.borderRadius = '5px';
    document.body.appendChild(timerDisplay);

    timer = setInterval(() => {
        if (timeLimit <= 0) {
            clearInterval(timer);
            alert("Time is up! Submitting your test.");
            submitExam();
        } else {
            const minutes = Math.floor(timeLimit / 60);
            const seconds = timeLimit % 60;
            timerDisplay.textContent = `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeLimit--;
        }
    }, 1000);
}

// Start the exam
function startExam() {
    const timeLimitInput = document.getElementById("time-limit").value;
    if (!timeLimitInput || isNaN(timeLimitInput) || timeLimitInput <= 0) {
        alert("Please enter a valid time limit in minutes.");
        return;
    }

    timeLimit = parseInt(timeLimitInput, 10) * 60;
    startTimer();

    document.getElementById("time-selection-page").style.display = "none";
    document.getElementById("exam-page").style.display = "block";
    loadQuestion();
    addEarlySubmitButton(); // Add the early submission button
}

function goBack() {
    document.getElementById("time-selection-page").style.display = "none";
    document.getElementById("home-page").style.display = "block";
}

function loadQuestion() {
    const questionContainer = document.getElementById("question-container");
    const current = questions[currentQuestion];

    questionContainer.innerHTML = `
        <h2>Question ${currentQuestion + 1} of ${questions.length}</h2>
        <p>${current.question}</p>
        ${Object.entries(current.options).map(
            ([key, value]) => `
            <div>
                <input type="radio" name="option" value="${key}" id="option-${key}" ${
                    userResponses[currentQuestion] === key ? "checked" : ""
                }>
                <label for="option-${key}">${value}</label>
            </div>
        `
        ).join("")}
    `;
    updateNavigationButtons();
    toggleOptionSelection(); // Allow unselecting options
}

function toggleOptionSelection() {
    const options = document.querySelectorAll("input[name='option']");
    options.forEach(option => {
        option.addEventListener("click", function (e) {
            const isChecked = this.getAttribute("data-selected") === "true";
            options.forEach(opt => opt.removeAttribute("data-selected")); // Clear states
            if (isChecked) {
                this.checked = false; // Uncheck the current option
                this.removeAttribute("data-selected");
            } else {
                this.setAttribute("data-selected", "true");
            }
        });
    });
}


function updateNavigationButtons() {
    document.getElementById("prev-button").style.display = currentQuestion > 0 ? "block" : "none";
    document.getElementById("next-button").style.display = currentQuestion < questions.length - 1 ? "block" : "none";
    document.getElementById("submit-button").style.display = currentQuestion === questions.length - 1 ? "block" : "none";
}

function saveResponse() {
    const selectedOption = document.querySelector("input[name='option']:checked");
    if (selectedOption) {
        userResponses[currentQuestion] = selectedOption.value;
    }
}

function nextQuestion() {
    saveResponse();
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    }
}

function prevQuestion() {
    saveResponse();
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function submitExam() {
    saveResponse();
    calculateScore();
    showResult();
}

function calculateScore() {
    score = Object.entries(userResponses).reduce((acc, [index, response]) => {
        if (response === questions[index].answer) {
            return acc + 1;
        } else if (response) {
            return acc - 0.33;
        } else {
            return acc;
        }
    }, 0);

    score = Math.max(0, score).toFixed(2);
}

function showResult() {
    clearInterval(timer); // Stop the timer
    document.getElementById("exam-page").style.display = "none";
    document.getElementById("result-page").style.display = "block";
    document.getElementById("score").innerText = `${score}/${questions.length}`;
    document.getElementById("detailed-result").innerHTML = questions.map((q, i) => {
        const userAnswer = userResponses[i];
        const isCorrect = userAnswer === q.answer;
        const answerClass = isCorrect ? "correct-answer" : userAnswer ? "wrong-answer" : "not-answered";

        return `
            <div>
                <h3>${q.question}</h3>
                <p class="correct-answer">Correct Answer: ${q.options[q.answer]}</p>
                <p class="${answerClass}">Your Answer: ${
            userAnswer ? q.options[userAnswer] : "<span class='not-answered'>Not Answered</span>"
        }</p>
            </div>
        `;
    }).join("");
}

function addEarlySubmitButton() {
    const earlySubmitButton = document.createElement("button");
    earlySubmitButton.id = "early-submit-button";
    earlySubmitButton.textContent = "Submit Test Early";
    earlySubmitButton.style.position = "fixed";
    earlySubmitButton.style.bottom = "20px";
    earlySubmitButton.style.right = "20px";
    earlySubmitButton.style.backgroundColor = "#dc3545";
    earlySubmitButton.style.color = "#fff";
    earlySubmitButton.style.border = "none";
    earlySubmitButton.style.padding = "10px 20px";
    earlySubmitButton.style.borderRadius = "5px";
    earlySubmitButton.style.fontSize = "16px";
    earlySubmitButton.style.cursor = "pointer";

    earlySubmitButton.addEventListener("click", function () {
        const confirmSubmit = confirm("Are you sure you want to submit the test early?");
        if (confirmSubmit) {
            submitExam();
        }
    });

    document.body.appendChild(earlySubmitButton);
}

function restartExam() {
    clearInterval(timer);
    currentQuestion = 0;
    userResponses = {};
    score = 0;
    document.getElementById("result-page").style.display = "none";
    document.getElementById("home-page").style.display = "block";
    loadSubjects();
}

// Initialize subjects on page load
document.addEventListener("DOMContentLoaded", loadSubjects);
