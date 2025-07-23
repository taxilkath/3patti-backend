var teenPattiScore = require("teenpattisolver");

module.exports = {
	
	cardDetail:function ( card ){ 

		if (card.length == 2 && _.isString(card)) {
	        
	        var number = _.upperCase(_.head(card));
	        var color = _.upperCase(_.tail(card));
	        if (number == "A") {
	            number = 14;
	        } else if (number == "T") {
	            number = 10;
	        } else if (number == "J") {
	            number = 11;
	        } else if (number == "Q") {
	            number = 12;
	        } else if (number == "K") {
	            number = 13;
	        } else {
	            number = parseInt(number);
	        }
	        switch (color) {
	            case "C":
	                color = "Clubs";
	                break;
	            case "S":
	                color = "Spades";
	                break;
	            case "D":
	                color = "Diamonds";
	                break;
	            case "H":
	                color = "Hearts";
	                break;
	            default:
	                // console.error(new Error("Incorrect Card Color " + card));
	                break;
	        }
	        if (_.isNaN(number)) {
	            // console.error(new Error("Incorrect Card Number " + card));
	        }
	        return {
	            number: number,
	            color: color,
	            value: card
	        };
	    } 
	},
	robotTurn:function (roomInfo, turn, socket){

		var user_id = turn.uid;
		var tblind = turn.tblind;
		var userChips = turn.playerInfo.chips;

		var tblpot = roomInfo.tinfo.tblpot;
		var tblchaal = roomInfo.tinfo.tblchaal;
		var lastBet = roomInfo.lastBet;
		var lastBlind = roomInfo.lastBlind;
		var tblamount = roomInfo.amount;

		var currentPMode = (turn.isSideShowAvailable == true) ? false : true;
		var betamount = roomInfo.lastBet;


		var randID = Math.floor(Math.random() * 5) + 2;


		var totalGamePlayer = playingCases.getActivePlayersCount(roomInfo.players);
		var totalGameRobot = playingCases.getRobotActivePlayersCount(roomInfo.players);
		
		
		if( totalGameRobot == totalGamePlayer ){
			tblind = 4
		}


		if(tblind == 4 || lastBlind == false){

			var currentPMode = false;
			commonClass.SendData({
				data:{
					slot: roomInfo.players[turn.uid].slot,
				}, 
				'en':'SC',
				'sc':1}, 
			roomInfo._id);

			var setobj = {};
			setobj['players.'+turn.uid+'.isSideShowAvailable'] = true;
			tablesManager.RoomUpdate(roomInfo._id,{$set:setobj});
		}





		

		if(currentPMode == true){//blind

				
				betamount = ( lastBlind == true ) ? betamount : betamount / 2;

				if(  userChips > betamount){

					autoCases.RobotTurnManage(roomInfo, user_id, 2, betamount, socket);

				}else{

					if(roomInfo.itrmnt == true){

						autoCases.RobotShow(roomInfo, user_id, betamount, socket);

					}else{

						autoCases.RobotPack(roomInfo, user_id, socket);
					}
				}

			
		}else{//chaal


			betamount = ( lastBlind == true ) ? betamount * 2 : betamount;
			var userCards = turn.playerInfo.cards;


			if(userCards && userCards.length > 0){
				
				var userTChaal = turn.tchaal;
				var ActionChaal = autoCases.cardInfo(userCards, roomInfo.variation);

				if(  userChips > betamount ){
				
					
					if(userTChaal >=  ActionChaal ){

						
						var activePlayers = playingCases.getActivePlayersCount(roomInfo.players);
						if(activePlayers == 2){

							autoCases.RobotShow(roomInfo, user_id, betamount, socket);

						}else{
							
							autoCases.RobotPack(roomInfo, user_id, socket);
						}


					}else{	


						if(  userChips > betamount){

							autoCases.RobotTurnManage(roomInfo, user_id, 1, betamount, socket);

						}else{

							autoCases.RobotPack(roomInfo, user_id, socket);
						}
					}

				}else{

					if(roomInfo.itrmnt == true){

						autoCases.RobotShow(roomInfo, user_id, betamount, socket);

					}else{

						autoCases.RobotPack(roomInfo, user_id, socket);
					}
				}
			}

		}
	},
	cardInfo:function(card, variation){

		switch(parseInt(variation)){
			case 1:
				var handNormal = teenPattiScore.scoreHandsNormal(card);
				break;
			case 2:
				var handNormal = teenPattiScore.scoreHandsAK47(card);
				break;
			case 3:
				var handNormal = teenPattiScore.scoreHandsLowestJoker(card);
				break;
			case 4:
				var handNormal = teenPattiScore.scoreHandsLowest(card);
				break;
			case 6:
				var handNormal = teenPattiScore.scoreHands1942(card);
				break;
			case 7:
				var handNormal = teenPattiScore.scoreHandsblackjack(card);
				break;
			case 8:
				var handNormal = teenPattiScore.scoreHands999(card);
				break;
			default:
				var handNormal = teenPattiScore.scoreHandsNormal(card);
		}


		switch(handNormal.name){
			case 'High Card':
				var tchaal = (variation == 4) ? 6 : 1;
				break;
			case 'Pair':
				var tchaal = (variation == 4) ? 5 : 2;
				break;
			case 'Color':
				var tchaal = (variation == 4) ? 4 : 3;
				break;
			case 'Sequence':
				var tchaal = (variation == 4) ? 3 : 4;
				break;
			case 'Pure Sequence':
				var tchaal = (variation == 4) ? 2 : 5;
				break;
			case 'Trio':
				var tchaal = (variation == 4) ? 1 : 6;
				break;
			default:
				var tchaal = 0;
		}

		return tchaal;
	},
	RobotPack:function(roomInfo, user_id, socket){

		var randID = Math.floor(Math.random() * 5) + 2;

		setTimeout(function(){ 

			playingCases.userPack(roomInfo, user_id, 'click', socket);
			
		},(randID*1000));
	},
	RobotTurnManage:function(roomInfo, user_id, turnType, betamount, socket){

		var randID = Math.floor(Math.random() * 5) + 2;

		setTimeout(function(){ 

			playingCases.turnManage(roomInfo._id, user_id, turnType, betamount, socket);
		
		},(randID*1000));
	},
	RobotShow:function(roomInfo, user_id, betamount, socket){
		
		var randID = Math.floor(Math.random() * 5) + 2;

		setTimeout(function(){ 
			playingCases.showAction(roomInfo._id, user_id, betamount, socket);
		},(randID*1000));
	}

}
