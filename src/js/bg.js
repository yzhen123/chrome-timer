var audio = new Audio();
audio.src = "../sound/WindowsNotifyMessaging.wav";
audio.loop = true;

//定义timer对象
var Timer = function(type, time, text, sound, repeat) {
	this.index = 0;
	this.type = type || 0;
	this.time = time || 0;
	this.text = text || '新提醒';
	this.sound = sound;
	this.repeat = repeat;
	this.t = null;
	this.noti = null;
	this.audi = null;
}

function clearAlarm(t) {
		try {
			if (!t.repeat) {
				clearTimeout(t.t);
			}
		} catch (e) {
//			console.error(e);
		}
		try {
			t.noti && t.noti.cancel();
		} catch (e) {
//			console.error(e);
		}
		try {
			audio.pause();
		} catch (e) {
//			console.error(e);
		}
	}
	//移除timer

function removeTimer(t) {
		clearAlarm(t);
		var newList = [];
		for (var i = 0; i < timerList.length; i++) {
			var timer = timerList[i];
			if (i !== t.index) {
				timer.index = newList.length;
				newList.push(timer);
			}
		}
		timerList = newList;
		saveTimerList();
	}
	//初始化timer数组
var timerList = [];
try {
	var s = localStorage['s'];
	if (s) {
		timerList = JSON.parse(s);
	}
} catch (e) {
	console.error(e);
}
//注册原有定时器
for (var i = 0; i < timerList.length; i++) {
	var timer = timerList[i];
	registTimer(timer);
}

function stringifyFilter(value) {
	var newV = {};
	for (var i in value) {
		newV[i] = value[i];
	}
	newV.t = 0;
	newV.audi = 0;
	newV.noti = 0;
	return newV;
}

function saveTimerList() {
		var newList = [];
		for (var i = 0; i < timerList.length; i++) {
			var timer = timerList[i];
			newList.push(stringifyFilter(timer));
		}
		localStorage['s'] = JSON.stringify(newList);
	}
	//提醒


function alarm(timer) {
		if (timer.sound) {
			try{
				if(audio){
					audio.play();
				}else{
					setTimeout(audio.play,200);
				}
			}catch(e){console.error(e)}
		}
		if(Notification.permission){
			console.log("Notification.permission:"+Notification.permission);
		}else{
			Notification.requestPermission();
		}
		var notification = new Notification(
			'来自chrome定时器的提醒', // notification title
			{
				icon:'../img/icon-64.png', // icon url - can be relative
				body:new Date(timer.time).format('yyyy-MM-dd hh:mm:ss') + ': ' + timer.text // notification body text
		});
		timer.noti = notification;
		notification.onclose = function() {
			clearAlarm(timer);
		};
		if (timer.repeat) {
			var now = new Date().getTime();
			while (timer.time <= now) {
				timer.time += 24 * 60 * 60 * 1000;
			}
			saveTimerList();
			registTimer(timer);
		}
	}
	//注册单个timer

function registTimer(timer) {
		var now = new Date().getTime();
		if (timer.time <= now + 500) {
			alarm(timer);
		} else {
			timer.t = setTimeout(function() {
				alarm(timer);
			}, timer.time - now);
		}
	}
	//保存单个timer

function saveTimer(timer) {
		timer.index = timerList.length;
		timerList.push(timer);
		saveTimerList();
	}
	//解决google访问慢问题
/*chrome.webRequest.onBeforeRequest.addListener(

	function(details) {
		var url = details.url;
		//通过匹配测试一个请求
		if (url.indexOf("googleapis") != -1) {
			var newUrl = url.replace(/http[s]{0,1}\:\/\/(\w+)\.googleapis\.com/, 'http://$1.useso.com');
			return {
				redirectUrl: newUrl
			}; //我试了本机服务器下的一个文件。
			//1. 记得要返回rediretUrl. 之前我用url,是无效的。
		}
		return true;
	}, {
		urls: ["<all_urls>"]
	}, //监听所有的url,你也可以通过*来匹配。
	["blocking"]
);
*/