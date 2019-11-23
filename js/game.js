var player = {
    ticks: 0,
    users: 0,
    money: 0,
    energy: 0,
    developers: 1,
}

const NUM_ROOMMATES = 2;
const TICKS_PER_DAY = 50;

function wordOfMouth() {
    if (player.energy >= 1) {
        player.energy--;
        player.users++;
    }
}

function hireDevelopers() {
    if (player.developers <= NUM_ROOMMATES) {
        if (player.energy >= NUM_ROOMMATES) {
            player.energy -= 2;
            player.developers++;
        }
    }
    else {
        let requiredMoney = getDeveloperCost();
        if (player.money >= requiredMoney) {
            player.money -= requiredMoney;
        }
    }
}

function tick() {
    player.ticks++;
    player.energy += player.developers / TICKS_PER_DAY;
    if (player.energy > getMaxEnergy()) {
        player.energy = getMaxEnergy();
    }
    updateUI();
}

function updateUI() {
    document.getElementById("days").textContent = (player.ticks / TICKS_PER_DAY).toFixed(1);
    document.getElementById("userAmount").textContent = player.users.toFixed(0);
    document.getElementById("developerAmount").textContent = player.developers.toFixed(0);
    document.getElementById("energyAmount").textContent = player.energy.toFixed(1);
    document.getElementById("energyLimit").textContent = getMaxEnergy().toFixed(1);
    document.getElementById("moneyAmount").textContent = player.money.toFixed(2);
    if (player.developers >= NUM_ROOMMATES + 1) {
        document.getElementById("developers").innerText = `Hire developers (cost: ${getDeveloperCost().toFixed(2)} money)`;
    }
    updateBusinessTitle();
}

function updateBusinessTitle() {
    var titles = {
        10: "your side hustle",
        0: "your side project",
    }
}

function getMaxEnergy() {
    return player.developers * 2;
}

function getDeveloperCost() {
    return 50 * 1.1 ** (player.developers - NUM_ROOMMATES - 1);
}

setInterval(tick, 100);