'use strict';

var $doc = $(document);
var $body= $(document.body);

//初始化Chrome Storage API 
function showLists(s) {
	chrome.storage.local.get('DSGXFB', function(data){
		var dsgxfb = data.DSGXFB;

		if (dsgxfb.length) {
			dsgxfb.sort(by(s));
			for (var key=0 ; key < dsgxfb.length; key++) {
				var release = dsgxfb[key].release;
				var checked = release ? 'background:#ffd2d2;':'';
				var isExec  = dsgxfb[key].isExec ? '' : 'text-decoration:line-through;';

				$('#sort').before(`
					<li class="task" data-action="ShowDetailSet" data-key="`+key+`">
						<a style="`+checked+`">`+dsgxfb[key].title+` 
							<i data-action="Delete" data-key="`+key+`" style="color:#ff0000;">删除</i>
							<i style="`+isExec+`width:120px;">`+dsgxfb[key].time+`</i>
						</a>
					</li>			
				`);			
			}

			var stor = {};
			stor['DSGXFB'] = dsgxfb;
			chrome.storage.local.set(stor, function(){});
		}
	});
}
showLists('time');

function ShowCategory(){
	// 读取模块分类
	chrome.storage.local.get('MODULESYNC', function(data){
		var ModuleSync = data.MODULESYNC;
		var json;

		$('.category').remove();
		for(var k in ModuleSync){
			json = JSON.stringify(ModuleSync[k]);
			$("#Select_Cate").append("<option class='category' value='"+json+"'>"+k+"</option>");
		}
	});
}

