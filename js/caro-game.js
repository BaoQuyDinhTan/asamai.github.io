import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBEOcQ04f7vHve1G39PriVV4eTT7o1RQnU",
    authDomain: "simple-caro-game-asamai.firebaseapp.com",
    projectId: "simple-caro-game-asamai",
    storageBucket: "simple-caro-game-asamai.firebasestorage.app",
    messagingSenderId: "242098215341",
    appId: "1:242098215341:web:e79314765a88d02fde6924",
    measurementId: "G-0CMF3KFHYT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const playerXInput = document.getElementById("playerXInput");
const playerOInput = document.getElementById("playerOInput");
const playerStats = document.getElementById("playerStats");
const playerXInfo = document.getElementById("playerXInfo");
const playerOInfo = document.getElementById("playerOInfo");
const board = document.getElementById("caroBoard");
const statusText = document.getElementById("statusText");
const boardSizeSelector = document.getElementById("boardSize");
const memoryModeSelect = document.getElementById("memoryModeSelect");
const gameModeSelect = document.getElementById("gameModeSelect");

let currentPlayer = "X";
let gameActive = true;
let boardState = [];
let size = 3;
let winLength = 3;
let memoryMode = "none";
let hiddenCells = new Set();
let playerX = "";
let playerO = "";
let gameMode = "pvp";
let aiSession = null;

async function loadAIModel() {
    aiSession = await ort.InferenceSession.create("./models/caro_model.onnx");
    console.log("AI model loaded");
}

function encodeBoard(boardArray, boardSize) {
    const flatBoard = [];

    for (let i = 0; i < boardSize * boardSize; i++) {
        const value = boardArray[i];
        flatBoard.push(value === "X" ? 1 : value === "O" ? -1 : 0);
    }

    while (flatBoard.length < 100) {
        flatBoard.push(-2);
    }

    return flatBoard;
}

async function getAIMove(currentBoardState, boardSize) {
    if (!aiSession) {
        return null;
    }

    const inputTensor = new ort.Tensor("float32", Float32Array.from(encodeBoard(currentBoardState, boardSize)), [1, 100]);
    const results = await aiSession.run({ input: inputTensor });
    const output = results.output.data;
    const validIndices = currentBoardState
        .map((value, index) => value === "" ? index : null)
        .filter((index) => index !== null);

    return validIndices
        .map((index) => [index, output[index]])
        .sort((a, b) => b[1] - a[1])[0][0];
}

async function ensureUser(name) {
    const ref = doc(db, "player", name);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        await setDoc(ref, { "winning-count": 0 });
    }
}

async function updateWinCount(name) {
    const ref = doc(db, "player", name);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data()["winning-count"] : 0;
    await setDoc(ref, { "winning-count": current + 1 });
    updatePlayerStatsUI();
}

async function updatePlayerStatsUI() {
    await ensureUser(playerX);
    await ensureUser(playerO);

    const snapX = await getDoc(doc(db, "player", playerX));
    const winsX = snapX.exists() ? snapX.data()["winning-count"] : 0;
    playerXInfo.textContent = `Player X: ${playerX} (Wins: ${winsX})`;

    const snapO = await getDoc(doc(db, "player", playerO));
    const winsO = snapO.exists() ? snapO.data()["winning-count"] : 0;
    playerOInfo.textContent = `Player O: ${playerO} (Wins: ${winsO})`;
}

