var iap = require('iap');

module.exports = {
	COSL:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'UP request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UP user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		db.collection('game_coinstore').find({}).sort( { price: -1 } ).toArray(function(err, chipstoreInfo){
			commonClass.SendData({'data':chipstoreInfo,'en':data.en, 'sc':1}, socket.id);
		});
	},
	CIAP:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'CIAP request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.ptype == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP ptype is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.pdata == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP pdata is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.productId == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP productId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}



		var user_id = objectId(data.user_id);
		var ptype = data.ptype;
		var pdata = data.pdata;
		var productId = data.productId;


		if(ptype == 'chips'){

			db.collection('game_chipstore').findOne( { sku_id : productId }, function(err, result){

				if(result){

					var pchips = result.chips;
					db.collection('game_chips_tracker').insertOne({pdata:pdata, chips : pchips,type : 'credit', msg : 'purchase', price: result.price ,"ct" : "chips", uid : user_id, orderId:data.orderId});

					if (typeof parseInt(pchips) == "number" && pchips > 0) {

						chipsTrackerCases.insert({chips : pchips,type : 'credit', msg : 'purchase', price: result.price ,"ct" : "chips", uid : user_id, orderId:data.orderId},'');
						userSettingCases.userFindUpdate({ $inc: { chips :  pchips} }, user_id, function(err, userInfo){
							
							if(err){
								printLog('err2');
								printLog(err);
							}
							
							commonClass.SendData({'chips':userInfo.value.chips, ptype:ptype, pchips:pchips,'en':data.en, 'sc':1}, socket.id);

						});
					}

				}else{

					commonClass.SendData({ 'Message' : 'Purchase verification failed.','en':data.en, 'sc':0}, socket.id);
				}		
			});


		}else{

			db.collection('game_coinstore').findOne( { sku_id : productId }, function(err, result){

				if(result){

					var pcoin = result.coin;

					db.collection('game_chips_tracker').insertOne({pdata:pdata, chips : pcoin,type : 'credit', msg : 'purchase', price: result.price ,"ct" : "coins", uid : user_id, orderId:data.orderId});
					chipsTrackerCases.insert({chips : pcoin,type : 'credit', msg : 'purchase', "ct" : "coins", uid : user_id, orderId:data.orderId},'');
					userSettingCases.userFindUpdate({ $inc: { coins :  pcoin} }, user_id, function(err, userInfo){
						
						if(err){
							printLog('err3');
							printLog(err);
						}
						commonClass.SendData({'coins':userInfo.value.coins, pcoin:pcoin, ptype:ptype, 'en':data.en, 'sc':1}, socket.id);

					});
				}else{

					commonClass.SendData({ 'Message' : 'Purchase verification failed.','en':data.en, 'sc':0}, socket.id);
				}		
			});

		}
	},
	CIAP2:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'CIAP request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.ptype == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP ptype is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.pdata == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP pdata is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.productId == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP productId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.purchaseToken == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP purchaseToken is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}



		var user_id = objectId(data.user_id);
		var ptype = data.ptype;
		var pdata = data.pdata;
		var productId = data.productId;
		var purchaseToken = data.purchaseToken;
		var currentDate = moment().format('DD-MM-YYYY h:mm:ss');


		if(ptype == 'chips'){

			db.collection('game_chipstore').findOne( { sku_id : productId }, function(err, chipstoreResult){

				if(chipstoreResult){

					coinStoreCases.verifyPurchase(productId, purchaseToken, function(purchaseInfo){

						var pchips = chipstoreResult.chips;

						if(purchaseInfo.status == 0){

							commonClass.SendData({ 'Message' : purchaseInfo.msg,'en':data.en, 'sc':0}, socket.id);
							return false;

						}else{

							// printLog(pchips);

							db.collection('game_purchase').insertOne({
								pdata:pdata, 
								pdate:currentDate,
								productId: productId, 
								purchaseToken : purchaseToken, 
								chips : pchips,
								type : 'credit', 
								msg : 'purchase', 
								price: chipstoreResult.price ,
								"ct" : "chips", 
								uid : user_id, 
								orderId:data.orderId
							});

							chipsTrackerCases.insert({chips : pchips,type : 'credit', msg : 'purchase', price: chipstoreResult.price ,"ct" : "chips", uid : user_id, orderId:data.orderId},'');
							userSettingCases.userFindUpdate({ $inc: { chips :  pchips} }, user_id, function(err, userInfo){
								
								// printLog(err);
								if(err){

									printLog("err4");
									printLog(err);
								}	
								commonClass.SendData({'chips':userInfo.value.chips, ptype:ptype, pchips:pchips,'en':data.en, 'sc':1}, socket.id);

							});
						}
					});
				}else{

					commonClass.SendData({ 'Message' : 'Purchase verification failed.','en':data.en, 'sc':0}, socket.id);
				}		
			});


		}else{

			db.collection('game_coinstore').findOne( { sku_id : productId }, function(err, result){

				if(result){
					
					var pcoin = result.coin;

					coinStoreCases.verifyPurchase(productId, purchaseToken, function(purchaseInfo){

						if(purchaseInfo.status == 0){

							commonClass.SendData({ 'Message' : purchaseInfo.msg,'en':data.en, 'sc':0}, socket.id);
							return false;

						}else{

							db.collection('game_purchase').insertOne({pdata:pdata, pdate:currentDate, productId:productId, purchaseToken:purchaseToken, chips : pcoin,type : 'credit', msg : 'purchase', price: result.price ,"ct" : "coins", uid : user_id, orderId:data.orderId});

							chipsTrackerCases.insert({chips : pcoin,type : 'credit', msg : 'purchase', "ct" : "coins", uid : user_id, orderId:data.orderId},'');
							userSettingCases.userFindUpdate({ $inc: { coins :  pcoin} }, user_id, function(err, userInfo){
								
								if(err){
									printLog("err5");
									printLog(err);
								}
								commonClass.SendData({'coins':userInfo.value.coins, pcoin:pcoin, ptype:ptype, 'en':data.en, 'sc':1}, socket.id);

							});
						}
					});
				}else{

					commonClass.SendData({ 'Message' : 'Purchase verification failed.','en':data.en, 'sc':0}, socket.id);
				}		
			});

		}
	},
	verifyPurchase:function(productId, purchaseToken, callback){
		iap.verifyPayment('google', {
		receipt: purchaseToken,
		keyObject: {
		  	"private_key": "",
		  	"client_email": "",
		  },
		  productId: productId,
		  subscription: false,
		  packageName: "com.indian.teen.patti.flush.king"
		}, function (error, response) {

			if(error){
				callback({status:0, msg:'invalid purchase'});
			}else{

				if(response.receipt.purchaseState == 0){
            
					callback({status:1, msg:'successfully purchase'});

		        }else{

					callback({status:0, msg:'cancle purchase'});
		        }
			}
		});
	}
	
	
}