var ActionLists = {
	'ShowDetailSet' : function($that) {
		if ($('.detail').length <= 0) {
			chrome.storage.local.get('DSGXFB', function(data) {
				var extension_url = chrome.extension.getURL('');
				var dsgxfb = data.DSGXFB;
				var key = $that.attr('data-key');
				var release = dsgxfb[key].release;
				var checked = release ? 'checked="checked"':'';

				var pageId = $.getUrlParam('pageId', dsgxfb[key].uri);
				var widgetId = $.getUrlParam('widgetId', dsgxfb[key].uri);
				var sid = $.getUrlParam('sid', dsgxfb[key].uri);
				var moduleLink = 'https://siteadmin.tmall.com/design.htm?widgetId='+widgetId+'&pageId='+pageId+'&sid='+sid;

				$that.after(`
					<div class="detail">
						<div>
							<a href="`+moduleLink+`" target="_blank">
								<span style="font-weight:bold;line-height:40px;width:100px;">设置模块定时任务</span>
							</a><br>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">代码的备注名:</label>
							<input id="Task_title" value="`+dsgxfb[key].title+`" style="width:260px;">
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">代码链接地址:</label>
							<input id="Task_code" value="`+dsgxfb[key].code+`" style="width:260px;">
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">放代码的位置:</label>
							<input id="Task_uri" value="`+dsgxfb[key].uri+`" style="width:260px;" >
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">放代码的时间:</label>
							<input id="Task_time" value="`+dsgxfb[key].time+`" style="width:260px;" >
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">放代码后发布：</label>
							<input id="Task_release" type="checkbox" `+checked+`>
							<button data-action="Save" data-key="`+key+`" style="float:right;margin-right:12px;">保存设置</button>
						</div>
						<div id="SaveSuccess" style="display:none;">
							<span style="font-style:italic;color:red;font-weight:bold;">保存成功</span>
						</div>
					</div>
				`);
			});	
		} else {
			$('.detail').remove();
		}	
	},
	'Delete' : function($that) {
		if (confirm('确认要删除该定时任务吗？')) {
			var key = $that.attr('data-key');

			chrome.storage.local.get('DSGXFB', function(data){
				if (data.DSGXFB) {
					var dsgxfb = data.DSGXFB;
					dsgxfb.del(key);

					var stor = {};
					stor['DSGXFB'] = dsgxfb;
					chrome.storage.local.set(stor, function(){});

					$('.task').remove();
					$('.detail').remove();
					showLists('time');
				}
			});
		}
	},
	'Clear' : function($that) {
		if (confirm('确认要清空辛苦建立的所有定时任务吗？')) {
			chrome.storage.local.get('DSGXFB', function(data){
				var dsgxfb = data.DSGXFB;
				dsgxfb = [];

				var stor = {};
				stor['DSGXFB'] = dsgxfb;
				chrome.storage.local.set(stor, function(){ window.close(); });
			});
		}
	},
	'Sort' : function($that) {
		var s = $that.attr('data-by');

		$('.task').remove();
		$('.detail').remove();

		showLists(s);
	},
	'Save' : function($that) {
		//存储任务队列
		chrome.storage.local.get('DSGXFB', function(data){
			var key = $that.attr('data-key');
			var dsgxfb = data.DSGXFB;

			if (key >= 0) {
				dsgxfb[key].uri = $('#Task_uri').val();
				dsgxfb[key].title = $('#Task_title').val();
				dsgxfb[key].code = $('#Task_code').val();
				dsgxfb[key].time = $('#Task_time').val();
				dsgxfb[key].release = $('#Task_release').is(':checked');

				var stor = {};
				stor['DSGXFB'] = dsgxfb;
				chrome.storage.local.set(stor, function(){ 
					$('#SaveSuccess').show();
					setTimeout(function(){
						$('#SaveSuccess').fadeOut();
					}, 1000);
				});
			}
		});
	},
	'Add' : function($that) {
		if ($('.detail').length <= 0) {
			var req = {};

			req.Action = 'getValue';
			chrome.runtime.sendMessage(req, function(result){
				var title = result['Tasks_title'] || '';
				var code  = result['Tasks_code'] || '';
				var uri   = result['Tasks_uri'] || '';
				var time  = result['Tasks_time'] || '';

				$that.after(`
					<div class="detail">
						<div>
							<a>
								<span style="font-weight:bold;line-height:40px;width:100px;">批量设置定时任务</span>
							</a><br>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">代码的备注名:</label>
							<input id="Tasks_title" value="`+title+`" data-action="cache" style="width:260px;" placeholder="1920横条0点更新">
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">代码链接地址:</label>
							<input id="Tasks_code" value="`+code+`" data-action="cache" style="width:260px;" placeholder="http://junezx.com/2.0/previewP.php?ID=1103212">
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">放代码的位置:</label>
							<select id="Select_Cate" style="width:264px;height:21px;">
								<option>请选择</option>
							</select>						
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">放代码的时间:</label>
							<input id="Tasks_time" value="`+time+`" data-action="cache" placeholder="2016-06-15 01:23:46" style="width:260px;" >
						</div>
						<div>
							<label style="font-weight:bold; display:inline-block; width:100px; float:left;">放代码后发布：</label>
							<input id="Tasks_release" data-action="cache" type="checkbox">
							<button data-action="AddTasks" style="float:right;margin-right:12px;">确定</button>
						</div>
						<div id="SaveSuccess" style="display:none;">
							<span style="font-style:italic;color:red;font-weight:bold;">添加成功</span>
						</div>
					</div>
				`);

				ShowCategory();
			});
		} else {
			$('.detail').remove();
		}
	},
	'AddTasks' : function($that) {
		var Tasks_title = $('#Tasks_title').val();
		var Tasks_code  = $('#Tasks_code').val();
		var Tasks_uri   = $('#Select_Cate option:selected').val();
		var Tasks_time  = $('#Tasks_time').val();
		var Tasks_release = $('#Tasks_release').is(':checked');

		if(!DATE_FORMAT.test(Tasks_time)) { alert('时间格式有误'); return 0; }
		try{
			var obj = JSON.parse(Tasks_uri);
		}catch(e){
			alert('请选择放代码的位置');
			return 0;
		}

		//存储任务队列
		chrome.storage.local.get('DSGXFB', function(data){
			var dsgxfb = data.DSGXFB;
			var key;
			var timestamp = Date.parse(new Date(Tasks_time));
			var newDate = new Date();

			for ( key in obj ) {
				var Task = {};

				Task.uri = key;
				Task.title = Tasks_title;
				Task.code = Tasks_code;
				Task.release = false;
				Task.isExec = true;
				Task.moduleType = '自定义内容区';

				newDate.setTime(timestamp);
				Task.time = newDate.Format('yyyy-MM-dd hh:mm:ss');
				timestamp = timestamp + 1000;

				dsgxfb.push(Task);
			}

			if(Tasks_release){ dsgxfb[dsgxfb.length-1].release = true; }

			var stor = {};
			stor['DSGXFB'] = dsgxfb;
			chrome.storage.local.set(stor, function(){ window.close(); });
		});
	}
};

$body.on('click', '[data-action]', function(){
	var actionName = $(this).data('action');
	var action     = ActionLists[actionName];
	if ($.isFunction(action)) { action($(this)); }
});

$body.on('blur', '[data-action="cache"]', function(){
	//console.log('blur.');
	var req = {};

	req.Action = 'setValue';
	req.Key = $(this).attr('id');
	req.Value = $(this).val();
	chrome.runtime.sendMessage(req, function(result){});
});

//by函数接受一个成员名字符串和一个可选的次要比较函数做为参数
//并返回一个可以用来包含该成员的对象数组进行排序的比较函数
//当o[age] 和 p[age] 相等时，次要比较函数被用来决出高下
//http://www.ghugo.com/javascript-sort-array-objects/
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

//删除数组中指定下标的元素
Array.prototype.del=function(index){
	if(isNaN(index)||index>=this.length){
		return false;
	}
	for(var i=0,n=0;i<this.length;i++){
		if(this[i]!=this[index]){
			this[n++]=this[i];
		}
	}
	this.length-=1;
};

Date.prototype.Format = function (fmt) { 
	/* 对Date的扩展，将 Date 转化为指定格式的String
	 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	 * 例子： 
	 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
	 * author: meizz 
	 * 调用： 
	 * var time1 = new Date().Format("yyyy-MM-dd");
	 * var time2 = new Date().Format("yyyy-MM-dd HH:mm:ss");  
	 */
	 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};