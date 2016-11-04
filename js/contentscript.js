'use strict';

var extension_url = chrome.extension.getURL('');
var $head = $(document.head);
var $body = $(document.body);
var LOCK  = false;

/*
 * 公共的 contentscript 文件
 */

(function(){
	if ( window.location.href.indexOf('//siteadmin.tmall.com/design.htm')>-1 || window.location.href.indexOf('//siteadmin.taobao.com/design.htm')>-1 ) {
		var num = 0,
			req = {};

		req.Action = 'GetRandomNum';
		chrome.runtime.sendMessage(req, function(result){ num = result; });

		function WatchRandom(){
			/*
			 * 此函数用于给 background页面 发送一个随机数，用于观察是否有其他 content_script页面 也在执行任务操作。如果是，全局变量 LOCK 为 false，否则为 true
			 */
			chrome.runtime.sendMessage(req, function(result){
				if (result - num) { 
					num = result;
					LOCK = false;
					setTimeout(WatchRandom, 6*1000); 
				} else {
					num = Math.random();
					req.Action = 'SetRandomNum';
					req.random = num;
					chrome.runtime.sendMessage(req, function(result){
						LOCK = true;
						//console.log(result, LOCK);	// 如果函数正常运行，开着2个或以上的后台装修页面，会发现只有一个页面有console.log输出随机数
						setTimeout(WatchRandom, 3*1000);
					});
				}
			});
		}
		setTimeout(WatchRandom, 6*1000);
	}

	$body.on('mouseover', 'bar', function(){
		$('.J_TGoldData.ds-bar-moveup.no-move-up').attr('class', 'J_TGoldData ds-bar-moveup');
		$('.J_TGoldData.ds-bar-movedown.no-move-down').attr('class', 'J_TGoldData ds-bar-movedown');
	});

	$body.on('mouseover', '.button.green.lg.J_TSaveData', function(){
		$('.row.J_TRowBox').attr('style', 'height: 12390px;');
	});

	$body.on('click', '.design-page-select-btn.J_PageSelect.J_TGoldData', function(){
		$.get('/page/pageManager.htm?type=pc', function(data){
			var pageIdToLink = {};
			var $html = $(data);
			var $pageId = $html.find('tr[data-pid]');

			$pageId.each(function (i, e) {
				var pageId = $(this).attr('data-pid');
				var link = $(this).find('.J_PageUrlShow').text();

				pageIdToLink[pageId] = link;
				// console.log(pageId + ' => ' + link);
			});

			$('.pageUrl').remove();
			$('.page-select-list').find('a').each(function (i, e){
				var pageId = $.getUrlParam('pageId', $(this).attr('href'));
				var link = pageIdToLink[pageId];

				if (link) {
					$(this).prepend(`
						<a class="pageUrl" style="margin-top:8px;background:url(` + extension_url + `img/url.png);display:block;width:14px;height:14px;" href="` + link + `" target="_blank"></a>
					`);
				}
			});
		});
	});

})();

