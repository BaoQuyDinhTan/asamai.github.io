const bauCuaPieces = ["Cop", "Bau", "Ga", "Tom", "Ca", "Cua"];
const betCounts = [0, 0, 0, 0, 0, 0];
const rollCounts = [0, 0, 0, 0, 0, 0];
let playerMoney = 10;

const moneyDisplay = document.getElementById("displayMoney");
const winningsDisplay = document.getElementById("displayWinMoney");
const resultTable = document.getElementById("baucuaResult");

function updateMoneyDisplay() {
    moneyDisplay.textContent = playerMoney;
}

function updateBetDisplay(pieceIndex) {
    document.getElementById(`displayBaucuaBet${pieceIndex}`).textContent = betCounts[pieceIndex];
}

function increaseBet(pieceIndex) {
    if (playerMoney === 0) {
        alert("Ban da het tien de dat them :(");
        return;
    }

    betCounts[pieceIndex]++;
    playerMoney--;
    updateMoneyDisplay();
    updateBetDisplay(pieceIndex);
}

function decreaseBet(pieceIndex) {
    if (betCounts[pieceIndex] === 0) {
        return;
    }

    betCounts[pieceIndex]--;
    playerMoney++;
    updateMoneyDisplay();
    updateBetDisplay(pieceIndex);
}

function getRandomIndex(max) {
    return Math.floor(Math.random() * max);
}

function resetRollCounts() {
    for (let i = 0; i < rollCounts.length; i++) {
        rollCounts[i] = 0;
    }
}

function resetBets() {
    for (let i = 0; i < betCounts.length; i++) {
        betCounts[i] = 0;
        updateBetDisplay(i);
    }
}

function rollBauCua() {
    resetRollCounts();

    const rolledPieces = [];
    for (let i = 0; i < 3; i++) {
        const pieceIndex = getRandomIndex(bauCuaPieces.length);
        rollCounts[pieceIndex]++;
        rolledPieces.push(bauCuaPieces[pieceIndex]);
    }

    return rolledPieces;
}

function calculateWinnings() {
    let winnings = 0;

    for (let i = 0; i < bauCuaPieces.length; i++) {
        if (rollCounts[i] > 0) {
            winnings += betCounts[i] * (rollCounts[i] + 1);
        }
    }

    return winnings;
}

function renderRollResults(rolledPieces) {
    resultTable.innerHTML = "";
    const row = document.createElement("tr");

    rolledPieces.forEach((piece) => {
        const cell = document.createElement("td");
        const image = document.createElement("img");
        image.src = `Images/BauCua/${piece}.jpg`;
        image.className = "baucua-picture";
        image.alt = piece;
        cell.appendChild(image);
        row.appendChild(cell);
    });

    resultTable.appendChild(row);
}

function startBauCua() {
    const rolledPieces = rollBauCua();
    const winnings = calculateWinnings();

    playerMoney += winnings;
    resetBets();
    updateMoneyDisplay();
    winningsDisplay.textContent = winnings;
    renderRollResults(rolledPieces);
}

document.querySelectorAll("[data-baucua-action]").forEach((button) => {
    button.addEventListener("click", () => {
        const pieceIndex = Number(button.dataset.baucuaBet);

        if (button.dataset.baucuaAction === "increase") {
            increaseBet(pieceIndex);
            return;
        }

        decreaseBet(pieceIndex);
    });
});

document.querySelector("[data-start-baucua]")?.addEventListener("click", startBauCua);

updateMoneyDisplay();

window.increaseBet = increaseBet;
window.decreaseBet = decreaseBet;
window.startBauCua = startBauCua;

window.increaseDatcuoc = increaseBet;
window.decreaseDatcuoc = decreaseBet;
window.startBaucua = startBauCua;
