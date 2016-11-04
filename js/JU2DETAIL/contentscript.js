'use strict';

(function(){
	var css, 
		tag,
		extension_url = chrome.extension.getURL('');

	css = 'background:url('+extension_url+'img/ju.png);float:left;display:block;width:24px;height:24px;cursor:pointer;margin:5px;';
	tag = '<a id="JU" style="'+css+'"></a>';
	$body.on('mouseover', 'bar', function(){
		if ($('#JU').length<=0) {
			$(this).children('baracts').append(tag);
		}
	});

	$body.on('click', '#JU', function(){
		if (confirm('确认要修改为聚划算链接？')) {
			var module_top = $(this).parent().parent().css('top');
			var module_width = $(this).parent().parent().css('width');
			var uri = getModuleUri(module_width, module_top);

			getModuleForm(uri, function($f){
				$body.append('<div id="temp" style="display:none;"></div>');

				$('#temp').html($f.find('textarea').val());

				var n = 0, sum = 0;
				$('#temp').find('a').each(function(i,e){
					var url = $(this).attr('href')

					if ( url && (url.indexOf('detail.tmall.com')>-1 || url.indexOf('item.taobao.com')>-1) && url.indexOf('id=')>-1 ) {
						var id = $.getUrlParam('id', url);
						var $that = $(this);
						var req = {};
						req.Action = 'isJuLink';
						req.url = '//detail.ju.taobao.com/home.htm?item_id=' + id;

						chrome.runtime.sendMessage(req, function(result){
							if (result) {
								$that.attr('href', '//detail.ju.taobao.com/home.htm?item_id=' + id);
							}
							n += 1;

							check(sum, n, $f);
						});

						sum += 1;
					}
				});
			});
		}
	});

	function check(sum, n, $f){
		if (sum==n) {
			$f.find('textarea').val($('#temp').html());
			
			moduleSave($f.serialize(), function(r){
				alert(r.message);
				$('#temp').remove();
				$('#ModuleForm').remove();
			});
		}
	}

})();

(function(){
	var css, 
		tag,
		extension_url = chrome.extension.getURL('');

	css = 'background:url('+extension_url+'img/detail.png);float:left;display:block;width:24px;height:24px;cursor:pointer;margin:5px;';
	tag = '<a id="DETAIL" style="'+css+'"></a>';
	$body.on('mouseover', 'bar', function(){
		if ($('#DETAIL').length<=0) {
			$(this).children('baracts').append(tag);
		}
	});

	$body.on('click', '#DETAIL', function(){
		if (confirm('确认要修改为店铺详情页链接？')) {
			var module_top = $(this).parent().parent().css('top');
			var module_width = $(this).parent().parent().css('width');
			var uri = getModuleUri(module_width, module_top);

			getModuleForm(uri, function($f){
				$body.append('<div id="temp" style="display:none;"></div>');

				$('#temp').html($f.find('textarea').val());

				var n = 0, sum = 0;
				$('#temp').find('a').each(function(i,e){
					var url = $(this).attr('href');

					if ( url && url.indexOf('detail.ju.taobao.com')>-1 && url.indexOf('item_id=')>-1 ) {
						var id = $.getUrlParam('item_id', url);
						var $that = $(this);
						$that.attr('href', '//detail.tmall.com/item.htm?id=' + id);
					}
				});

				$f.find('textarea').val($('#temp').html());
				
				moduleSave($f.serialize(), function(r){
					alert(r.message);
					$('#temp').remove();
					$('#ModuleForm').remove();
				});
			});
		}
	});
})();