function startGame() {
    gameMode = gameModeSelect.value;
    playerX = playerXInput.value.trim() || "PlayerX";
    playerO = gameMode === "pve" ? "Machine" : (playerOInput.value.trim() || "PlayerO");

    if (playerX === playerO) {
        alert("Player X and Player O cannot be the same!");
        return;
    }

    playerStats.classList.remove("is-hidden");
    updatePlayerStatsUI();

    size = parseInt(boardSizeSelector.value, 10);
    winLength = size < 5 ? size : 5;
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${size}, 50px)`;
    board.style.gridTemplateRows = `repeat(${size}, 50px)`;
    boardState = Array(size * size).fill("");
    currentPlayer = "X";
    gameActive = true;
    memoryMode = memoryModeSelect.value;
    hiddenCells.clear();
    statusText.textContent = "Player X's Turn";

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement("div");
        cell.classList.add("caro-cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleMove);
        board.appendChild(cell);
    }

    if (memoryMode === "static") {
        blindRandomCells();
    }
}

function handleMove(event) {
    const index = parseInt(event.target.dataset.index, 10);

    if (boardState[index] || !gameActive) {
        return;
    }

    let moveIndex = index;

    if (memoryMode === "randomcancel" && Math.random() < 0.4) {
        const emptyCells = boardState
            .map((value, cellIndex) => value === "" && cellIndex !== index ? cellIndex : null)
            .filter((value) => value !== null);

        if (emptyCells.length > 0) {
            moveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }

    boardState[moveIndex] = currentPlayer;

    if (!hiddenCells.has(moveIndex)) {
        board.children[moveIndex].textContent = currentPlayer;
    }

    if (checkWinner(moveIndex)) {
        statusText.textContent = `Player ${currentPlayer} Wins!`;
        gameActive = false;
        revealAll();
        updateWinCount(currentPlayer === "X" ? playerX : playerO);
        return;
    }

    if (!boardState.includes("")) {
        statusText.textContent = "Draw!";
        gameActive = false;
        revealAll();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s Turn`;

    if (gameMode === "pve" && currentPlayer === "O") {
        setTimeout(async () => {
            const moveIndex = await getAIMove(boardState, size);

            if (moveIndex !== null && boardState[moveIndex] === "") {
                board.children[moveIndex].click();
            } else {
                setTimeout(machineMove, 400);
            }
        }, 500);
    }

    if (memoryMode === "dynamic") {
        blindRandomCells();
    }
}

function machineMove() {
    const emptyCells = boardState
        .map((value, index) => value === "" ? index : null)
        .filter((index) => index !== null);

    if (emptyCells.length === 0 || !gameActive) {
        return;
    }

    const index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board.children[index].click();
}

function blindRandomCells() {
    hiddenCells.clear();

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === "" && Math.random() < 0.25) {
            hiddenCells.add(i);
        }
    }

    for (let i = 0; i < boardState.length; i++) {
        const cell = board.children[i];

        if (hiddenCells.has(i)) {
            cell.classList.add("hidden-cell");
            cell.textContent = "";
        } else {
            cell.classList.remove("hidden-cell");
            cell.textContent = boardState[i];
        }
    }
}

function revealAll() {
    hiddenCells.forEach((index) => {
        const cell = board.children[index];
        cell.classList.remove("hidden-cell");
        cell.textContent = boardState[index];
    });
    hiddenCells.clear();
}

function checkWinner(index) {
    const row = Math.floor(index / size);
    const col = index % size;

    return (
        countConsecutive(row, col, 0, 1) + countConsecutive(row, col, 0, -1) - 1 >= winLength ||
        countConsecutive(row, col, 1, 0) + countConsecutive(row, col, -1, 0) - 1 >= winLength ||
        countConsecutive(row, col, 1, 1) + countConsecutive(row, col, -1, -1) - 1 >= winLength ||
        countConsecutive(row, col, 1, -1) + countConsecutive(row, col, -1, 1) - 1 >= winLength
    );
}

function countConsecutive(row, col, rowStep, colStep) {
    let count = 0;

    while (
        row >= 0 &&
        row < size &&
        col >= 0 &&
        col < size &&
        boardState[row * size + col] === currentPlayer
    ) {
        count++;
        row += rowStep;
        col += colStep;
    }

    return count;
}

document.querySelectorAll("[data-start-caro]").forEach((button) => {
    button.addEventListener("click", startGame);
});

startGame();
loadAIModel();
window.startGame = startGame;
