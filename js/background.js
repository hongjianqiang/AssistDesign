'use strict';

var $head = $(document.head);
var $body = $(document.body);

/*
 * 当页面加载完成时：
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if (changeInfo.status === 'complete') {
		if (tab.url.indexOf('//siteadmin.tmall.com/') > -1 || tab.url.indexOf('//siteadmin.taobao.com/') > -1) {
			chrome.pageAction.show(tabId);	// 在地址栏显示插件logo出来;
			chrome.tabs.executeScript(tabId, {file: "js/DSGXFB/contentscript.js"});	// 定时更新发布 的contentscript.js
			chrome.tabs.executeScript(tabId, {file: "js/MKDMTB/contentscript.js"});	// 模块代码同步 的contentscript.js
			chrome.tabs.executeScript(tabId, {file: "js/JU2DETAIL/contentscript.js"});	// 模块代码同步 的contentscript.js

		}
		if (tab.url.indexOf('//tb.maijsoft.com/index.php') > -1 || tab.url.indexOf('tmall.com') > -1) {
			chrome.pageAction.show(tabId);

		}
		if (tab.url.indexOf('//siteadmin.tmall.com/preview.htm') > -1 || tab.url.indexOf('//siteadmin.taobao.com/preview.htm') > -1) {
			var js;
			chrome.pageAction.show(tabId);

			js = `
				var $body = $(document.body);
				$body.append('<script src="//cdn.bootcss.com/jquery/1.12.1/jquery.min.js"></script>');
				$body.append('<script src="//cdn.bootcss.com/zeroclipboard/2.2.0/ZeroClipboard.min.js"></script>');
			`;
			chrome.tabs.executeScript({code:js});

			chrome.tabs.executeScript(tabId, {file: "js/KMKPX/contentscript.js"});	// 跨模块产品排序 的contentscript.js

		}
		if (tab.url.indexOf('http://junezx.com/3.0/#TableHandle') > -1) {
			chrome.tabs.executeScript(tabId, {file: "js/jquery.js"});
			chrome.tabs.executeScript(tabId, {file: "js/TABLEH/contentscript.js"});	// Table切片代码处理 的contentscript.js
		}
	}
});


var QueueSync = [];
var cache = {};
var random = 0;
chrome.runtime.onMessage.addListener(function(req, sender, resp){
	var ActionLists = {
		'SetRandomNum' : function(req){
			random = req.random;
			resp(random);
		},
		'GetRandomNum' : function(req){
			resp(random);
		},
		'GetCodeFromJunezx' : function(req){
			if (req.url) {
				/*
				 * 从六月工具生成的分享链中取得代码
				 * 注意 async必须为false，就是要同步，否则contentscript是接收不到返回的代码的
				 */
				var id = req.url.split('=')[1];
				$.ajax({
					async: false,
					type: 'POST',
					dataType: 'json',
					url: 'http://junezx.com/3.0/useCode.php',
					data: {
						type: 'genList',
						ID: id
					},
					success: function(data){
						var Code = '';
						var left = '';

						left = parseInt($(data[0]).css('width').replace('px', '')) / 2;
						left = 'left:-' + left + 'px;';

						Code = data[0].replace(/margin-left:(.*?);/g, "");
						Code = Code.replace('junezxleftisme;', left+'margin-left:50%;');
						Code = Code.replace(/&amp;nbsp;/g, '&nbsp;');

						resp(Code);
					},
					error: function(data){
						console.log(data);
					}
				});

			} else {
				resp('');
			}
		},
		'setValue' : function(req){
			cache[req.Key] = req.Value;
			resp(cache);
		},
		'getValue' : function(req){
			resp(cache);
		},
		'AppendToQueueSync' : function(req){
			var len = Array.prototype.push.apply(QueueSync, req.QueueSync);
			resp(len);
		},
		'ShiftQueueSync' : function(req){
			var r = {};
			r.serial = QueueSync.shift();
			r.len    = QueueSync.length;
			resp(r);
		},
		'isJuLink' : function(req){
			resp(true);
			/*
			if (req.url) {
				$.ajax({
					async: false,
					type: "GET",
					dataType: "html",
					url: "https:" + req.url,
					data: '',
					success: function(data) {
						if ( data.indexOf('已结束...') > -1 ) {
							resp(false);
						} else if ( data.indexOf('马上抢') > -1 ) {
							resp(true);
						}
					},
					error: function(data) {
						console.log(req.url, data);
					}
				});

			}else{
				resp(false);
			}
			*/
		}
	};

	var ActionName = req.Action;
	var Do = ActionLists[ActionName];
	if ($.isFunction(Do)) { Do(req); }
});