function moduleSave(serial, callback){
	var r = {};
	var s = serial.replace(/%C2%A0/g, '%26nbsp%3B');

	$.ajax({
		async: false,
		type: 'POST',
		url: '/module/moduleSave.htm?_input_charset=utf-8',
		data: s,
		success: function(result) {
			if (result.indexOf('模块参数有误')>-1) {
				r.message = '模块参数有误';
				r.isSuccess = false;
				r.errorCode = 1;
				if(typeof callback == "function") { callback(r); }

			} else if (result.indexOf('指定模块不存在')>-1) {
				r.message = '指定模块不存在';
				r.isSuccess = false;
				r.errorCode = 2;
				if(typeof callback == "function") { callback(r); }

			} else if(result.indexOf('操作过于频繁')>-1) {  // 操作过于频繁，请过2秒后再试
				var str = result.match(/\"\[(\S*)\]\"/g)[1];
				var num = parseInt(str.match(/\d+/g)[0]);

				r.message = '操作过于频繁，请过'+num+'秒再试';
				r.isSuccess = false;
				r.errorCode = 3;
				if(typeof callback == "function") { callback(r); }

			} else if(result.indexOf('<!DOCTYPE HTML>')>-1){
				r.message = '放代码成功';
				r.isSuccess = true;
				r.errorCode = 0;
				if(typeof callback == "function") { callback(r); }

			} else {
				console.log('(Important)返回信息不明：', result);
				r.message = '返回信息不明';
				r.isSuccess = false;
				r.errorCode = 4;
				if(typeof callback == "function") { callback(r); }

			}
		},
		error: function(result) {
			console.log("Error:",result);
			r.message = '好像网络出错了';
			r.isSuccess = false;
			r.errorCode = 5;
			if(typeof callback == "function") { callback(r); }

		}
	});
}

function moduleSave2(enc, isDefault, title, content, widgetId, sid, pageId, _tb_token_, callback){
	var r = {};
	//var s = serial.replace(/%C2%A0/g, '%26nbsp%3B');

	$.ajax({
		async: false,
		type: 'POST',
		url: '/module/moduleSave.htm?_input_charset=utf-8',
		data: {
			enc : enc,
			isDefault : isDefault,
			title : title,
			content : content,
			widgetId : widgetId,
			sid : sid,
			pageId : pageId,
			_tb_token_ : _tb_token_
		},
		success: function(result) {
			if (result.indexOf('模块参数有误')>-1) {
				r.message = '模块参数有误';
				r.isSuccess = false;
				r.errorCode = 1;
				if(typeof callback == "function") { callback(r); }

			} else if (result.indexOf('指定模块不存在')>-1) {
				r.message = '指定模块不存在';
				r.isSuccess = false;
				r.errorCode = 2;
				if(typeof callback == "function") { callback(r); }

			} else if(result.indexOf('操作过于频繁')>-1) {  // 操作过于频繁，请过2秒后再试
				var str = result.match(/\"\[(\S*)\]\"/g)[1];
				var num = parseInt(str.match(/\d+/g)[0]);

				r.message = '操作过于频繁，请过'+num+'秒再试';
				r.isSuccess = false;
				r.errorCode = 3;
				if(typeof callback == "function") { callback(r); }

			} else if(result.indexOf('<!DOCTYPE HTML>')>-1){
				r.message = '放代码成功';
				r.isSuccess = true;
				r.errorCode = 0;
				if(typeof callback == "function") { callback(r); }

			} else {
				console.log('(Important)返回信息不明：', result);
				r.message = '返回信息不明';
				r.isSuccess = false;
				r.errorCode = 4;
				if(typeof callback == "function") { callback(r); }

			}
		},
		error: function(result) {
			console.log("Error:",result);
			r.message = '好像网络出错了';
			r.isSuccess = false;
			r.errorCode = 5;
			if(typeof callback == "function") { callback(r); }

		}
	});
}

function getModuleSerial(uri, callback){
	if( !$('#ModuleSerial').length ) { $body.append('<iframe id="ModuleSerial" src="" style="display:none;"></iframe>'); }

	$('#ModuleSerial').unbind();
	
	$('#ModuleSerial').load(function(){
		var $form = $('#ModuleSerial').contents().find('form');
		var s = $form.serialize();

		if(typeof callback == "function") { callback(s); }
	});

	$('#ModuleSerial').attr('src', uri);
}

function getModuleForm(uri, callback){
	if( !$('#ModuleForm').length ) { $body.append('<iframe id="ModuleForm" src="" style="display:none;"></iframe>'); }

	$('#ModuleForm').unbind();
	
	$('#ModuleForm').load(function(){
		var $form = $('#ModuleForm').contents().find('form');
		var html = $form.html();

		if(typeof callback == "function") { callback($form); }
	});
	
	$('#ModuleForm').attr('src', uri);
}

function submitJuneCode(source, target, ModuleType, callback){
	if (ModuleType == '自定义内容区') {
		var req = {};
		req.Action = 'GetCodeFromJunezx';
		req.url = source;

		chrome.runtime.sendMessage(req, function(JuneCode){
			var tbToken;
			var serial;
			var widgetId = $.getUrlParam('widgetId', target);
			var sid = $.getUrlParam('sid', target);
			var pageId = $.getUrlParam('pageId', target);

			//tbToken = $( $('#J_TSwitchToOldContent').val() ).find('[name="_tb_token_"]').attr('value');
			tbToken = $.getUrlParam('_tb_token_', $('.ms-nav-hd-clear.J_MSNavClear').attr('clear-url'));

			moduleSave2('™', 'false', '自定义内容区', JuneCode, widgetId, sid, pageId, tbToken, function(r){
				if(typeof callback == "function") { callback(r); }
			});
		});

	} else {
		getModuleForm(target, function($f){
			// 通过ajax方式向六月设计网站拿source代码
			var req = {};
			req.Action = 'GetCodeFromJunezx';
			req.url = source;

			chrome.runtime.sendMessage(req, function(JuneCode){
				var serial;

				if ( $f.find('[name="content"]').length ) {
					$f.find('[name="content"]').val(JuneCode);
				}

				if ( $f.find('[name="customhtml"]').length ) {
					$f.find('[name="customhtml"]').val(JuneCode);
				}

				serial = $f.serialize();

				moduleSave(serial, function(r){
					if(typeof callback == "function") { callback(r); }
				});
			});	
		});
		
	}
}

function submitRelease(callback){
	var sid = $( $('#J_TSwitchToOldContent').val() ).find('[name="sid"]').attr('value');
	//var tbToken = $( $('#J_TSwitchToOldContent').val() ).find('[name="_tb_token_"]').attr('value');
	var tbToken = $.getUrlParam('_tb_token_', $('.ms-nav-hd-clear.J_MSNavClear').attr('clear-url'));
	var r = {};

	$.ajax({
		type: 'POST',
		url: '/releaseSite.htm',
		data: {
			sid: sid,
			_tb_token_: tbToken
		},
		success: function(result){
			if ( result.indexOf('发布成功')>-1 ) { //发布成功
				r.message = '发布成功';
				r.isSuccess = true;
				r.errorCode = 0;
				if(typeof callback == "function") { callback(r); }

			} else if( result.indexOf('操作过于频繁')>-1 ) { // 操作失败,操作过于频繁，请过10秒后再试
				r.message = '操作过于频繁';
				r.isSuccess = false;
				r.errorCode = 3;
				if(typeof callback == "function") { callback(r); }

			} else {
				r.message = '返回信息不明';
				r.isSuccess = false;
				r.errorCode = 4;
				console.log('(Important)返回信息不明：', result);
				if(typeof callback == "function") { callback(r); }

			}
		},
		error: function(result){
			console.log("Error:" + result);
			r.message = '好像网络出错了';
			r.isSuccess = false;
			r.errorCode = 5;
			if(typeof callback == "function") { callback(r); }
		}
	});
}

function showTip(m, s){
	/*
	 * 在装修后台显示消息，使用了闭包的写法
	 *
	 */
	var messages = [];
	var stats = [];
	var flag = true;

	function run(){
		if(messages.length){
			var message = messages.shift();
			var stat    = stats.shift();

			$('.tip-default.tip-system').removeClass('tip-error');
			$('.tip-default.tip-system').removeClass('tip-success');

			$('.tip-default.tip-system').text(message);
			$('.tip-default.tip-system').css('opacity', '1');
			$('.tip-default.tip-system').addClass(stat);
			$('.tip-default.tip-system').fadeIn();

			setTimeout(_run(), 3000);
		} else {
			flag = true;
		}
	}
	function _run(){
		return function(){
			$('.tip-default.tip-system').hide();
			run();
		}
	}

	return function(m, s){
		messages.push(m);
		stats.push(s || 'tip-success');

		if (flag) { flag = false; run(); }
	}
}
var showTips = showTip();

/* by函数接受一个成员名字符串和一个可选的次要比较函数做为参数
 * 并返回一个可以用来包含该成员的对象数组进行排序的比较函数
 * 当o[age] 和 p[age] 相等时，次要比较函数被用来决出高下
 *
 * 用法：employees.sort(by('age',by('name')));
 * 转自：《JS对象数组排序》http://www.ghugo.com/javascript-sort-array-objects/
 */
var by = function(name,minor){
	return function(o,p){
		var a,b;
		if(o && p && typeof o === 'object' && typeof p ==='object'){
			a = o[name];
			b = p[name];
			
			if(a === b){
				return typeof minor === 'function' ? minor(o,p):0;
			}
			if(typeof a === typeof b){
				return a <b ? -1:1;
			}
			
			return typeof a < typeof b ? -1 : 1;
		}else{
			thro("error");
		}
	}
};

/*
 * 验证时间日期是否合法，用法 var isDate = DATE_FORMAT.test('1991-09-19 12:34:56');
 * 
 * 返回值：合法为 true，非法为 false
 */
var DATE_FORMAT = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-)) (20|21|22|23|[0-1]?\d):[0-5]?\d:[0-5]?\d$/;

