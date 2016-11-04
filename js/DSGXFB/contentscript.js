'use strict';

(function(){
	chrome.storage.local.get(function(data){
		if ( data.hasOwnProperty('DSGXFB') ) {
			var dsgxfb = data.DSGXFB;
			console.log('定时更新发布的存储值为：', dsgxfb);

		} else {
			chrome.storage.local.set({'DSGXFB':[]});
			console.log('新建定时更新发布的存储键值DSGXFB');

		}
	});
})();

(function(){
	var css, 
		tag,
		extension_url = chrome.extension.getURL('');

	css = 'background:url('+extension_url+'img/Alarm-Clock.png);float:left;display:block;width:24px;height:24px;cursor:pointer;margin:5px;';
	tag = '<a id="AlarmClock" style="'+css+'"></a>';
	$body.on('mouseover', 'bar', function(){
		if ($('#AlarmClock').length<=0) {
			$(this).children('baracts').append(tag);
		}
	});

	function setDialogParam(uri){
		if(!uri) { return 0; }

		$('#Task_uri').val(uri);

		var req = {};

		req.Action = 'getValue';
		chrome.runtime.sendMessage(req, function(result){
			var Task = result['Task'] || '';
			if (Task != '') {
				$('#Task_title').val(Task.title);
				//$('#Task_code').val(Task.code);
				$('#Task_time').val(Task.time);
			}
		});
	}

	$body.on('click', '#AlarmClock', function(){
		var module_top = $(this).parent().parent().css('top');
		var module_width = $(this).parent().parent().css('width');
		var width = 400;
		var height = 180;
		var left = $(window).width() / 2 - width / 2;
		var top  = $(window).height() / 2 - height / 2; 

		if ($('.extension-dialog').length <= 0) {
			$body.append(`
				<div id="SetReleaseTime" class="tb-dialog tb-overlay extension-dialog drag" style="width:`+width+`px; z-index:10000388; left:`+left+`px; top:`+top+`px;" >
					<script language="javascript" type="text/javascript" src="`+extension_url+`js/My97DatePicker/WdatePicker.js"></script>
					<a class="tb-dialog-close tb-overlay-close" data-action="close">					
						<span class="tb-dialog-close-x tb-overlay-close-x">close</span>
					</a>
					<div  class="tb-dialog-content tb-overlay-content" style="display: block;">
						<div class="tb-dialog-header tb-overlay-header drag">定时更新发布设置</div>
						<div class="tb-dialog-body tb-overlay-body" style="height:`+height+`px;padding:5px;">
							<input id="Task_uri" type="hidden" value="">
							<br/>
							<p>
								<label>代码的备注名：</label><input id="Task_title" type="text" style="width:140px;" placeholder="店招1点半更新" />
							</p>
							<br/>
							<p>
								<label>代码链接地址：</label><input id="Task_code" type="text" style="width:280px;" placeholder="http://junezx.com/2.0/previewP.php?ID=1103212" />
							</p>
							<br/>
							<p>
								<label>放代码的时间：</label><input id="Task_time" onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss'})" type="text" class="Wdate" style="width:282px;" placeholder="2016-06-15 01:23:46" />
							</p>
							<br/>
							<p>
								<input id="Task_release" type="checkbox"><label>放代码后发布</label><button data-action="confirm" style="margin-left:10px;cursor:pointer;">确定</button>
							</p>
						</div>
						<div class="tb-dialog-footer tb-overlay-footer"></div>
					</div>
				</div>
			`);
		}

		//window.frames[0].postMessage(module_top, '*');
		//console.log(module_width, module_top);
		var uri = getModuleUri(module_width, module_top);
		setDialogParam(uri);
	});

	$body.on('click', '[data-action="close"]', function(){
		$('#SetReleaseTime').remove();
	});

	$body.on('click', '#SetReleaseTime [data-action="confirm"]', function(){
		var Task = {};

		if (DATE_FORMAT.test($('#Task_time').val()) && $('#Task_uri').val()) {
			Task.uri = $('#Task_uri').val();
			Task.title = $('#Task_title').val();
			Task.code = $('#Task_code').val();
			Task.time = $('#Task_time').val();
			Task.release = $('#Task_release').is(':checked');
			Task.isExec = true;
			Task.moduleType = getModuleTypeFromUri($('#Task_uri').val());

			// 存储任务队列
			chrome.storage.local.get('DSGXFB', function(data){
				var dsgxfb = data.DSGXFB;
				dsgxfb.push(Task);
				dsgxfb.sort(by('time'));

				var stor = {};
				stor['DSGXFB'] = dsgxfb;
				chrome.storage.local.set(stor, function(){ 
					showTips('任务添加成功'); 
					$('#SetReleaseTime').remove(); 
					console.log(Task); 
				});
			});

			// 存储缓存值
			var req = {};
			req.Action = 'setValue';
			req.Key = 'Task';
			req.Value = Task;
			chrome.runtime.sendMessage(req, function(result){});

		} else {
			showTips('时间格式有误', 'tip-error');
		}
	});
})();

