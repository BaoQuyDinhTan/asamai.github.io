const baucuaArr = ["Cop", "Bau", "Ga", "Tom", "Ca", "Cua"];
let cntDatcuoc = [0, 0, 0, 0, 0, 0];
let cntRoll = [0, 0, 0, 0, 0, 0];
let money = 10;

document.getElementById("displayMoney").innerHTML = money;

function increaseDatcuoc(idDatcuoc) {
    if (money == 0) {
        alert("Ban da het tien de dat them :(");
        return;
    }
    cntDatcuoc[idDatcuoc]++;
    money--;
    document.getElementById("displayMoney").innerHTML = money;
    document.getElementById("displayBaucuaDatcuoc" + idDatcuoc).innerHTML = cntDatcuoc[idDatcuoc];
}

function decreaseDatcuoc(idDatcuoc) {
    if (cntDatcuoc[idDatcuoc] == 0) {
        return;
    }
    cntDatcuoc[idDatcuoc]--;
    money++;
    document.getElementById("displayMoney").innerHTML = money;
    document.getElementById("displayBaucuaDatcuoc" + idDatcuoc).innerHTML = cntDatcuoc[idDatcuoc];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function startBaucua() {
    let baucuaResultStr = "";
    for (let i = 0; i < 6; i++) {
        cntRoll[i] = 0;
    }
    for (let i = 0; i < 3; i++) {
        let id = getRandomInt(6);
        cntRoll[id]++;
        baucuaResultStr += `<td><img src="Images/BauCua/` + baucuaArr[id] + `.jpg" class="baucua-picture"></td>`;
    }
    let winMoney = 0;
    for (let i = 0; i < 6; i++) {
        if (cntRoll[i] > 0) {
            winMoney += cntDatcuoc[i] * (cntRoll[i] + 1);
        }
        cntDatcuoc[i] = 0;
    }
    money += winMoney;
    for (let i = 0; i < 6; i++) {
        document.getElementById("displayBaucuaDatcuoc" + i).innerHTML = 0;
    }
    document.getElementById("displayMoney").innerHTML = money;
    document.getElementById("displayWinMoney").innerHTML = winMoney;
    document.getElementById("baucuaResult").innerHTML = baucuaResultStr;
}