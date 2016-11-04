'use strict';

var $body = $(document.body);
var extension_url = chrome.extension.getURL('');

(function(){
	chrome.storage.local.get(function(data){
		var xsmkid = data.XSMKID;

		console.log('显示模块ID的存储值为：', xsmkid);
		$('#XSMKID').find('input').attr('checked', xsmkid);
	});	
})();

var ClickActions = {
	'ShowID' : function ($that) {
		chrome.storage.local.get('XSMKID', function(data){
			var xsmkid = !data.XSMKID;

			if (data.XSMKID) {
				chrome.tabs.executeScript({
					code:`
						$('.junemoduledisplayid').remove();
						$('#J_PageToDesign').contents().find('.junemoduledisplayid').remove();
						`
				});
			} else {
				chrome.tabs.executeScript({
					code:`
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
						 `
				});
			}
			chrome.storage.local.set({'XSMKID':xsmkid});
			window.close();
		});
	},
	'SortItems' : function($that) {
		var cls = $('#KMKPX').find('input').val();
		var js;

		js = `
			var $items = $('`+cls+`');
			$('#CopyToClipJS').remove();
			
			if ($('.MoveLeft').length<1) {
				$items.each(function(i, e){
					$(this).append('<a class="MoveLeft abs" data-num='+i+' style="position:absolute;top:45%;z-index:999;background:url(//img.alicdn.com/imgextra/i3/127871098/TB2NXVAnVXXXXbdXXXXXXXXXXXX_!!127871098.png) #FFFFFF;display:block;width:32px;height:45px;"></a><a class="MoveRight abs" data-num='+i+' style="position:absolute;top:45%;right:0;z-index:999;background:url(//img.alicdn.com/imgextra/i3/127871098/TB2LuQUnFXXXXazXFXXXXXXXXXX_!!127871098.png) #FFFFFF;display:block;width:32px;height:45px;"></a>');
				});

			} else {
				$('.MoveLeft').remove();
				$('.MoveRight').remove();
			}

			$('.J_TModule').each(function(i, e){
				var widgetId = $(this).attr('data-widgetid');
				if( $(this).height() > 10){
					$(this).before('<button class="CopyToClip" data-id="'+widgetId+'" style="position:absolute;padding:5px;z-index:99999;left:270px;cursor:pointer;">复制模块代码</button>');
					$(this).before('<button class="SaveThisModule" data-id="'+widgetId+'" style="position:absolute;padding:5px;z-index:99999;left:370px;cursor:pointer;">保存模块代码</button>');
				}
			});
		`;
		chrome.tabs.executeScript({code:js});

		js = `
			var $body = $(document.body);
			$body.append('<script id="CopyToClipJS" src="`+extension_url+`js/KMKPX/CopyToClip.js"></script>');
		`;
		chrome.tabs.executeScript({code:js});

		var req = {};
		req.Action = 'setValue';
		req.Key = 'SortItems';
		req.Value = cls;
		chrome.runtime.sendMessage(req, function(result){});

		window.close();
	},
	'InsertJS' : function($that){
		var jsURL = $('#INSERTJQ input').val();
		var js = `
			$body.append('<script src="`+jsURL+`"></script>');
		`;
		chrome.tabs.executeScript({code:js});

		window.close();
	}
};

$body.on('click', '[data-action]', function(){
	var actionName = $(this).attr('data-action');
	var action = ClickActions[actionName];

	if ($.isFunction(action)) { action($(this)); }
});

(function(){
	var req = {};

	req.Action = 'getValue';
	chrome.runtime.sendMessage(req, function(result){
		var v = result['SortItems'] || '.itemarea.abs.jspb.hborder.jzi';
		$('#KMKPX').find('input').val(v);
	});
})();