(function(){
	var id_of_setTimeout;

	function Loop(){
		if(LOCK) { CheckTask(); }
		id_of_setTimeout = setTimeout(Loop, 6*1000);
	}
	setTimeout(Loop, 12*1000);

	function getRecentTask(callback){
		chrome.storage.local.get('DSGXFB', function(data){
			var dsgxfb = data.DSGXFB;
			var len = dsgxfb.length;

			for(var i=0; i<len; i++){
				var ReleaseTime = new Date(dsgxfb[i].time);
				var NowTime 	= new Date();

				if( dsgxfb[i].isExec && (ReleaseTime.getTime() <= NowTime.getTime()) ) {
					if(typeof callback == "function") { callback(dsgxfb, i); }
					break;
				}

				if( dsgxfb[i].release && (ReleaseTime.getTime() <= NowTime.getTime()) ) {
					if(typeof callback == "function") { callback(dsgxfb, i); }
					break;
				}
			}
		});
	}

	function CheckTask(){
		getRecentTask(function(q, i){
			clearTimeout(id_of_setTimeout);

			if(q[i].isExec){
				submitJuneCode(q[i].code, q[i].uri, q[i].moduleType, function(r){	
					if(r.isSuccess){ showTips(r.message); } else { showTips(r.message, 'tip-error'); }
					if( r.errorCode < 3 ) {
						q[i].isExec = false;

						var stor = {};
						stor['DSGXFB'] = q;
						chrome.storage.local.set(stor, function(){ });
					}
					id_of_setTimeout = setTimeout(Loop, 6*1000);

				});

			} else {
				submitRelease(function(r){
					if(r.isSuccess){ showTips(r.message); } else { showTips(r.message, 'tip-error'); }
					if( r.errorCode < 3 ) {
						q[i].release = false;

						var stor = {};
						stor['DSGXFB'] = q;
						chrome.storage.local.set(stor, function(){ });
					}
					id_of_setTimeout = setTimeout(Loop, 6*1000);

				});
			}

		});
	}
})();