(function ($) {
	/*
	 * jQuery 扩展，用于从url中提取某字段的值，用法 var s = $.getUrlParam(name, url);
	 * name 为需要从url中获取的字段，url的格式可以为 http://a.b.c/?spm=1&num=2 或 spm=1&num=2 这种形式
	 * name 必填，url不填则自动取窗口地址栏
	 */
	$.getUrlParam = function (name, url) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = null;

		if (url && url!='') {
			if (url.split('?').length > 1) {
				r = url.split('?')[1].match(reg);
			} else {
				r = url.split('?')[0].match(reg);
			}
		} else {
			r = window.location.search.substr(1).match(reg);
		}

		if (r != null) return decodeURIComponent(r[2]); return null;
	}
})(jQuery);


(function ($){
	/*
	 * jQuery 扩展，用于从url中替换某字段的值
	 *
	 * name 必填，查找的字段
	 * replace 必填，替换从name查到字段的值
	 * url 选填，如果不填默认值为浏览器地址栏的url
	 *
	 * 返回值：修改后的url
	 */
	$.setUrlParam = function (name, replace, url) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = null;
		var link = url || window.location.href;

		if (link.split('?').length > 1) {
			r = link.split('?')[1].match(reg);
		} else {
			r = link.split('?')[0].match(reg);
		}

		if(r != null){
			if (r[2]) {
				return link.replace(r[2], replace);
			} else {
				var tmp = r[0].replace(/&/g,'');
				return link.replace(tmp, tmp+replace);
			}
		} else {
			return link;
		}
	}
})(jQuery);

