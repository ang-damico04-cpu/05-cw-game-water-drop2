// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly

// Add score variable
let score = 0;

// Add timer variables
let time = 30;
let timerInterval;

// Difficulty-related defaults (will be overridden by selection)
let spawnIntervalDefault = 1000;
let fallDurationDefault = 4; // seconds
let badDropChanceDefault = 0.1;

// Winning and losing messages
const winningMessages = [
  "Great job! You caught enough drops!",
  "Winner! You mastered the water drops!",
  "Awesome! You reached the goal!",
  "Congratulations! You win!",
  "Fantastic! You have quick reflexes!"
];
const losingMessages = [
  "Try again! You can do better!",
  "Almost there! Give it another shot!",
  "Keep practicing! You'll get it!",
  "Don't give up! Try again!",
  "So close! Try once more!"
];

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function getDifficultySettings() {
  const sel = document.querySelector('input[name="difficulty"]:checked')?.value || "medium";
  if (sel === "easy") {
    return { spawnInterval: 1200, fallDuration: 5, badDropChance: 0.05 };
  } else if (sel === "hard") {
    return { spawnInterval: 600, fallDuration: 3, badDropChance: 0.2 };
  } else { // medium
    return { spawnInterval: 900, fallDuration: 4, badDropChance: 0.1 };
  }
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;

  // Reset score and timer at the start of the game
  score = 0;
  time = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = time;

  // Clear any leftover drops and previous message
  const container = document.getElementById("game-container");
  container.querySelectorAll(".water-drop, .score-popup").forEach(n => n.remove());
  const oldMsg = document.getElementById("result-message");
  if (oldMsg) oldMsg.remove();

  // Get difficulty settings and apply
  const settings = getDifficultySettings();
  spawnIntervalDefault = settings.spawnInterval;
  fallDurationDefault = settings.fallDuration;
  badDropChanceDefault = settings.badDropChance;

  // Start timer countdown
  timerInterval = setInterval(updateTimer, 1000);

  // Create new drops based on selected spawn interval
  dropMaker = setInterval(createDrop, spawnIntervalDefault);
}

function updateTimer() {
  time -= 1;
  document.getElementById("time").textContent = time;
  if (time <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  // Remove any existing message
  let messageDiv = document.getElementById("result-message");
  if (!messageDiv) {
    messageDiv = document.createElement("div");
    messageDiv.id = "result-message";
    messageDiv.style.textAlign = "center";
    messageDiv.style.fontSize = "1.5em";
    messageDiv.style.margin = "20px 0";
    document.querySelector(".game-wrapper").insertBefore(messageDiv, document.getElementById("game-container"));
  }

  // Pick and show message
  if (score >= 20) {
    const msg = winningMessages[Math.floor(Math.random() * winningMessages.length)];
    messageDiv.textContent = msg;
    messageDiv.style.color = "#FFC907";
  } else {
    const msg = losingMessages[Math.floor(Math.random() * losingMessages.length)];
    messageDiv.textContent = msg;
    messageDiv.style.color = "#BF6C46"; // updated losing color
  }
}

function createDrop() {
  // Prevent drops if game ended
  if (!gameRunning) return;

  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameContainer = document.getElementById("game-container");
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * Math.max(0, (gameWidth - size));
  drop.style.left = xPosition + "px";

  // Set animation duration from difficulty
  drop.style.animationDuration = `${fallDurationDefault}s`;

  // Chance to be a bad drop based on difficulty
  if (Math.random() < badDropChanceDefault) {
    drop.classList.add("bad-drop");
  }

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });

  // Add click event to update score
  drop.addEventListener("click", (e) => {
    if (!gameRunning) return; // Prevent scoring after game ends

    // Prevent double-counting for the same drop
    if (drop.dataset.clicked === "true") return;
    drop.dataset.clicked = "true";

    const scoreEl = document.getElementById("score");

    // Determine if drop is bad
    const isBad = drop.classList.contains("bad-drop");
    if (!isBad) {
      score += 1;
    } else {
      score = Math.max(0, score - 1); // penalize but don't go below 0
    }
    if (scoreEl) scoreEl.textContent = score;

    // Create a brief floating popup at click position
    const popup = document.createElement("span");
    popup.textContent = isBad ? "-1" : "+1";
    popup.style.position = "absolute";
    popup.style.pointerEvents = "none";
    popup.style.fontWeight = "bold";
    popup.style.color = isBad ? "#BF6C46" : "#003366";
    popup.style.left = (e.clientX - gameContainer.getBoundingClientRect().left) + "px";
    popup.style.top = (e.clientY - gameContainer.getBoundingClientRect().top) + "px";
    popup.style.transition = "transform 600ms ease-out, opacity 600ms ease-out";
    popup.style.transform = "translateY(0px)";
    popup.style.opacity = "1";
    popup.className = "score-popup";

    gameContainer.appendChild(popup);

    // Trigger animation (move up and fade)
    requestAnimationFrame(() => {
      popup.style.transform = "translateY(-40px)";
      popup.style.opacity = "0";
    });

    // Clean up popup after animation
    setTimeout(() => popup.remove(), 650);

    drop.remove(); // Remove drop when clicked
  });
}
