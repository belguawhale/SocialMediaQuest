var player = {
    ticks: 0,
    users: 0,
    data: 0,
    money: 500,
    energy: 0,
    employees: 1,
    income: -10,
    upgrades: [],
    currentlyUpgrading: null,
}

var resources = ['money', 'energy', 'income'];

var upgradeCosts = {
    mon1: {
        energy: 20,
    },
    mon2: {
        energy: 40,
    },
    mon3: {
        energy: 100,
    },
    platform11: {
        energy: 25,
    },
    platform12: {
        energy: 40,
    },
    platform21: {
        energy: 50,
    },
    platform22: {
        energy: 65,
    },
    platform31: {
        energy: 85,
    },
    platform32: {
        energy: 125,
    },
    partner1: {
        energy: 30,
    },
    partner2: {
        energy: 50,
    },
    partner3: {
        energy: 70,
    },
    office1: {
        validate: false,
        income: 5,
    },
    office2: {
        validate: false,
        income: 100,
    },
    user1: {
        energy: 15,
    },
    user2: {
        validate: false,
        income: 10,
    },
};

var normalUpgrades = ["office1", "office2", "user2"];

// TODO: remove
player.devMode = true;

const NUM_ROOMMATES = 3;
const NUM_RECRUITS = 3;
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
        player.income -= getDeveloperCost();
        player.employees++;
    }
    updateCostsUI();
}

function tick() {
    player.ticks++;
    player.energy += getEmployeeTimeProduction() / TICKS_PER_DAY;
    if (player.energy > getMaxEnergy()) {
        player.energy = getMaxEnergy();
    }
    player.money += getIncome() / TICKS_PER_DAY;
    player.data += getDataProduction() / TICKS_PER_DAY;
    player.users += getUserProduction() / TICKS_PER_DAY;
    if (player.currentlyUpgrading) {
        let energySpent = Math.min(player.energy, upgradeCosts[player.currentlyUpgrading].energy);
        player.energy -= energySpent;
        upgradeCosts[player.currentlyUpgrading].energy -= energySpent;
        if (upgradeCosts[player.currentlyUpgrading].energy <= 0) {
            player.upgrades.push(player.currentlyUpgrading);
            document.getElementById(player.currentlyUpgrading).className += " upgradebtn--purchased";
            completeEnergyUpgrade(player.currentlyUpgrading);
            updateEnergyUpgradesUI();
            player.currentlyUpgrading = null;
        }
    }
    updateUI();
    if (player.money < 0) {
        clearInterval(tickInterval);
        alert("Game over! You ran out of money :(");
    }
}

function updateUI() {
    document.getElementById("days").innerText = (player.ticks / TICKS_PER_DAY).toFixed(1);
    document.getElementById("userAmount").innerText = player.users.toFixed(0);
    document.getElementById("dataAmount").innerText = player.data.toFixed(0);
    document.getElementById("developerAmount").innerText = player.employees.toFixed(0);
    document.getElementById("energyAmount").innerText = player.energy.toFixed(1);
    document.getElementById("energyLimit").innerText = getMaxEnergy().toFixed(1);
    document.getElementById("moneyAmount").innerText = player.money.toFixed(2);
    document.getElementById("incomeAmount").innerText = formatRate(getIncome(), 2);
    updateEnergyUpgradesUI();
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
        document.getElementById("hireEmployees").innerText = `Hire employees (cost: ${getDeveloperCost().toFixed(2)} money/day)`;
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
        player.energy < getDeveloperCost() : false;
    normalUpgrades.forEach(id => {
        let cost = upgradeCosts[id];
        let skipValidate = cost.validate === false;
        document.getElementById(id).disabled = !skipValidate && !costGTE(player, cost);
    });
}

function updateEnergyUpgradesUI() {
    if (player.currentlyUpgrading) {
        document.getElementById(player.currentlyUpgrading + "cost").innerText = upgradeCosts[player.currentlyUpgrading].energy.toFixed(0);
    }
}