(function(){
	// 定时向服务器发送get请求，防止装修后台长时间不活动时被注销。
	if (window.location.href.indexOf('//siteadmin.tmall.com/canvas.htm') > -1 || window.location.href.indexOf('//siteadmin.taobao.com/canvas.htm') > -1) {
		GetIt(60);
	}
	function GetIt(arg){
		var uri = $('.J_TModule').eq(1).attr('data-uri');
		// console.log('GetIt:'+uri);
		$.get(uri, function(data){ }); 
		setTimeout(_GetIt(arg), arg*1000);
	}
	function _GetIt(arg){
		return function(){
			GetIt(arg);
		}
	}
})();

(function(){
	if (window.location.href.indexOf('//siteadmin.tmall.com/canvas.htm') > -1 || window.location.href.indexOf('//siteadmin.taobao.com/canvas.htm') > -1) {
		chrome.storage.local.get(function(data){
			if( data.hasOwnProperty('XSMKID') ){
				var xsmkid = data.XSMKID;

				if (xsmkid) {
					if($('.J_TModule').length>0){
						var mobj = $('.J_TModule');
					}else{
						var mobj = $('#J_PageToDesign').contents().find('.J_TModule');
					}

					$('.junemoduledisplayid').remove();

					var J_DesignModeShim = $('#J_DesignModeShim', parent.document);
					$.each(mobj,function(i,e){
						if($(this).height()>40&&$(this).attr('id')){
							var offset_top = $(this).offset().top;
							var input = '<input class="junemoduledisplayid" style="text-indent:10px;position:absolute;left:60px;top:'+offset_top+'px;z-index:99999;height:30px;line-height:30px;color:#fff;background:#f00;width:170px;" type="text" value="模块id：'+$(this).attr('id')+'">';
							J_DesignModeShim.append(input);
						}
					});
				}

			} else {
				chrome.storage.local.set({'XSMKID':false});
				console.log('新建显示模块ID的存储键值XSMKID');

			}
		});	
	}
})();

