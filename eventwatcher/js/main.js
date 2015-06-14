$(function () {
/*	var remarkSound = $('#remarkSound')[0];
	var paper_round = $('#paper_round')[0];*/
	var textArea, board;
	window.onload = function () {
		textArea = document.getElementById("msg");
		board = document.getElementById("board");
	}


	function getNow() {
		//曜日配列
		var youbi = ["日", "月", "火", "水", "木", "金", "土"];
		//日時取得
		var now = new Date();
		var year = now.getFullYear();
		//var month = now.getMonth() + 1; //+１を入れる。
		var month = ("0"+(now.getMonth() + 1)).slice(-2);//+１を入れる。二桁目に0を入れる

		var date = ('0' + now.getDate()).slice(-2);//二桁目に0を入れる
		var day = now.getDay();var day = now.getDay();
		var h = ('0' + now.getHours()).slice(-2);//二桁目に0を入れる
		var m = ('0' + now.getMinutes()).slice(-2);//二桁目に0を入れる
		var s = ('0' + now.getSeconds()).slice(-2);//二桁目に0を入れる
		//日時表示文字列の作成
		var str = year + "-" + month + "-" + date + "(" + youbi[day] + ") " + h + ":" + m + ":" + s;
		return str;
	}



	var milkcocoa = new MilkCocoa("appleiavzy5gb.mlkcca.com");
	var chatDataStore = milkcocoa.dataStore('hakkason');
	
	

	//位置情報共有部分-------------------------------------
	//この中に処理を記述 開始
	var lat, lon;
	if (navigator.geolocation) {
		// 現在の位置情報取得を実施
		navigator.geolocation.getCurrentPosition(
			// 位置情報取得成功時
			function (pos) {
				var location = "<li>" + "緯度：" + pos.coords.latitude + "</li>";
				location += "<li>" + "経度：" + pos.coords.longitude + "</li>";
				lat = pos.coords.latitude;
				lon = pos.coords.longitude;
				//setMarker(lat, lon);
				console.log(lat);
				console.log(lon);
				console.log('取得成功');
				//latlonBtn.disabled = false;
				localStorage.setItem("lat", lat);
				localStorage.setItem("lon", lon);
			},
			// 位置情報取得失敗時
			function (error) {
				var message = "";
				switch (error.code) {
						// 位置情報取得できない場合
					case error.POSITION_UNAVAILABLE:
						message = "位置情報の取得ができませんでした。";
						break;
						// Geolocation使用許可されない場合
					case error.PERMISSION_DENIED:
						message = "位置情報取得の使用許可がされませんでした。";
						break;
						// タイムアウトした場合 
					case error.PERMISSION_DENIED_TIMEOUT:
						message = "位置情報取得中にタイムアウトしました。";
						break;
				}
				window.alert(message);
			});
	} else {
		window.alert("本ブラウザではGeolocationが使えません");
	}
	

	chatDataStore.stream().sort('desc').size(100).next(function (err, data) {//最新から100件のデータを取得するためsortをdescに指定
		$.each(data, function (i, v) {
			addText(v.value, v.id);
		});
	});



	function clickEvent() {
		var text = textArea.value;
		text = text.replace(/\r?\n/g, '<br>');
		sendText(text);
	}
	$("#sendMessage").on("click", clickEvent);

	
	//データ受信（milkcocoa受信メソッド）
	chatDataStore.on("push", function (data) { //pushをsendにするとデータベースに保存可能
		addText(data.value, data.id);
	});

	//
	function sendText(text) {
		var name = $("#name").val();
		if(!textArea.value){
			console.log("送信せず!");
			return;
		}
		chatDataStore.push({
			message: text,
			lat: lat,
			lon: lon,
			input_date: getNow()
		});
		console.log("送信完了!");
		textArea.value = "";
	}





	function addText(text,id) {
		latSa = Math.abs(lat - text.lat);
		lonSa = Math.abs(lon - text.lon);
		//赤道周囲 Rx = 40076.5km
		//緯度 Ry / (360×60) = 1852.25m
		//1m = 360 * 60 / 1852.25
		//子午線周囲 Ry = 40008.6km
		//経度 Rx cosθ / (360×60) = 1519.85m
		var msgDom = document.createElement("li");
		if(latSa < 1/111323.61111111111*100 && lonSa < 1/111323.61111111111*100){
				msgDom.innerHTML = '<div class="clearfix">'+
					'<span class="text_message">' + text.message + '</span>' + 
					'<br><a href="http://maps.google.co.jp/maps?q=loc:' + text.lat +',' + text.lon + '" target=”_blank”>http://maps.google.co.jp/maps?q=loc:' + text.lat +',' + text.lon + '</a></span>' + 
					'<br><span class="text_Time">' + text.input_date + '</span>' + 
					'<br><span class="id">' + id + '</span></div>';
			$('#board').append(msgDom);
			scrollSet();
			}else{
				console.log('圏外');
			}
		
		//remarkSound.play();
	}



	function scrollSet(){
		$("#board")[0].scrollTop = $("#board")[0].scrollHeight; //CSS:overflowで表示領域を固定が必須
	}

	/*var nameRireki = localStorage.getItem('name');
	$("#name").val(nameRireki);*/
	var lat = localStorage.getItem('lat');
	//$("#facebookId").val(facebookRireki);
	var lon = localStorage.getItem('lon');
	//$("#twitterId").val(twitterRireki);


	//--------------------------発言削除用-----------------------------
	$("#board").on("dblclick",'li',function(){
		if($(this).find('.text_name').text() != localStorage.getItem("name")) return;
		// 「OK」時の処理開始 ＋ 確認ダイアログの表示
		if(window.confirm('発言を削除しますか？')){
			paper_round.pause();
			paper_round.currentTime = 0;
			paper_round.play();
			chatDataStore.remove($(this).find('span.id').text());
			$(this).remove();//削除処理
		}// 「OK」時の処理終了
		else{// 「キャンセル」時の処理開始
			window.alert('キャンセルされました'); // 警告ダイアログを表示
		}
	});

	$(document).on("keydown", "#msg", function(e) {
		if (e.keyCode == 13) { // Enterが押された
			$.noop();//何もしないことを明示的に記述
			if (e.shiftKey) { // Shiftキーも押された
				//$.noop();
				clickEvent();
				return false;
			}
		} else {
			$.noop();//何もしないことを明示的に記述
		}
	});

	console.log(milkcocoa);
	console.log(chatDataStore);
	milkcocoa.user(function(err, user) {
		if(err) {
			//error
			return;
		}
		if(user) {
			console.log("Logged in", user);
		}else{
			console.log("Not logged in");
		}
	});










/*
	latlonBtn.addEventListener('click',function(){
		var text = textArea.value;
		text = text.replace(/\r?\n/g, '<br>');
		sendMap(text,lat,lon);
	});

*/

	//位置情報送信用メソッド
	function sendMap(text,lat,lon) {
		if(!lat || !lon){
			console.log("送信せず!");
			return;
		}
		var name = $("#name").val();
		var facebookId = $("#facebookId").val();
		var twitterId = $("#twitterId").val();
		console.log(name);
		chatDataStore.push({
			message: text,
			input_date: getNow(),
			lat:lat,
			lon:lon,
		});
		console.log("送信完了!");
		textArea.value = "";
		localStorage.setItem('name',name);
/*		if(!twitterId){
			localStorage.setItem('facebookId',facebookId);
			localStorage.setItem('twitterId','');
		}else{
			localStorage.setItem('facebookId','');
			localStorage.setItem('twitterId',twitterId);
		}*/
	}


});