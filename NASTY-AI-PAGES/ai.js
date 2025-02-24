// Adventure Game (existing)
const gameOutput = document.getElementById('gameOutput');
const startGameButton = document.getElementById('startGameButton');
let currentRoom = "room1";
let inventory = [];

const rooms = {
  room1: {
    description: "You are in a dimly lit room. There are doors to the north and east.",
    north: "room2",
    east: "room3",
    item: "a dusty old book"
  },
  room2: {
    description: "You are in a library filled with ancient texts. There's a door to the south.",
    south: "room1",
    item: "a magical wand"
  },
  room3: {
    description: "You find yourself in a garden filled with strange flowers. There's a door to the west.",
    west: "room1",
    item: "a beautiful flower"
  },
};

startGameButton.addEventListener('click', startGame);

function startGame() {
  gameOutput.innerHTML = `<p>${rooms[currentRoom].description}</p>`;
  if (rooms[currentRoom].item) {
    gameOutput.innerHTML += `<p>You see ${rooms[currentRoom].item}. <button id="takeItemButton">Take Item</button></p>`;
  }
  displayMovementOptions();
}

function displayMovementOptions() {
  const options = Object.keys(rooms[currentRoom]).filter(key => key !== 'description' && key !== 'item');
  options.forEach(option => {
    gameOutput.innerHTML += `<button class="button" id="${option}Button">Go ${option.charAt(0).toUpperCase() + option.slice(1)}</button>`;
  });

  options.forEach(option => {
    document.getElementById(`${option}Button`).addEventListener('click', () => moveToRoom(rooms[currentRoom][option]));
  });

  document.getElementById('takeItemButton')?.addEventListener('click', takeItem);
}

function moveToRoom(nextRoom) {
  currentRoom = nextRoom;
  startGame();
}

function takeItem() {
  inventory.push(rooms[currentRoom].item);
  rooms[currentRoom].item = null;
  gameOutput.innerHTML = `<p>You took the item! Your inventory: ${inventory.join(', ')}</p>`;
  startGame();
}

// Number Guessing Game
const guessingGameOutput = document.getElementById('guessingGameOutput');
const startGuessingGameButton = document.getElementById('startGuessingGameButton');
let randomNumber = 0;

startGuessingGameButton.addEventListener('click', startGuessingGame);

function startGuessingGame() {
  randomNumber = Math.floor(Math.random() * 100) + 1;
  guessingGameOutput.innerHTML = `<p>Guess a number between 1 and 100:</p>
                                    <input type="number" id="guessInput">
                                    <button class="button" id="guessButton">Submit Guess</button>`;
  document.getElementById('guessButton').addEventListener('click', checkGuess);
}

function checkGuess() {
  const userGuess = parseInt(document.getElementById('guessInput').value);
  if (userGuess === randomNumber) {
    guessingGameOutput.innerHTML = `<p>Congratulations! You guessed the number correctly!</p>`;
  } else if (userGuess > randomNumber) {
    guessingGameOutput.innerHTML = `<p>Too high! Try again:</p>`;
    startGuessingGame();
  } else {
    guessingGameOutput.innerHTML = `<p>Too low! Try again:</p>`;
    startGuessingGame();
  }
}

// Rock-Paper-Scissors Game
const rpsGameOutput = document.getElementById('rpsGameOutput');
const startRPSButton = document.getElementById('startRPSButton');

startRPSButton.addEventListener('click', startRPSGame);

function startRPSGame() {
  rpsGameOutput.innerHTML = `<p>Choose Rock, Paper, or Scissors:</p>
                               <button class="button" id="rockButton">Rock</button>
                               <button class="button" id="paperButton">Paper</button>
                               <button class="button" id="scissorsButton">Scissors</button>`;
  document.getElementById('rockButton').addEventListener('click', () => playRPS('rock'));
  document.getElementById('paperButton').addEventListener('click', () => playRPS('paper'));
  document.getElementById('scissorsButton').addEventListener('click', () => playRPS('scissors'));
}

function playRPS(playerChoice) {
  const choices = ['rock', 'paper', 'scissors'];
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  if (playerChoice === computerChoice) {
    rpsGameOutput.innerHTML = `<p>It's a tie! You both chose ${playerChoice}.</p>`;
  } else if (
    (playerChoice === 'rock' && computerChoice === 'scissors') ||
    (playerChoice === 'paper' && computerChoice === 'rock') ||
    (playerChoice === 'scissors' && computerChoice === 'paper')
  ) {
    rpsGameOutput.innerHTML = `<p>You win! ${playerChoice} beats ${computerChoice}.</p>`;
  } else {
    rpsGameOutput.innerHTML = `<p>You lose! ${computerChoice} beats ${playerChoice}.</p>`;
  }
}

// Quiz Game
const quizGameOutput = document.getElementById('quizGameOutput');
const startQuizButton = document.getElementById('startQuizButton');

startQuizButton.addEventListener('click', startQuizGame);

function startQuizGame() {
  const quizQuestions = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is 5 + 7?", answer: "12" },
    { question: "What is the color of the sky on a clear day?", answer: "Blue" }
  ];
  let currentQuestionIndex = 0;

  displayQuizQuestion();

  function displayQuizQuestion() {
    if (currentQuestionIndex < quizQuestions.length) {
      quizGameOutput.innerHTML = `<p>${quizQuestions[currentQuestionIndex].question}</p>
                                        <input type="text" id="quizAnswerInput">
                                        <button class="button" id="submitQuizAnswerButton">Submit Answer</button>`;
      document.getElementById('submitQuizAnswerButton').addEventListener('click', checkQuizAnswer);
    } else {
      quizGameOutput.innerHTML = `<p>You've completed the quiz!</p>`;
    }
  }

  function checkQuizAnswer() {
    const userAnswer = document.getElementById('quizAnswerInput').value.trim();
    if (userAnswer.toLowerCase() === quizQuestions[currentQuestionIndex].answer.toLowerCase()) {
      quizGameOutput.innerHTML = `<p>Correct!</p>`;
    } else {
      quizGameOutput.innerHTML = `<p>Incorrect! The correct answer was ${quizQuestions[currentQuestionIndex].answer}.</p>`;
    }
    currentQuestionIndex++;
    setTimeout(displayQuizQuestion, 1000);
  }
}
