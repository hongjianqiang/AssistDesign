'use strict';

var $doc = $(document);
var $body= $(document.body);

var ActionLists = {
	'TableHandle': function($that){
		var text = $('#TableHandle').val();
		var table, out;
		var $table = $('<div>'+text+'</div>').find('table');

		var imgsText = $('#Images').val();
		var $Images = $('<div>'+imgsText+'</div>').find('img');

		$table.find('img').each(function(i, e){
			/*
			 * 把含有分隔符的 <tr> 去掉
			 */
			var imgSrc = $(this).attr('src');

			if (imgSrc.indexOf('分隔符.gif') > 0) {
				$(this).parent().parent().remove();
				// console.log(i);
				return false;
			}
		});

		$Images.each(function(i, e){
			/*
			 * 把 #Images 里的图片路径填充进去 <table> 代码里
			 */
			var imgSrc = $(this).attr('src');

			$table.find('img').eq(i).attr('src', imgSrc);
		});
		$('#Images').val('');

		$table.find('td').removeAttr('colspan');
		$table.find('img').removeAttr('width');
		$table.find('img').removeAttr('height');

		table = $table.html();
		if (table && $table.find('table').length<=0) {
			out = table.replace(/<tr>/g, '<tr><td><table width="0" border="0" cellspacing="0" cellpadding="0"><tr>');
			out = out.replace(/<\/tr>/g, '<\/tr><\/table><\/td><\/tr>');

			out = out.replace(/<tbody>/g, '<table width="0" border="0" cellspacing="0" cellpadding="0">');
			out = out.replace(/<\/tbody>/g, '<\/table>');

			$('#TableHandle').val(out);
			$that.hide();
			$('[data-action="WindowOpen"]').show();
		}
	},
	'beautify': function($that){
		var source_text = $('#TableHandle').val();
		var output = html_beautify(source_text);

		$('#TableHandle').val(output);
	},
	'WindowOpen': function($that){
		var url = $that.attr('href');
		window.open(url, "_blank");

		var req = {};
		req.Action = 'setValue';
		req.Key = '#TableHandle';
		req.Value = $('#TableHandle').val();
		chrome.runtime.sendMessage(req, function(result){});
	} 
};

$body.on('click', '[data-action]', function(){
	var actionName = $(this).data('action');
	var action     = ActionLists[actionName];
	if ($.isFunction(action)) { action($(this)); }
});
