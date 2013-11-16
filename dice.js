var Dice = exports = module.exports = {};

Dice.get_target = function (chance, roll) {
    chance = parseInt(chance);
    if (roll === "rhigh") {
        return 99.999999 - chance;
    } else {
        return chance;
    }
};

Dice.calculate_payout = function (chance) {
    var house_edge = 1;
    return parseFloat((100 - house_edge) / chance);
};

Dice.calculate_profit = function (chance, bet) {
    return parseFloat((Dice.calculate_payout(chance) - 1) * bet);
};