function getModuleUri(width, top){
	var modules990 = {};
	var modules950 = {};
	
	var modules790 = {};
	var modules750 = {};

	var modules190 = {};
	var w = parseInt(width) + 2;
	var $J_TModule = $('#J_PageToDesign').contents().find('.J_TModule');

	$J_TModule.each(function(i,e){
		switch($(this).width()){
			case 990: 	modules990[$(this).offset().top+'px'] = $(this).attr('data-uri');
						break;
			case 950: 	modules950[$(this).offset().top+'px'] = $(this).attr('data-uri');
						break;
			case 790: 	modules790[$(this).offset().top+'px'] = $(this).attr('data-uri');
						break;
			case 750: 	modules750[$(this).offset().top+'px'] = $(this).attr('data-uri');
						break;			
			case 190: 	modules190[$(this).offset().top+'px'] = $(this).attr('data-uri');
						break;
		}
	});
	
	switch(w){
		case 990: 	return modules990[top];
					break;
		case 950: 	return modules950[top];
					break;
		case 790: 	return modules790[top];
					break;
		case 750: 	return modules750[top];
					break;
		case 190: 	return modules190[top];
					break;
	}
}

function getModuleTypeFromUri(uri){
	var Id = $.getUrlParam('widgetId', uri);
	var f  = '#shop' + Id;
	var ModuleType = $('#J_PageToDesign').contents().find(f).attr('data-title');

	return ModuleType;
}

(function(){
	/*
	 * 基于 jQuery 的元素拖动操作
	 *
	 * 用法：在需要触发拖拽事件的元素上添加 .drag ，在需要拖动的元素上添加 .extension-dialog
	 * 
	 * Example: 
	   <div class="extension-dialog" style="position:absolute;top:123px;left:456px;background:red;z-index:999;">
	        <span class="drag" style="width:100px;height:100px;display:block;"></span>
	   </div>
	 */

	var MoveThis = '.extension-dialog';
	var _move=false;//移动标记  
	var _x, _y;//鼠标离控件左上角的相对位置  


	$body.on('click', '.drag', function(e){
		// alert("click");//点击（松开后触发）
	
	}).on('mousedown', '.drag', function(e){  
		_x=e.pageX-parseInt($(MoveThis).css("left"));  
		_y=e.pageY-parseInt($(MoveThis).css("top")); 
		_move=true;
		// $(".drag").fadeTo(20, 0.5);//点击后开始拖动并透明显示  

	});
	
	$(document).mousemove(function(e){  
		if(_move){  
			var x=e.pageX-_x; // 移动时根据鼠标位置计算控件左上角的绝对位置  
			var y=e.pageY-_y;  
			$(MoveThis).css({top:y,left:x}); // 控件新位置  
		} 

	}).mouseup(function(){  
		_move=false;
		// $(".drag").fadeTo("fast", 1); // 松开鼠标后停止移动并恢复成不透明

	});
})();

