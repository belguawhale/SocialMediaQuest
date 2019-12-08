var player = {
    ticks: 0,
    users: 1,
    servers: 1,
    data: 0,
    money: 100,
    energy: 0,
    employees: 1,
    income: 0,
    upgrades: [],
    currentlyUpgrading: null,
    numDonations: 0,
}

var resources = ['money', 'energy', 'income'];

var upgradeCosts = {
    mon1: {
        energy: 35,
    },
    mon2: {
        energy: 65,
    },
    mon3: {
        energy: 120,
    },
    platform11: {
        energy: 30,
    },
    platform12: {
        energy: 50,
    },
    platform21: {
        energy: 75,
    },
    platform22: {
        energy: 95,
    },
    platform31: {
        energy: 90,
    },
    platform32: {
        energy: 150,
    },
    partner1: {
        energy: 35,
    },
    partner2: {
        energy: 55,
    },
    partner3: {
        energy: 85,
    },
    user1: {
        energy: 15,
    },
    user2: {
        energy: 30,
    },
};

// var normalUpgrades = ["office1", "office2", "user2"];
var normalUpgrades = Object.keys(upgradeCosts);


const NUM_ROOMMATES = 3;
const NUM_RECRUITS = 7;
const TICKS_PER_DAY = 25;
const MS_PER_TICK = 200;

function wordOfMouth() {
    if (player.energy >= 1) {
        player.energy--;
        player.users++;
    }
    completeUpgrade("freeUsers");
}

function askForDonations() {
    const energyCost = getDonationsCost();
    if (player.energy >= energyCost) {
        player.energy -= energyCost;
        player.money += 10 + Math.sqrt(player.users - 10);
        if (!isEthical()) {
            player.numDonations++;
        }
    }
    updateCostsUI();
}

function getDonationsCost() {
    let energyCost = 20;
    if (!isEthical()) {
        energyCost += 1 * player.numDonations;
    }
    return energyCost;
}

function isEthical() {
    return !(player.upgrades.includes("mon1") || player.upgrades.includes("user2") || player.upgrades.includes("platform31") || player.upgrades.includes("partner1"));
}

function hireDevelopers() {
    if (player.employees <= NUM_RECRUITS) {
        let requiredEnergy = getDeveloperCost();
        if (player.energy >= requiredEnergy) {
            player.energy -= requiredEnergy;
            player.employees++;
            player.users++;
        }
    }
    else {
        player.income -= getDeveloperCost();
        player.employees++;
        player.users++;
    }
    completeUpgrade("hireEmployees");
    updateCostsUI();
}

function buyServer() {
    player.income -= getServerCost();
    player.servers++;
    updateCostsUI();
}

