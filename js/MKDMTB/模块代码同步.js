'use strict';

var $doc  = $(document);
var $body = $(document.body);

chrome.storage.local.get('MODULESYNC', function(data){
	var ModuleSync = data.MODULESYNC;

	for (var cate in ModuleSync) {
		$('#add').before(`
			<li class="SyncCate" data-action="ShowDetailSet" data-cate="`+cate+`">
				<a>`+cate+` <i data-action="Delete">删除</i> </a>
			</li>			
		`);
	}
});

$body.on('click', '[data-action="ShowDetailSet"]', function(){
	var $that = $(this);
	$('li').removeAttr('style');
	$('li').children('a').removeAttr('style');
	$('.detail').remove();

	$that.css({'background-image':'url(../img/sync-white.png)', 'background-color':'#18C3D1'});
	$that.children('a').css({'color':'#FFFFFF'});
	var cate = $(this).attr('data-cate');

	chrome.storage.local.get('MODULESYNC', function(data){
		var ModuleSync = data.MODULESYNC;
		var json = JSON.stringify(ModuleSync[cate]);

		$that.after(`
			<div class="detail">
				<div>
					<p></p>
					<label class="inputtitle" style="font-weight:bold; display:inline-block; width:100px; float:left;">分类名称:</label>
					<input id="Category" value="`+cate+`" data-cate="`+cate+`" style="width:262px;">
				</div>
				<div>
					<label class="inputtitle" style="font-weight:bold; display:inline-block; width:100px; float:left;">分类模块：</label>
					<textarea id="Modules" data-cate="`+cate+`" style="width:260px;height:50px;">`+json+`</textarea>
				</div>
				<div>
					<button data-action="save" data-cate="`+cate+`" style="margin-right:10px;float:right;">保存设置</button>
					<div style="clear:both;"></div>
				</div>
				<div id="SaveSuccess" style="display:none;">
					<span style="font-style:italic;color:red;font-weight:bold;">保存成功</span>
				</div>
			</div>
		`);
	});
});

$body.on('click', '[data-action="Add"]', function(){
	$('#add').before(`
		<li class="SyncCate" data-action="ShowDetailSet" data-cate="">
			<a> <i data-action="Delete">删除</i> </a>
		</li>			
	`);
});

$body.on('click', '[data-action="Delete"]', function(){
	if (confirm('删除分类前建议先备份，确认要删除？')) {
		var cate = $(this).parent().parent().attr('data-cate');

		chrome.storage.local.get('MODULESYNC', function(data){
			var ModuleSync = data.MODULESYNC;

			delete ModuleSync[cate];

			var stor = {};
			stor['MODULESYNC'] = ModuleSync;
			chrome.storage.local.set(stor, function(){ window.close(); });
		});
	}
});

$body.on('click', '[data-action="save"]', function(){
	var old_cate = $('#Category').attr('data-cate');
	var cate = $('#Category').val();
	var json = $('#Modules').val();

	chrome.storage.local.get('MODULESYNC', function(data){
		var ModuleSync = data.MODULESYNC;

		delete ModuleSync[old_cate];
		try{
			var obj = JSON.parse(json);
			ModuleSync[cate] = obj;

			var stor = {};
			stor['MODULESYNC'] = ModuleSync;
			chrome.storage.local.set(stor, function(){
				$('#SaveSuccess').show();
				setTimeout(function(){
					$('#SaveSuccess').fadeOut();
				}, 1000);
			});
		}catch(e){
			alert('分类模块设置格式不正确，需为标准的JSON格式。');
		}
	});	
});