function buyUpgrade(thisElem) {
    let name = thisElem.id;
    let cost = upgradeCosts[name];
    let skipValidate = cost.validate === false;
    if (!player.upgrades.includes(name) && (skipValidate || costGTE(player, cost))) {
        subCost(player, cost);
        player.upgrades.push(name);
        thisElem.className += " upgradebtn--purchased";
    }
}

function buyEnergyUpgrade(thisElem) {
    let name = thisElem.id;
    if (!player.currentlyUpgrading) {
        player.currentlyUpgrading = name;
    }
}

function getMaxEnergy() {
    let timeCapacity = player.employees * 4 - 2;
    if (player.upgrades.includes("office1")) {
        timeCapacity *= 1.5;
    }
    return timeCapacity;
}

function getEmployeeTimeProduction() {
    let timeIncome = player.employees;
    if (player.upgrades.includes("office1")) {
        timeIncome *= 1.5;
    }
    if (player.upgrades.includes("office2")) {
        timeIncome *= 1.5;
    }
    return timeIncome;
}

function getIncome() {
    let income = player.income;
    if (player.upgrades.includes("mon1")) {
        income += player.data / 100000;
    }
    if (player.upgrades.includes("mon2")) {
        income += player.data / 10000;
    }
    if (player.upgrades.includes("platform12")) {
        income += player.users / 5000;
    }
    if (player.upgrades.includes("partner2")) {
        income += player.data / 7500;
    }
    if (player.upgrades.includes("mon3")) {
        income += player.data / 5000;
    }
    if (player.upgrades.includes("partner3")) {
        income += player.data / 2500;
    }
    return income;
}

function getUserProduction() {
    let userIncome = 0;
    if (player.upgrades.includes("user1")) {
        userIncome += Math.min(0.1 * player.users, 1000);
    }
    if (player.upgrades.includes("platform12")) {
        userIncome += 1;
    }
    if (player.upgrades.includes("partner1")) {
        userIncome *= 3;
    }
    if (player.upgrades.includes("platform22")) {
        userIncome += 0.025 * player.users;
    }
    if (player.upgrades.includes("platform32")) {
        userIncome += 0.01 * player.users;
    }
    return userIncome;
}

function getDataProduction() {
    let dataIncome = player.users / 10;
    if (player.upgrades.includes("platform11")) {
        dataIncome *= 1.1;
    }
    if (player.upgrades.includes("platform21")) {
        dataIncome *= 2;
    }
    if (player.upgrades.includes("platform31")) {
        dataIncome += 0.01 * player.data;
    }
    return dataIncome;
}

function getDeveloperCost() {
    if (player.employees <= NUM_ROOMMATES) {
        return 1 + player.employees;
    }
    else if (player.employees <= NUM_RECRUITS) {
        return (NUM_ROOMMATES + 1) * 1.5 ** (player.employees - NUM_ROOMMATES);
    }
    return 1.5 ** (player.employees - NUM_RECRUITS - 1);
}

function completeEnergyUpgrade(id) {
    switch (id) {
        case "mon1":
            document.getElementById("mon2").style.display = "block";
            break;
        case "mon2":
            document.getElementById("mon3").style.display = "block";
            break;
        case "platform11":
            document.getElementById("platform21").style.display = "block";
            break;
        case "platform12":
            document.getElementById("platform22").style.display = "block";
            break;
        case "platform21":
            document.getElementById("platform31").style.display = "block";
            break;
        case "platform22":
            document.getElementById("platform32").style.display = "block";
            break;
        case "partner1":
            document.getElementById("partner2").style.display = "block";
            break;
        case "partner2":
            document.getElementById("partner3").style.display = "block";
            break;
    }
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
        if ((cost1[resource] || -Infinity) < (cost2[resource] || -Infinity)) {
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

var tickInterval = setInterval(tick, 100);