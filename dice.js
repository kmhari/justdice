var Dice = exports = module.exports = {};

Dice.get_target = function (chance, roll) {
    chance = parseFloat(chance).toFixed(7);
    if (roll == "rhigh") 
        return (99.999999 - chance).toFixed(7);
    return chance.toFixed(7);
};

Dice.calculate_payout = function (chance) {
    var house_edge = 1;
    return parseFloat((100 - house_edge) / chance).toFixed(7);
};

Dice.calculate_profit = function (chance, bet) {
    return parseFloat((Dice.calculate_payout(chance) - 1) * bet).toFixed(7);
};

