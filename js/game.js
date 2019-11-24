var player = {
    ticks: 0,
    users: 0,
    money: 0,
    energy: 0,
    employees: 1,
    income: 0,
    upgrades: [],
}

var resources = ['money', 'energy', 'income'];

var upgradeCosts = {
    mon11: {
        energy: 8,
    },
    office1: {
        income: 1
    },
};

// TODO: remove
player.devMode = true;

const NUM_ROOMMATES = 3;
const NUM_RECRUITS = 7;
const TICKS_PER_DAY = 50;

function wordOfMouth() {
    if (player.energy >= 1) {
        player.energy--;
        player.users++;
    }
}

function hireDevelopers() {
    if (player.employees <= NUM_RECRUITS) {
        let requiredEnergy = getDeveloperCost();
        if (player.energy >= requiredEnergy) {
            player.energy -= requiredEnergy;
            player.employees++;
        }
    }
    else {
        let requiredMoney = getDeveloperCost();
        if (player.money >= requiredMoney) {
            player.money -= requiredMoney;
            player.employees++;
        }
    }
    updateCostsUI();
}

function tick() {
    player.ticks++;
    player.energy += player.employees / TICKS_PER_DAY;
    if (player.energy > getMaxEnergy()) {
        player.energy = getMaxEnergy();
    }
    player.money += getIncome() / TICKS_PER_DAY;
    updateUI();
}

function updateUI() {
    document.getElementById("days").innerText = (player.ticks / TICKS_PER_DAY).toFixed(1);
    document.getElementById("userAmount").innerText = player.users.toFixed(0);
    document.getElementById("developerAmount").innerText = player.employees.toFixed(0);
    document.getElementById("energyAmount").innerText = player.energy.toFixed(1);
    document.getElementById("energyLimit").innerText = getMaxEnergy().toFixed(1);
    document.getElementById("moneyAmount").innerText = player.money.toFixed(2);
    document.getElementById("incomeAmount").innerText = formatRate(getIncome(), 2);
    updateUpgradesUI();
    if (player.users >= 20) {
        let monetizationTab = document.getElementById("monetizationTabLink")
        if (monetizationTab.innerText !== "Monetization") {
            monetizationTab.innerText = "Monetization";
        }
        if (monetizationTab.disabled !== false) {
            monetizationTab.disabled = false;
        }
    }
    if (player.devMode) {
        document.getElementById("devModeTabLink").style.display = "block";
    }
}

function updateCostsUI() {
    if (player.employees >= NUM_RECRUITS + 1) {
        document.getElementById("hireEmployees").innerText = `Hire employees (cost: ${getDeveloperCost().toFixed(2)} money)`;
    }
    else if (player.employees >= NUM_ROOMMATES + 1) {
        document.getElementById("hireEmployees").innerText = `Recruit other people to help (cost: ${getDeveloperCost().toFixed(0)} employee time)`;
    }
    else {
        document.getElementById("hireEmployees").innerText = `Convince your roommate to help (cost: ${getDeveloperCost().toFixed(0)} employee time)`;
    }
}

function updateUpgradesUI() {
    document.getElementById("freeUsers").disabled = player.energy < 1;
    document.getElementById("hireEmployees").disabled = player.employees <= NUM_RECRUITS ?
        player.energy < getDeveloperCost() : player.money < getDeveloperCost();
    for (let id in upgradeCosts) {
        let cost = upgradeCosts[id];
        document.getElementById(id).disabled = !costGTE(player, cost);
    }
}



function buyUpgrade(thisElem) {
    let name = thisElem.id;
    let cost = upgradeCosts[name];
    if (!player.upgrades.includes(name) && costGTE(player, cost)) {
        subCost(player, cost);
        player.upgrades.push(name);
        thisElem.className += " upgradebtn--purchased";
    }
}

function getMaxEnergy() {
    return player.employees * 4 - 2;
}

function getIncome() {
    let income = 0;
    if (player.upgrades.includes("mon11")) {
        income = player.users / 1000;
    }
    return income;
}

function getDeveloperCost() {
    if (player.employees <= NUM_ROOMMATES) {
        return 1 + player.employees;
    }
    else if (player.employees <= NUM_RECRUITS) {
        return (NUM_ROOMMATES + 1) * 1.5 ** (player.employees - NUM_ROOMMATES);
    }
    return 50 * 1.1 ** (player.employees - NUM_RECRUITS - 1);
}

function formatRate(value, decimals) {
    decimals = decimals || 0;
    let output = value.toFixed(decimals);
    if (output >= 0) {
        return `+${output}`;
    }
    return output;
}

function costGTE(cost1, cost2) {
    for (let i = 0; i < resources.length; ++i) {
        let resource = resources[i];
        if ((cost1[resource] || 0) < (cost2[resource] || 0)) {
            return false;
        }
    }
    return true;
}

function subCost(cost1, cost2) {
    for (let i = 0; i < resources.length; ++i) {
        let resource = resources[i];
        cost1[resource] = (cost1[resource] || 0) - (cost2[resource] || 0);
    }
}

updateCostsUI();

setInterval(tick, 100);