function getServerCost() {
    return 2;
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
    player.data = Math.min(player.data, getMaxData());
    player.users = Math.min(player.users, getMaxUsers());
    if (player.currentlyUpgrading) {
        let energySpent = Math.min(player.energy, upgradeCosts[player.currentlyUpgrading].energy);
        player.energy -= energySpent;
        upgradeCosts[player.currentlyUpgrading].energy -= energySpent;
        if (upgradeCosts[player.currentlyUpgrading].energy <= 0) {
            player.upgrades.push(player.currentlyUpgrading);
            document.getElementById(player.currentlyUpgrading).className += " upgradebtn--purchased";
            completeUpgrade(player.currentlyUpgrading);
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
    document.getElementById("userLimit").innerText = getMaxUsers().toFixed(0);
    document.getElementById("dataAmount").innerText = player.data.toFixed(0);
    document.getElementById("dataLimit").innerText = getMaxData().toFixed(0);
    document.getElementById("serverAmount").innerText = player.servers.toFixed(0);
    document.getElementById("developerAmount").innerText = player.employees.toFixed(0);
    document.getElementById("energyAmount").innerText = player.energy.toFixed(1);
    document.getElementById("energyLimit").innerText = getMaxEnergy().toFixed(1);
    document.getElementById("moneyAmount").innerText = player.money.toFixed(2);
    document.getElementById("incomeAmount").innerText = formatRate(getIncome(), 2);
    updateEnergyUpgradesUI();
    updateUpgradesUI();
    if (player.users >= 20) {
        let monetizationTab = document.getElementById("monetizationTabLink")
        if (monetizationTab.innerText !== "Features") {
            monetizationTab.innerText = "Features";
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
        document.getElementById("hireEmployees").innerText = `Hire employees (cost: ${getDeveloperCost().toFixed(0)} money/day)`;
    }
    else if (player.employees >= NUM_ROOMMATES + 1) {
        document.getElementById("hireEmployees").innerText = `Recruit other people to help (cost: ${getDeveloperCost().toFixed(0)} employee time)`;
    }
    else {
        document.getElementById("hireEmployees").innerText = `Convince your roommate to help (cost: ${getDeveloperCost().toFixed(0)} employee time)`;
    }
    document.getElementById("servercost").innerText = getServerCost().toFixed(0);
    document.getElementById("donationsCost").innerText = getDonationsCost().toFixed(0);
}

function updateUpgradesUI() {
    document.getElementById("freeUsers").disabled = player.energy < 1;
    document.getElementById("freeMoney").disabled = player.energy < getDonationsCost();
    document.getElementById("hireEmployees").disabled = player.employees <= NUM_RECRUITS ?
        player.energy < getDeveloperCost() : false;
    normalUpgrades.forEach(id => {
        let cost = upgradeCosts[id];
        let skipValidate = cost.validate === false;
        document.getElementById(id).disabled = !skipValidate && !costGTE(player, cost);
        document.getElementById(id + "cost").innerText = upgradeCosts[id].energy.toFixed(0);
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
        completeUpgrade(name);
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
    return timeCapacity;
}

function getMaxUsers() {
    return 100 * player.servers;
}
function getMaxData() {
    return 1000 * player.servers;
}

function getEmployeeTimeProduction() {
    let timeIncome = player.employees * 0.75;
    return timeIncome;
}

function getIncome() {
    let income = player.income;
    if (player.upgrades.includes("mon1")) {
        income += Math.sqrt(player.data) / 15;
    }
    if (player.upgrades.includes("mon2")) {
        income += Math.sqrt(player.data) / 10;
    }
    if (player.upgrades.includes("platform12")) {
        income += Math.sqrt(player.data) / 20;
    }
    if (player.upgrades.includes("platform22")) {
        income += Math.sqrt(player.data) / 30;
    }
    if (player.upgrades.includes("platform32")) {
        income += Math.sqrt(player.data) / 10;
    }
    if (player.upgrades.includes("partner2")) {
        income += Math.sqrt(player.data) / 15;
    }
    if (player.upgrades.includes("mon3")) {
        income += Math.sqrt(player.data) / 5;
        if (player.upgrades.includes("platform31") && player.upgrades.includes("platform32")) {
            income += (player.data ** 1.01) / 1000;
        }
    }
    if (player.upgrades.includes("partner3")) {
        income += Math.sqrt(player.data) / 10;
    }
    return income;
}

function getUserProduction() {
    let userIncome = 0;
    if (player.users > 20) {
        userIncome = Math.log10(player.users);
    }
    if (player.upgrades.includes("user1")) {
        userIncome += Math.min(0.05 * player.users, 10);
    }
    if (player.upgrades.includes("user2")) {
        userIncome += 0.025 * player.users;
    }
    if (player.upgrades.includes("platform12")) {
        userIncome *= 1.5;
    }
    if (player.upgrades.includes("partner1")) {
        userIncome *= 1.25;
    }
    if (player.upgrades.includes("platform22")) {
        userIncome += 0.05 * player.users;
    }
    if (player.upgrades.includes("platform32")) {
        userIncome += 0.1 * player.users;
    }
    return userIncome;
}

function getDataProduction() {
    let dataIncome = player.users / 2;
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
    return 1;
}

function completeUpgrade(id) {
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
        case "user1":
            document.getElementById("user2").style.display = "block";
            break;
        case "freeUsers":
            if (player.users >= 10) {
                document.getElementById("freeMoney").style.display = "block";
            }
            break;
        case "hireEmployees":
            if (player.employees > NUM_ROOMMATES) {
                document.getElementById("server").style.display = "block";
            }
            break;
    }
}

function formatRate(value, decimals) {
    decimals = decimals || 0;
    let output = value.toFixed(decimals);
    if (output > 0) {
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

var tickInterval = setInterval(tick, MS_PER_TICK);