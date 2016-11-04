'use strict';

var here = window.location.href;
var Serials = {};
var Iframes = [];
var host = 'upload.tmall.com';

if (here.indexOf('//upload.tmall.com/auction/publish/edit.htm') > -1) {
	$(window).load(function(){
		postMessage(1);
	});

	function postMessage(arg) {
		var serial = $('#J_MainForm').serialize();

		$.ajax({
			type: 'POST',
			url: 'https://upload.tmall.com/auction/publish/upload_item.htm?_input_charset=utf-8',
			data: serial,
			success: function(result) {
				var r = JSON.parse(result);
				if (r.success) {
					top.postMessage(serial, 'http://tb.maijsoft.com/');
				} else {
					setTimeout(_postMessage(1), 3*1000);
				}
			},
			error: function(result) {
				console.log("Error:" + result);
			}
		});	
	}
	function _postMessage(arg) {
		return function (){
			postMessage(arg);
		}
	}
	
}

if (here.indexOf('//tb.maijsoft.com/') > -1) {
	function receiveMessage(e) {
		/*
		 * 获取从postMessage得到的form的serialize
		 */
		var serial = e.data;
		var itemId = $.getUrlParam('itemId', serial);
		var $that_tr = $('#J_'+itemId+'ItemDetail');

		Serials[itemId] = serial;
		$('#'+itemId).remove();

		$that_tr.find('td').eq(2).append(`
			<div style="position:relative;padding:2px;width:91px;height:60px;float:left;margin:2px;">
				<button class="s-btn J_batchSave SaveItem" data-itemId="`+itemId+`" type="button" style="position:absolute;right:5px;bottom:5px;">保存修改</button>
			</div>
		`);

		if(Iframes.length) { 
			$body.append(Iframes.shift());
		}
	}
	window.addEventListener("message", receiveMessage, false);

	function ready(arg){
		// 页面加载完所有数据，执行 Go() 主函数
		var len = $('#J_itemListPageNavTop').find('li').length;
		if (len) {
			Go();
		} else {
			setTimeout(_ready(1), 2*1000);
		}
	}
	function _ready(arg){
		return function(){
			ready(arg);
		}
	}

	function Go(){
		//alert('页面数据加载完毕');
		ReLayout();

	}

	function ReLayout(){
		// 对页面进行重新布局
		$('#J_itemList').find('.J_batchUndo').remove();
		$('.operations').find('button').replaceWith('<button type="button" class="s-btn SaveAllItem">保存修改</button>');

		var $tr = $('#J_itemList').find('tr');
		$tr.each(function(i, e){
			var $this_tr = $(this);
			if ( i != 0 && i != $tr.length-1 ) {
				$(this).find('td').eq(2).find('input').remove();
				$(this).find('td').eq(2).find('div').remove();
				var title = $(this).find('td').find('p').text();
				var item_num_id = $(this).attr('id').replace(/J_/g,'').replace(/ItemDetail/g,'');
				var uri = 'https://upload.tmall.com/auction/publish/edit.htm?item_num_id='+item_num_id+'&auto=false';
				$(this).find('td').find('p').replaceWith('<p><a href="'+uri+'" target="_blank" style="font-family:tahoma,arial,微软雅黑,sans-serif;margin:0 0 3px 0;">'+title+'</a></p>');

				$.get(uri, function(data){
					var $desc_module = $('<div>'+data+'</div>').find('#newTabContent');
					var $desc_module_content = $desc_module.find('textarea');

					$desc_module_content.each(function(i,e){
						var module = $(this).attr('name');
						var content = $(this).val();
						var desc_module_name    = module.replace('desc_module_content_','desc_module_name_');
						var name = $desc_module.find('[name="'+desc_module_name+'"]').attr('value');

						$this_tr.find('td').eq(2).append(`
							<div style="position:relative;padding:2px;width:91px;height:60px;float:left;margin:2px;background:#FFD7AA;">
								<span>`+name+`</span>
								<textarea title="`+name+`" class="field-input desc_module_content" data-action="Selected" data-module="`+module+`" style="left: 2px; top: 20px; position: absolute; width: 85px; height: 32px; border: 1px solid #a7a6aa; overflow: hidden; z-index:99;">`+content+`</textarea>
							</div>
						`);
					});					
				});

				//$body.append('<iframe id="'+item_num_id+'" src="'+uri+'" style="display:none;"></iframe>');
				Iframes.push('<iframe id="'+item_num_id+'" src="'+uri+'" style="display:none;"></iframe>');
			}
		});

		$body.append(Iframes.shift());
		$body.append(Iframes.shift());
		$body.append(Iframes.shift());

	}

	if (!$('#PLXGMS').length) {
		// 在左侧栏添加一个 li
		var $height = $('#J_titleSideMenu').height();
		$('#J_titleSideMenu').css('height', ($height+28)+'px');

		var $ul = $('#J_titleSideMenu').find('ul').eq(0);
		var style = '';
		if ('#detail' == window.location.hash) {
			style = 'class="selected"';
			$ul.find('li').removeClass('selected');
		} else {
			style = '';
		}

		$ul.append(`<li `+style+` id='PLXGMS'><a href="/index.php?r=point/list#detail">批量修改宝贝描述</a></li>`);
	}

	if (here.indexOf('r=point/list#detail') > -1) {
		// 初始化
		$('.tabs').find('a').eq(0).attr('href', '/index.php?r=point/list#detail');
		$("#J_itemListPageSize").append('<option value="10">10条</option>');
		$("#J_itemListPageSize").find("option[value='10']").attr("selected",true);

		$body.on('click', '#J_itemListReload', function(){
			// 搜索 按钮的点击事件
			setTimeout(_ready(1), 2*1000);
		});
		$body.on('click', '.J_itemListPageNav li', function(){
			// 导航 按钮的点击事件
			setTimeout(_ready(1), 2*1000);
		});
		$body.on('click', '.desc_module_content', function(){
			// textarea 的选定事件
			var $textarea = $('textarea');
			$textarea.css('background', '#FFFFFF');
			$textarea.css('z-index', '99');

			var title = $(this).attr('title');
			var f = '[title="'+title+'"]';
			
			$(f).css('background', '#AAD7FF');
			$(this).css('z-index', '999');
		});
		$body.on('click', '.SaveItem', function(){
			// 保存修改 按钮的点击事件
			var $this_btn = $(this);
			var itemId = $this_btn.attr('data-itemId');
			var $textarea = $('#J_'+itemId+'ItemDetail').find('textarea');
			var serial = Serials[itemId];

			$textarea.each(function(index, element){
				var desc_module_content = $(this).attr('data-module');
				var content = encodeURIComponent( $(this).val() ).replace(/\%20/g, '+');
					content = content.replace(/%26/g, '%26amp%3B');
					content = content.replace(/%C2%A0/g, '%26nbsp%3B');

				serial = $.setUrlParam(desc_module_content, content, serial);
			});

			$.ajax({
				type: 'POST',
				url: 'https://upload.tmall.com/auction/publish/upload_item.htm?_input_charset=utf-8',
				data: serial,
				success: function(result) {
					//console.log(result);
					var r = JSON.parse(result);
					$this_btn.parent().find('.Result').remove();
					if (r.success) {
						$this_btn.before(`<label class="Result" style="position:absolute;right:5px;top:15px;color:green;">修改成功</label>`);
					} else {
						$this_btn.before(`<label class="Result" style="position:absolute;right:5px;top:15px;color:green;">修改失败</label>`);
					}					

				},
				error: function(result) {
					console.log("Error:" + result);
				}
			});	
	
		});
		$body.on('click', '.SaveAllItem', function(){
			// 导航 按钮的点击事件
			$('.selector').each(function(i,e){ 
				if( $(this).is(':checked') ){
					var itemId = $(this).val();
					//console.log(itemId);
					$('#J_'+itemId+'ItemDetail').find('.SaveItem').trigger('click');
				}
			});
		});

		//ready(1);
	}
}