(function(){
	var extension_url = chrome.extension.getURL('');

	function showDialog(){
		$('#ReleaseTime').remove();
		
		$('.addition-send .pd').append(`
			<p id="ReleaseTime" style="margin-top:20px;">
				<script language="javascript" type="text/javascript" src="`+extension_url+`js/My97DatePicker/WdatePicker.js"></script>
				<label style="margin-right:3px;">在</label><input onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss'})" type="text" class="Wdate" style="width:180px;" placeholder="2016-06-15 01:23:46">
				<button data-action="release" style="cursor:pointer;margin-right:5px;padding:0px 5px;">发布</button>
				<button data-action="CancelRelease" style="cursor:pointer;padding:0px 5px;">取消</button>
			</p>
		`);
	}

	$body.on('click', '.J_TGoldData.btn.btn-primary.J-send-site, .page-publish-btn.J-send-site.J_TGoldData', function(){
		setTimeout(showDialog, 0);
	});

	$body.on('click', '#ReleaseTime [data-action="release"]', function(){
		if ( DATE_FORMAT.test( $('#ReleaseTime input').val() ) ) {
			var req = {};
			req.Action = 'setValue';
			req.Key = 'TimedRelease';
			req.Value = $('#ReleaseTime input').val();
			chrome.runtime.sendMessage(req, function(result){ showTips('定时发布设定成功'); location.reload(true); });
		}
	});

	$body.on('click', '#ReleaseTime [data-action="CancelRelease"]', function(){
		var req = {};
		req.Action = 'setValue';
		req.Key = 'TimedRelease';
		req.Value = '';
		chrome.runtime.sendMessage(req, function(result){ showTips('取消成功'); location.reload(true); });
	});

	var req = {};
	req.Action = 'getValue';
	chrome.runtime.sendMessage(req, function(result){
		var t = result['TimedRelease'];

		if ( ($('#Countdown').length <= 0) && t ){
			$('.design-mode-select').after(`
				<div id="Countdown" style="position:relative;overflow:hidden;margin-left:50%;left:-134px;top:23px;" data-time="`+t+`">
					<span style="float:left;display:block;text-align:center;line-height:16px;color:#ff0000;font-size:16px;">离发布还有</span>
					<span class="ks-d" style="float:left;display:block;text-align:center;line-height:16px;color:#ff0000;font-size:16px;">00天</span>
					<span class="ks-h" style="float:left;display:block;text-align:center;line-height:16px;color:#ff0000;font-size:16px;">00时</span>
					<span class="ks-m" style="float:left;display:block;text-align:center;line-height:16px;color:#ff0000;font-size:16px;">00分</span>
					<span class="ks-s" style="float:left;display:block;text-align:center;line-height:16px;color:#ff0000;font-size:16px;">00秒</span>
				</div>
			`);
		}
	});
})();

(function(){
	function show_time(){ 
		var t = $('#Countdown').attr('data-time');
		var time_start = new Date().getTime(); //设定当前时间
		var time_end =  new Date(t).getTime(); //设定目标时间
		// 计算时间差 
		var time_distance = time_end - time_start; 
		if (time_distance<0) { 
			var req = {};
			req.Action = 'getValue';
			chrome.runtime.sendMessage(req, function(result){
				var t = result['TimedRelease'];
				if (t) {
					submitRelease(function(r){
						if(r.isSuccess){ showTips(r.message); } else { showTips(r.message, 'tip-error'); }
						if( r.errorCode < 3 ) {
							var req = {};
							req.Action = 'setValue';
							req.Key = 'TimedRelease';
							req.Value = '';
							chrome.runtime.sendMessage(req, function(result){ });
						}else{
							setTimeout(show_time, 10*1000);
						}				
					});			
				}
			});
			return 0; 
		}
		// 天
		var int_day = Math.floor(time_distance/86400000) 
		time_distance -= int_day * 86400000; 
		// 时
		var int_hour = Math.floor(time_distance/3600000) 
		time_distance -= int_hour * 3600000; 
		// 分
		var int_minute = Math.floor(time_distance/60000) 
		time_distance -= int_minute * 60000; 
		// 秒
		var int_second = Math.floor(time_distance/1000) 
		// 时分秒为单数时、前面加零 
		if(int_day < 10){ 
			int_day = "0" + int_day; 
		} 
		if(int_hour < 10){ 
			int_hour = "0" + int_hour; 
		} 
		if(int_minute < 10){ 
			int_minute = "0" + int_minute; 
		} 
		if(int_second < 10){
			int_second = "0" + int_second; 
		} 
		// 显示时间 
		$("#Countdown .ks-d").text(int_day+'天'); 
		$("#Countdown .ks-h").text(int_hour+'时'); 
		$("#Countdown .ks-m").text(int_minute+'分'); 
		$("#Countdown .ks-s").text(int_second+'秒'); 
		// 设置定时器
		setTimeout(show_time, 1000);
	}
	show_time();
})();
