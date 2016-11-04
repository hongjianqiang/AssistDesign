'use strict';

var $body = $(document.body);
var clip = new ZeroClipboard($('.CopyToClip'));

clip.on('ready', function() {
	console.log('Flash movie loaded and ready.');

	this.on('aftercopy', function(event){
		console.log('Copied text to clipboard: ' + event.data['text/plain']);
		alert('Copied text to clipboard success.');
	});
});

clip.on('error', function(event) {
	// $('.demo-area').hide();
	console.log('error[name="' + event.name + '"]: ' + event.message);
	ZeroClipboard.destroy();
});

clip.on('copy', function(event){
	var id = $(event.target).attr('data-id');

	$('.MoveLeft').remove();
	$('.MoveRight').remove();
				
	var html = $('[data-widgetid="'+id+'"]').find('span').html();
	html = html.replace(/&quot;/g,"'");
	html = html.replace(/data-widget-init=\"1\"/g,"");
	
	clip.setText(html);
});