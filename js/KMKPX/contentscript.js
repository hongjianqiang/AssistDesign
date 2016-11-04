'use strict';

$body.on('click', '.MoveLeft', function(){
	var item = {};
	var i = parseInt($(this).attr('data-num'));

	if (i>0) {
		$items.eq(i).find('.MoveLeft').attr('data-num', i-1);
		$items.eq(i).find('.MoveRight').attr('data-num', i-1);

		$items.eq(i-1).find('.MoveLeft').attr('data-num', i);
		$items.eq(i-1).find('.MoveRight').attr('data-num', i);	

		item.html = $items.eq(i).html();
		$items.eq(i).html( $items.eq(i-1).html() );
		$items.eq(i-1).html( item.html );

		item.bg = $items.eq(i).css('background');
		$items.eq(i).css('background', $items.eq(i-1).css('background'));
		$items.eq(i-1).css('background', item.bg);
	}
});

$body.on('click', '.MoveRight', function(){
	var item = {};
	var i = parseInt($(this).attr('data-num'));

	if (i<$items.length-1) {
		$items.eq(i).find('.MoveLeft').attr('data-num', i+1);
		$items.eq(i).find('.MoveRight').attr('data-num', i+1);

		$items.eq(i+1).find('.MoveLeft').attr('data-num', i);
		$items.eq(i+1).find('.MoveRight').attr('data-num', i);	

		item.html = $items.eq(i).html();
		$items.eq(i).html( $items.eq(i+1).html() );
		$items.eq(i+1).html( item.html );

		item.bg = $items.eq(i).css('background');
		$items.eq(i).css('background', $items.eq(i+1).css('background'));
		$items.eq(i+1).css('background', item.bg);					
	}
});

$body.on('click', '.SaveThisModule', function(e){
	var widgetId = $(e.target).attr('data-id');
	var pageId = $.getUrlParam('pageId', window.location.href);
	var sid = $.getUrlParam('sid', window.location.href);
	var tbToken = $('[name="tb_token"]').val();

	$('.MoveLeft').remove();
	$('.MoveRight').remove();

	var html = $('[data-widgetid="'+widgetId+'"]').find('span').html();
	// html = html.replace(/&quot;/g,"'");
	html = html.replace(/data-widget-init=\"1\"/g,"");

	var form = `
		<form action="/module/moduleSave.htm?_input_charset=utf-8" name="editform" accept-charset="utf-8">
			<input name="enc" value="™">
			<input name="isDefault" value="false">
			<input name="showTitle" value="false" checked="checked">
			<input name="showTitle" value="true">
			<input name="title" value="自定义内容区">
			<textarea name="content">` + html + `</textarea>
			<input name="widgetId" value="` + widgetId + `">
			<input name="sid" value="` + sid + `">
			<input name="pageId" value="` + pageId + `">
			<input name="_tb_token_" value="` + tbToken + `">
		</form>
	`;

	var serial = $(form).serialize();

	moduleSave(serial, function(r){
		alert(r.message);
	});
});
