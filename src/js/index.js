$(function() {
	$timerListUl=$('.list ul');
	main();
});
function turn2page (n) {
	$('.main').animate({
		'left': -n*250
	}, 300);
}
//渲染倒计时
var $timerListUl =null;

function showRemainingTime() {
	var nowTime = new Date().getTime();
	$timerListUl.find('span.remain').each(function(n, e) {
		var bg = chrome.extension.getBackgroundPage();
		var remain = bg.timerList[n].time - nowTime;
		console.log('showRemainingTime:'+new Date(bg.timerList[n].time));
		if (remain < 0) remain = 0;
		var remainDay = Math.floor(remain / (24 * 60 * 60 * 1000));
		var remainHour = Math.floor((remain % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
		var remainMin = Math.floor((remain % (60 * 60 * 1000)) / (60 * 1000));
		var remainSec = Math.floor((remain % (60 * 1000)) / 1000);
		var remainStr =
			((remainDay > 0) ? remainDay + '天' : '') +
			((remainHour > 0) ? remainHour + '时' : '') +
			((remainMin > 0) ? remainMin + '分' : '') +
			((remainSec > 0) ? remainSec + '秒' : '0秒');
		$(this).html('剩余时间:' + remainStr);
	});
}

function resetNow() {
	var now = new Date();
	$('#date').val(now.format('yyyy-MM-dd'));
	$('#hour').val(now.getHours());
	$('#min').val(now.getMinutes());
	$('#sec').val(now.getSeconds() + 10);
}

function loadTimerListUI() {
	var bg = chrome.extension.getBackgroundPage();
	$timerListUl.html('');
	var timeDate=new Date();
	for (var i = 0; i < bg.timerList.length; i++) {
		var timer = bg.timerList[i];
		timeDate.setTime(timer.time);
		$timerListUl.append('<li class="list-group-item">' +
			timer.text +
			'<a class="del btn btn-danger btn-xs glyphicon pull-right glyphicon-remove"></a>'+
					    '<div><span class="small text-info alarm-time">定时:'+
					    timeDate.format('yyyy-MM-dd hh:mm:ss')
					    +'</span>'+
						    '<span class="small text-info remain">剩余时间:0s</span></div>');
	}

	$('.del').each(function(n, e) {
		var $this = $(this);
		$this.click(function() {
			var b = confirm('您确定要删除该定时吗?');
			if (b) {
				$this.parent().remove();
				var bg = chrome.extension.getBackgroundPage();
				var timer=bg.timerList[n];
				bg.removeTimer(timer);
				loadTimerListUI();
			}
		});
	});

	showRemainingTime();
}
//ui主函数
function main() {
	//表单页面
	$('.form_date').datetimepicker({
		startDate: new Date(),
		weekStart: 1,
		todayBtn: 1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0,
		pickerPosition: "bottom-left"
	});
	resetNow();
	$('.time').on('keydown', function(e) {
		var e = e || event;
		if (e.keyCode >= 48 && e.keyCode <= 58) {
			var $this = $(this);
			var one = e.keyCode - 48;
			var ten = parseInt($this.val());
			var min = parseInt($this.attr('min'));
			var max = parseInt($this.attr('max'));
			var n = one;
			if (ten) {
				n = ten * 10 + one;
			}
			if (n < min || n > max) {
				return false;
			}
			return true;
		} else if (e.keyCode === 8 || e.keyCode === 9) {
			return true;
		} else {
			return false;
		}
	}).on('mousewheel', function(e) {
		var $this = $(this);
		var min = parseInt($this.attr('min'));
		var max = parseInt($this.attr('max'));
		var n = 0;
		if (e.originalEvent.wheelDelta < 0) {
			var n = parseInt($this.val()) - 1;
		} else {
			var n = parseInt($this.val()) + 1;
		}
		if (n < min) {
			n = max;
		}
		if (n > max) {
			n = min;
		}
		$this.val(n);
	});


	$('.type .dropdown-menu a').click(function() {
		var $this = $(this),
			$btn_type = $('#btn_type'),
			type = parseInt($this.attr('value'));

		$btn_type
			.attr('value', type)
			.html($this.text() + ' <span class="caret"></span>');
		if (type === 0) { //直到
			resetNow();
			$('.date-field').slideDown();
		} else { //再过
			$('#hour').val(0);
			$('#min').val(0);
			$('#sec').val(0);
			$('.date-field').slideUp();
		}
	});

	$('#btn-donate').click(function () {
		turn2page(0);
	});
	$('#btn-donate-back').click(function () {
		turn2page(1);
	});

	//列表页面
	loadTimerListUI();

	$('#resetNow').click(function() {
		resetNow();
	});
	$('#add').click(function() {
		resetNow();
		turn2page(2);
	});
	$('#cancel').click(function() {
		turn2page(1);
	});
	$('#submit').click(function() {
		var text = $('#text').val(),
			timeDate = null,
			type = parseInt($('#btn_type').attr('value')),
			hour = parseInt($('#hour').val()),
			min = parseInt($('#min').val()),
			sec = parseInt($('#sec').val()),
			sound=$('#sound').is(':checked'),
			repeat=$('#repeat').is(':checked');

		if (type === 0) { //直到
			timeDate = new Date();
			var dateArr = $('#date').val().split('-');
			timeDate.setFullYear(parseInt(dateArr[0]), parseInt(dateArr[1]) - 1, parseInt(dateArr[2]));
			timeDate.setHours(hour, min, sec);
		} else { //再过
			var after = (hour * 60 * 60 + min * 60 + sec) * 1000;
			timeDate = new Date(new Date().getTime() + after);
		}
		console.debug('add timer ' + timeDate.format('yyyy-MM-dd hh:mm:ss'));
		var time = timeDate.getTime();
		if (time <= new Date().getTime()) {
			alert('时间设置不能小于当前时间');
			return;
		}
		var bg = chrome.extension.getBackgroundPage();
		var timer = new bg.Timer(
			type,
			time,
			text,
			sound,
			repeat
		);

		var bg = chrome.extension.getBackgroundPage();
		bg.registTimer(timer);
		bg.saveTimer(timer);

		loadTimerListUI();
	
		turn2page(1);
	});

	setInterval(showRemainingTime, 1000);
}