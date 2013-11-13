var dice = exports = module.exports = {};

	dice.get_roll_pivot = function (chance,roll){
		if(roll==="rhigh"){
			return 99.999999-chance;
		}else{
			return chance;
		}
	}

	dice.calculate_payout = function (chance){
		var house_edge = 1;
		return (100-house_edge)/chance;
	}

	dice.calculate_profit = function (chance,bet){
		return (calculate_payout(chance)-1)*bet;
	}

