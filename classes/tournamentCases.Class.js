module.exports = {
	TL:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'TL request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'TL user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var rn = require('random-number');
		var options = {
		  min:  50
		, max:  100
		, integer: true
		}

		var user_id = data.user_id;
		userSettingCases.getUserData(objectId(user_id), function(err, UserData){
			if(UserData){

				tournamentCases.tournament_list({chips:UserData.chips},function(result){

					var k = [];
  					_.each(result, function(o) {
  						o.to = rn(options);
						k.push(o); 
  					}); 
					commonClass.SendData({'data':k,'en':data.en, 'sc':1}, socket.id);
				});

			}else{
				commonClass.SendData({ 'Message' : 'invalid request','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	TJ:function(data, socket){
		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'TJ request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'TJ user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.tid == 'undefined'){
			commonClass.SendData({ 'Message' : 'TJ tid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		var tournament_id = objectId(data.tid);


		db.collection('game_users').findOne({_id: objectId(data.user_id)},function(err, userData){
			if(userData){

		 		var uchips = userData.chips;
				
				tournamentCases.tournament_info(tournament_id, function(err,tnmntInfo){

					if( uchips < ( tnmntInfo.buyIn + tnmntInfo.entryFee) ){
						
						commonClass.SendData({'Message' :"you don't have enough chips to play on this table.", 'en':data.en,'sc':501}, socket.id);
						return false;

					}else{

						data.mode = 1;

			 			// var suchips = tnmntInfo.playingChips/5;
			 			var suchips = tnmntInfo.playingChips/500;
			 			if(suchips < 2){
			 				var suchips = 2;
			 			}

			 			db.collection('game_tables').
				        find({ tblbet_value : { $lte: suchips }}).
				        limit( 1 ).
				        sort({tblbet_value: -1}).
				        toArray(function(e, tableInfo) {
			        		if(tableInfo.length > 0){
								
								tablesManager.join_table_3(data, userData, tableInfo[0], tnmntInfo, socket);
								
			        		}else{
			        			
			        			commonClass.SendData({'Message' :"you don't have enough chips to play on this table.", 'en':data.en,'sc':501}, socket.id);
								return false;
			        		}
			        	});

					}
				})
				
			}

		});
	},
	tournament_list:function(data, callback){
		db.collection("game_tournament_list").find().toArray(function(err, result) {
		    if (err) printLog(err);
		    callback(result)
		});
	},
	tournament_info:function(id, callback){

		db.collection('game_tournament_list').findOne( {_id:id},callback);
	}
}