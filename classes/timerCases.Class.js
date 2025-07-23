module.exports = {
	otherUserWaitngTimer:function(roomId, socket, callback){

		// printLog("otherUserWaitngTimer>>>"+roomId);
		let startTime = new Date(Date.now() + config.ROBOT_ADD_TIMER);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	tablesManager.addBot(roomId,socket);
		});

		timerClass.updateTimer(roomId, timerId)
		// timerClass.cancelTimer(data._id, timerId);
	},
	updateTimer:function(roomId, timerId){

		if( (null != roomId && roomId !="") && (null != timerId && timerId !="") ){
			var upWhere = {$set: {}};
			upWhere.$set.timerid = timerId;
			upWhere.$set.utime = new Date(Date.now());
		  	tablesManager.RoomUpdate(roomId,upWhere);
		}
	},
	cardDistributeTimer:function(roomId, socket){

		if( (null != roomId && roomId !="") ){

			let startTime = new Date(Date.now() + config.GAME_CARD_DISTRIBUTE_TIMER);
			var timerId = commonClass.GetRandomString(20);
			schedule.scheduleJob(timerId,startTime, function(){
				playingCases.distributeCards(roomId, socket);
			});

		}
	},
	cancelTimer:function(roomId, timerId){

		// printLog('cancelTimer>>>>roomId>>>>'+roomId+'>>>>timerId>>>>'+timerId);
		if( (null != roomId && roomId !="") && (null != timerId && timerId !="") ){

			try{
				//job schedule cancel
				var my_job = schedule.scheduledJobs[timerId];
				my_job.cancel();
				
			}catch(e){

			}
			var upWhere = {$set: {}};
			upWhere.$set.timerid='';
		  	tablesManager.RoomUpdate(roomId,upWhere);
		}
	},
	cancelTimerV2:function(roomId, timerId, callback){

		// printLog('cancelTimer>>>>roomId>>>>'+roomId+'>>>>timerId>>>>'+timerId);
		if( (null != roomId && roomId !="") && (null != timerId && timerId !="") ){

			try{
				//job schedule cancel
				var my_job = schedule.scheduledJobs[timerId];
				my_job.cancel();
				
			}catch(e){

			}
			var upWhere = {$set: {}};
			upWhere.$set.timerid='';
		  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
		  		callback(true);
		  	});
		}else{
		  	callback(true);
		}
	},
	gameStartTimer:function(roomId, socket){

		// printLog(roomId);
		if( roomId !="" ){
			
			commonClass.SendData({'data':{ 'time':config.GAME_START_SERVICE_TIMER}, 'en':'GST', 'sc':1}, roomId);

			let startTime = new Date(Date.now() + config.GAME_START_SERVICE_TIMER_D);
			var timerId = commonClass.GetRandomString(20);
			schedule.scheduleJob(timerId,startTime, function(){

				playingCases.gameStart(roomId, socket);
			});


			var upWhere = {$set: {}};
			upWhere.$set.timerid = timerId;
			upWhere.$set.igt = false;
			upWhere.$set.itrmnt_start = true;
			upWhere.$set.timerType = 'gameStart';

			// upWhere.$set.utime = new Date(Date.now());
			upWhere.$set.utime = moment().format('YYYY-MM-DD HH:mm:ss');
		  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
		  	});

		}
	},
	NextTurnTimer:function(roomId, currentTurnId, socket){
		let startTime = new Date(Date.now() + config.GAME_TURN_TIMER);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.turnTimeOut(roomId, currentTurnId, socket);
		});

		timerClass.updateTimer(roomId, timerId)
	},
	NextTurnTimerV2:function(roomId, currentTurnId, socket, callback){
		let startTime = new Date(Date.now() + config.GAME_TURN_TIMER_D);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.turnTimeOut(roomId, currentTurnId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
	selectVariation:function(roomId, currentTurnId, socket, callback){
		let startTime = new Date(Date.now() + config.GAME_VARIATION_SELECT_TIMER);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.autoSelectVariation(roomId, currentTurnId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
	firstTurnTimer:function(roomId, socket, callback){
		let startTime = new Date(Date.now() + 3000);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.firstTurn(roomId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
	WinnerTimer:function(roomId, socket, callback){

		// printLog('WinnerTimer timer');
		let startTime = new Date(Date.now() + 5000);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.WinnerTimerAfter(roomId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		upWhere.$set.igt = false;
		upWhere.$set.timerType = 'win';
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
}