let allWords = [];
let currentWords = [];
let turn = 1;

// UI Elements
const fileInput = document.getElementById("word-file");
const fileSection = document.getElementById("file-section");
const gameSection = document.getElementById("game-section");
const turnNum = document.getElementById("turn-num");
const wordsLeft = document.getElementById("words-left");
const suggestedWord = document.getElementById("suggested-word");
const typedWordInput = document.getElementById("typed-word");
const submitBtn = document.getElementById("submit-btn");
const resetBtn = document.getElementById("reset-btn");
const tiles = document.querySelectorAll(".tile");

// Load words.txt file
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const text = evt.target.result;
    allWords = text
      .split(/\r?\n/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length === 5);

    if (allWords.length === 0) {
      alert("No valid 5-letter words found in file!");
      return;
    }

    fileSection.classList.add("hidden");
    gameSection.classList.remove("hidden");
    initGame();
  };
  reader.readAsText(file);
});

// Tile click toggles state (0 -> 1 -> 2 -> 0)
tiles.forEach(tile => {
  tile.addEventListener("click", () => {
    let state = parseInt(tile.getAttribute("data-state"));
    state = (state + 1) % 3;
    tile.setAttribute("data-state", state);
    tile.textContent = state;

    tile.className = "tile " + (state === 2 ? "green" : state === 1 ? "yellow" : "grey");
  });
});

function initGame() {
  currentWords = [...allWords];
  turn = 1;
  nextTurn();
}

function nextTurn() {
  if (currentWords.length === 0) {
    alert("No words left! Double-check your feedback entries.");
    return;
  }

  turnNum.textContent = turn;
  wordsLeft.textContent = currentWords.length;

  const guess = pickWord(currentWords, turn === 1);
  suggestedWord.textContent = guess.toUpperCase();
  typedWordInput.value = guess;
  resetTiles();
}

function resetTiles() {
  tiles.forEach(tile => {
    tile.setAttribute("data-state", "0");
    tile.textContent = "0";
    tile.className = "tile grey";
  });
}

function checkWord(w, g, fb) {
  for (let i = 0; i < 5; i++) {
    if (fb[i] === '2' && w[i] !== g[i]) return false;
    if (fb[i] === '1' && w[i] === g[i]) return false;
  }

  let need = Array(26).fill(0);
  let bad = Array(26).fill(false);

  for (let i = 0; i < 5; i++) {
    let idx = g.charCodeAt(i) - 97;
    if (fb[i] === '0') bad[idx] = true;
    else need[idx]++;
  }

  let count = Array(26).fill(0);
  for (let i = 0; i < 5; i++) {
    count[w.charCodeAt(i) - 97]++;
  }

  for (let i = 0; i < 5; i++) {
    let idx = g.charCodeAt(i) - 97;
    if (count[idx] < need[idx]) return false;
    if (bad[idx] && count[idx] !== need[idx]) return false;
  }

  return true;
}

function pickWord(list, first) {
  let freq = Array(26).fill(0);

  // 1. Count letter frequencies across remaining word list
  for (let w of list) {
    let used = Array(26).fill(false);
    for (let i = 0; i < 5; i++) used[w.charCodeAt(i) - 97] = true;
    for (let i = 0; i < 26; i++) if (used[i]) freq[i]++;
  }

  // 2. Score every word based on letter frequency
  let maxScore = 0;
  let scores = [];

  for (let w of list) {
    let used = Array(26).fill(false);
    let s = 0;
    for (let i = 0; i < 5; i++) {
      let idx = w.charCodeAt(i) - 97;
      if (!used[idx]) {
        used[idx] = true;
        s += freq[idx];
      }
    }
    scores.push(s);
    if (s > maxScore) maxScore = s;
  }

  // 3. Turn 1: Pick a random word from top 15% scoring candidates
  if (first && maxScore > 0) {
    let top = [];
    for (let i = 0; i < list.length; i++) {
      if (scores[i] >= maxScore * 0.85) {
        top.push(list[i]);
      }
    }

    if (top.length > 0) {
      let randomIndex = Math.floor(Math.random() * top.length);
      return top[randomIndex];
    }
  }

  // 4. Turns 2+: Pick the absolute top scoring word
  for (let i = 0; i < list.length; i++) {
    if (scores[i] === maxScore) return list[i];
  }

  return list[0];
}

submitBtn.addEventListener("click", () => {
  const typed = typedWordInput.value.toLowerCase().trim();
  if (typed.length !== 5) {
    alert("Typed word must be 5 letters long!");
    return;
  }

  let fb = "";
  tiles.forEach(tile => fb += tile.getAttribute("data-state"));

  if (fb === "22222") {
    alert(`Solved in ${turn} tries! 🎉`);
    initGame();
    return;
  }

  currentWords = currentWords.filter(w => checkWord(w, typed, fb));
  turn++;
  nextTurn();
});

resetBtn.addEventListener("click", initGame);