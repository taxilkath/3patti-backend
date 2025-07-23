module.exports = {

	//high low get first card
	HLGFC:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'HLGFC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'HLGFC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				var userCoin = userData.coins;

				if(userCoin > 0){


					var pack = cardClass.createPack();
					var myPack = cardClass.shufflePack(pack);

					var card = cardClass.draw(myPack, 1, '', true);
					commonClass.SendData({'card':card[0], price:1, bc:100, round:1 ,'en':data.en, 'sc':1}, socket.id);


				}else{
					
					commonClass.SendData({ 'Message' : "You don't have enough diamonds! buy more diamonds to play!",'en':data.en, 'sc':502}, socket.id);
				}

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	// high low next card
	HLNC:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'HLNC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'HLNC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.round == 'undefined'){
			commonClass.SendData({ 'Message' : 'HLNC round is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.card == 'undefined'){
			commonClass.SendData({ 'Message' : 'HLNC card is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.ih == 'undefined'){ //is high
			commonClass.SendData({ 'Message' : 'HLNC ih is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		var round = data.round;
		var card = data.card;
		var ih = data.ih;

		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				var cardDetail = autoCases.cardDetail(card);

							
				var pack = cardClass.createPack();
				var myPack = cardClass.shufflePack(pack);

				var nextCard = cardClass.draw(myPack, 1, '', true);
				var nextCardDetail = autoCases.cardDetail(nextCard[0]);

				if(cardDetail.number == nextCardDetail.number){

					var pack = cardClass.createPack();
					var myPack = cardClass.shufflePack(pack);

					var nextCard = cardClass.draw(myPack, 1, '', true);
					var nextCardDetail = autoCases.cardDetail(nextCard[0]);


					if(cardDetail.number == nextCardDetail.number){

						var pack = cardClass.createPack();
						var myPack = cardClass.shufflePack(pack);

						var nextCard = cardClass.draw(myPack, 1, '', true);
						var nextCardDetail = autoCases.cardDetail(nextCard[0]);
					}

				}


				var is_win = 0

				if( parseInt(ih) == 1 && cardDetail.number < nextCardDetail.number){
					var is_win = 1;
				}else if( parseInt(ih) == 0 && cardDetail.number > nextCardDetail.number){
					var is_win = 1;
				}
				

				if(round == 1){

					var userCoin = userData.coins;

					if(userCoin > 0){

						userSettingCases.userManageCoin(-1,userData._id, function(err, res){

							if(res){
								
								chipsTrackerCases.insert({chips : -1,type : 'debit', msg : 'High/low coin cut',"ct" : "coins", uid : user_id, },'');
								commonClass.SendData({'coins':userCoin-1,'en':"UCO", 'sc':1}, socket.id);
								miniGamesCases.HLRESPONSE(is_win, round, user_id, nextCard, data, socket);
							}

						});


					}else{
						
						commonClass.SendData({ 'Message' : "You don't have enough diamonds! buy more diamonds to play!",'en':data.en, 'sc':502}, socket.id);
					}


				}else{

					miniGamesCases.HLRESPONSE(is_win, round, user_id, nextCard, data, socket);
				}


				
				

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	HLRESPONSE:function(is_win, round, user_id, nextCard, data, socket){

		if(is_win == 1){


			var nextRound = round+1;

			switch(round){
				case 1:
					WinChips = 100;
					nextChips = 200;
					break;
				case 2:
					WinChips = 200;
					nextChips = 400;
					break;
				case 3:
					WinChips = 400;
					nextChips = 800;
					break;
				case 4:
					WinChips = 800;
					nextChips = 1500;
					break;
				case 5:
					WinChips = 1500;
					nextChips = 2500;
					break;
				case 6:
					WinChips = 2500;
					nextChips = 5000;
					break;
				case 7:
					WinChips = 5000;
					nextChips = 10000;
					break;
				default:
					WinChips = 10000;
					nextChips = 10000;
			}



			chipsTrackerCases.insert({chips : WinChips,type : 'credit', msg : 'Mini game high low',"ct" : "chips", uid : user_id},'');
			userSettingCases.userFindUpdate({ $inc: { chips :  WinChips, cwchips : WinChips} }, user_id,function(err, updateUserData){

				if(err){

					printLog("err7");
					printLog(err);
				}
				commonClass.SendData({'chips':updateUserData.value.chips,'en':"UC", 'sc':1}, socket.id);
				commonClass.SendData({nc :nextCard[0],iw: 1, chips:updateUserData.value.chips, bc:nextChips, wc:WinChips, round: nextRound ,'en':data.en, 'sc':1}, socket.id);

			});

		}else{

			commonClass.SendData({nc: nextCard[0], iw: 0, bc:100, round: 1 ,'en':data.en, 'sc':1}, socket.id);
		}
	},
	//andar bahar get first card
	ABGFC:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'ABGFC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABGFC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				var userCoin = userData.coins;

				if(userCoin > 0){


					var pack = cardClass.createPack();
					var myPack = cardClass.shufflePack(pack);

					var card = cardClass.draw(myPack, 1, '', true);
					commonClass.SendData({'card':card[0], price:1, bc:100, round: 1, 'en':data.en, 'sc':1}, socket.id);


				}else{
					
					commonClass.SendData({ 'Message' : "You don't have enough diamonds! buy more diamonds to play!",'en':data.en, 'sc':502}, socket.id);
				}

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	// andar bahar user selected ( 1 = anadar, 2 = bahar  )
	ABUS:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'ABUS request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABUS user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.us == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABUS us is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.round == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABUS round is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		var user_selected = data.us;//1 = anadar, 2 = bahar
		var round = data.round;
		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				var userCoin = userData.coins;

				if(userCoin > 0){

					userSettingCases.userManageCoin(-1,userData._id, function(err, res){

						if(res){
							
							chipsTrackerCases.insert({chips : -1,type : 'coins', msg : 'Andar/Bahar coin cut',"ct" : "coins", uid : user_id},'');
							commonClass.SendData({'coins':--userCoin,'en':"UCO", 'sc':1}, socket.id);

							var options = {
							  min:  1, 
							  max:  2, 
							  integer: true
							}

							var rn = require('random-number');
							var randID = rn(options);

							var is_win = 0;
							if(randID == 1){
								var is_win = 1;
							}

							commonClass.SendData({'is_win':is_win,us:user_selected,'en':data.en, 'sc':1}, socket.id);
						}

					});


				}else{
					
					commonClass.SendData({ 'Message' : "You don't have enough diamonds! buy more diamonds to play!",'en':data.en, 'sc':502}, socket.id);
				}

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	// andar bahar chips add
	ABCA:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'ABCA request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABCA user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.round == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABCA round is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.is_win == 'undefined'){
			commonClass.SendData({ 'Message' : 'ABCA is_win is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		
		var user_id = objectId(data.user_id);
		var round = data.round;
		var is_win = data.is_win;

		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				
				if( is_win == 1){
	    			
	    			var WinChips = Math.pow(2, (round-1))*100;

	    			var nextRound = round+1;

	    			var nextChips = Math.pow(2, ((nextRound)-1))*100;

					chipsTrackerCases.insert({chips : WinChips,type : 'credit', msg : 'Mini game anadar/bahar',"ct" : "chips",uid : user_id},'');
					userSettingCases.userFindUpdate({ $inc: { chips :  WinChips, cwchips : WinChips} }, user_id,function(err, updateUserData){

						if(err){
							printLog("err8");
							printLog(err);
						}
						var pack = cardClass.createPack();
						var myPack = cardClass.shufflePack(pack);
						var nextCard1 = cardClass.draw(myPack, 1, '', true);
						commonClass.SendData({'chips':updateUserData.value.chips,'en':"UC", 'sc':1}, socket.id);
						commonClass.SendData({'card': nextCard1[0], bc:nextChips, price:1, round: nextRound ,'en':data.en, 'sc':1}, socket.id);
					});

				}else{

					var pack = cardClass.createPack();
					var myPack = cardClass.shufflePack(pack);
					var card = cardClass.draw(myPack, 1, '', true);
					commonClass.SendData({'card':card[0], price:1, bc:100, round: 1, 'en':data.en, 'sc':1}, socket.id);

				}

				

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	//get scratch card
	GSC:function(data, socket){
		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'GSC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'GSC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				var userCoin = userData.coins;

				if(userCoin >= 2){

					userSettingCases.userManageCoin(-2,userData._id, function(err, res){

						if(res){
							
							chipsTrackerCases.insert({chips : -2,type : 'coins', msg : 'Mini game scratch',"ct" : "chips",uid : user_id},'');

							miniGamesCases.scratchCardChips(function(card){
								card = _.shuffle(card);
								commonClass.SendData({'data':card, 'en':data.en, 'sc':1}, socket.id);
								commonClass.SendData({'coins':userCoin-2,'en':"UCO", 'sc':1}, socket.id);
							});
						}

					});


				}else{
					
					commonClass.SendData({ 'Message' : "You don't have enough diamonds! buy more diamonds to play!",'en':data.en, 'sc':502}, socket.id);
				}

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	// scratch card chips add
	SCCA:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'SCCA request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'SCCA user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.chips == 'undefined'){
			commonClass.SendData({ 'Message' : 'SCCA chips is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		
		var user_id = objectId(data.user_id);
		var chips = data.chips;

		userSettingCases.getUserData(user_id,function(err, userData){
			if(userData){

				
				miniGamesCases.scratchCardChips(function(card){

					var is_found = _.indexOf(card, chips);
					if(is_found >= 0){

						chipsTrackerCases.insert({chips : chips,type : 'credit', msg : 'Mini game scratch',"ct" : "chips",uid : user_id},'');
						userSettingCases.userFindUpdate({ $inc: { chips :  chips, cwchips : chips} }, user_id,function(err, updateUserData){
							if(err){
								printLog("err9");
								printLog(err);
							}
							commonClass.SendData({'chips':updateUserData.value.chips,'en':"UC", 'sc':1}, socket.id);
						});

					}else{
						commonClass.SendData({ 'Message' : "Don't oversmart",'en':data.en, 'sc':0}, socket.id);
					}
    			});


			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	scratchCardChips:function(callback){
		var card = [0,2000,6000,8000,10000];
		callback(card);
	}


}