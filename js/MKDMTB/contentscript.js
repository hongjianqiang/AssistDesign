'use strict';

(function(){
	chrome.storage.local.get(function(data){
		if ( data.hasOwnProperty('MODULESYNC') ) {
			var ModuleSync = data.MODULESYNC;
			console.log('模块代码同步的存储值为：', ModuleSync);

		} else {
			chrome.storage.local.set( {'MODULESYNC':{}} );
			console.log('新建模块代码同步的存储键值MODULESYNC');

		}
	});
	setTimeout(GoSync, 6*1000);

	//chrome.storage.local.clear();
	//chrome.storage.local.remove('QUEUESYNC');

	var css,
		tag,
		extension_url = chrome.extension.getURL('');

	css = 'background:url('+extension_url+'img/sync.png);float:left;display:block;width:24px;height:24px;cursor:pointer;margin:5px;';
	tag = '<a id="ModuleSync" style="'+css+'"></a>';
	$body.on('mouseover', 'bar', function(){
		if ($('#ModuleSync').length<=0) {
			$(this).children('baracts').append(tag);
		}
	});

	function setDialogParam(uri){
		$('#Module_uri').val(uri);

		if(!uri) { return 0; }

		// 读取模块分类
		chrome.storage.local.get('MODULESYNC', function(data){
			var ModuleSync = data.MODULESYNC;
			
			$('.category').remove();

			for(var k in ModuleSync){
				$("#SetModuleSync select").append('<option class="category" value="'+k+'">'+k+'</option>');

				for(var v in ModuleSync[k] ){
					if ( v == uri) {
						var f = '[value="'+k+'"]';
						$("#SetModuleSync select").find(f).attr('selected', 'selected');
					}
				}

			}
		});
	}

	function storCate(uri, select, createCate, callback){
		//存储最新的分类
		var r = {};
		select = createCate || select;
		chrome.storage.local.get('MODULESYNC', function(data){
			var ModuleSync = data.MODULESYNC;

			if ( !ModuleSync.hasOwnProperty(select) ) {
				ModuleSync[select] = {};
			}

			if(uri){
				ModuleSync[select][uri] = ''; // 把uri值当键，是利用json做去重，减少代码复杂度

				var stor = {};
				stor['MODULESYNC'] = ModuleSync;
				chrome.storage.local.set(stor, function(){ 
					//showTips('模块分类成功'); 
					r.newCate = select;
					r.message = '模块分类成功';
					r.isSuccess = true;
					$('#SetModuleSync').remove();

					if(typeof callback == "function") { callback(r); }
				});
			}
		});
	}

	function removeCate(uri, callback){
		// 将某个模块移出分类
		chrome.storage.local.get('MODULESYNC', function(data){
			var ModuleSync = data.MODULESYNC;
			var r = {};
			r.isDel = false;

			for(var k in ModuleSync){
				var i = 0;
				for(var v in ModuleSync[k]){
					if ( v == uri) {
						r.isDel = true;
						delete ModuleSync[k][v];
					} else {
						i++;
					}
				}

				if (!i) { delete ModuleSync[k]; }
			}

			var stor = {};
			stor['MODULESYNC'] = ModuleSync;
			chrome.storage.local.set(stor, function(){
				r.message = '移出分类成功';
				r.isSuccess = true;
				$('#SetModuleSync').remove();

				if(typeof callback == "function") { callback(r); }
			});				
		});	
	}

	function ReadySync(uri, Cate, syncRelease){
		getModuleSerial(uri, function(s){
			chrome.storage.local.get('MODULESYNC', function(data){
				var ModuleSync = data.MODULESYNC;
				var QueueSync  = [];
				var widgetId, sid, pageId, serial;

				for(var v in ModuleSync[Cate]){
					widgetId = $.getUrlParam('widgetId', v);
					sid = $.getUrlParam('sid', v);
					pageId = $.getUrlParam('pageId', v);

					serial = $.setUrlParam('widgetId', widgetId, s);
					serial = $.setUrlParam('sid', sid, serial);
					serial = $.setUrlParam('pageId', pageId, serial);

					QueueSync.push(serial);
				}

				if(syncRelease){
					QueueSync.push(syncRelease);
				}

				var req = {};
				req.Action = 'AppendToQueueSync';
				req.QueueSync = QueueSync;
				chrome.runtime.sendMessage(req, function(result){});

				showTips('我要开始帮你同步模块了');
				setTimeout(GoSync, 6*1000);
			});
		});
	}

	function GoSync(){
		var req = {};
		req.Action = 'ShiftQueueSync';
		chrome.runtime.sendMessage(req, function(result){
			if( typeof(result) == 'undefined' ){ return 0; }

			var type = typeof(result.serial);
			
			if (type == 'boolean') {
				submitRelease(function(r){
					if (r.isSuccess) {
						showTips(r.message+' 剩下'+result.len+'个', 'tip-success'); 

					} else {
						var req = {};
						req.Action = 'AppendToQueueSync';
						req.QueueSync = [true];
						chrome.runtime.sendMessage(req, function(result){});
						showTips(r.message, 'tip-error');
					}

					setTimeout(GoSync, 6*1000);
				});
			}

			if (type == 'string') {
				moduleSave(result.serial, function(r){
					var errCode = r.errorCode;
					if(errCode > 2){
						var req = {};
						req.Action = 'AppendToQueueSync';
						req.QueueSync = [result.serial];
						chrome.runtime.sendMessage(req, function(result){});
					}

					if (r.isSuccess) { 
						showTips(r.message+' 剩下'+result.len+'个', 'tip-success'); 
					} else {
						showTips(r.message, 'tip-error');
					}

					setTimeout(GoSync, 6*1000);
				});
			}
		});
	}


	$body.on('click', '#ModuleSync', function(){
		var module_top = $(this).parent().parent().css('top');
		var module_width = $(this).parent().parent().css('width');
		var width = 400;
		var height = 140;
		var left = $(window).width() / 2 - width / 2;
		var top  = $(window).height() / 2 - height / 2; 

		if ($('.extension-dialog').length <= 0) {
			$body.append(`
				<div id="SetModuleSync" class="tb-dialog tb-overlay extension-dialog" style="width:`+width+`px; z-index:10000388; left:`+left+`px; top:`+top+`px;" >
					<a class="tb-dialog-close tb-overlay-close" data-action="close">					
						<span class="tb-dialog-close-x tb-overlay-close-x">close</span>
					</a>
					<div  class="tb-dialog-content tb-overlay-content" style="display: block;">
						<div class="tb-dialog-header tb-overlay-header drag">模块代码同步设置</div>
						<div class="tb-dialog-body tb-overlay-body" style="height:`+height+`px;padding:5px;">
							<input id="Module_uri" type="hidden" value="">
							<br/>
							<p>
								<label title="如果要模块删除分类，请选择 &lt;无分类&gt;">模块分类：</label>
								<select>
									<option>&lt;无分类&gt;</option>
								</select>
							</p>
							<br/>
							<p>
								<label>新建分类：</label><input id="Category" type="text" style="width:280px;margin-left:4px;" placeholder="如果要新建分类，请在这里填入分类名。" />
							</p>
							<br/>
							<p>
								<input id="Sync_release" type="checkbox"><label>同步后发布</label><button data-action="confirm" style="margin-left:10px;cursor:pointer;">保存或开始同步</button>
							</p>
						</div>
						<div class="tb-dialog-footer tb-overlay-footer"></div>
					</div>
				</div>
			`);
		}

		//window.frames[0].postMessage(module_top, '*');
		var uri = getModuleUri(module_width, module_top);
		setDialogParam(uri);
	});

	$body.on('click', '[data-action="close"]', function(){
		$('#SetModuleSync').remove();
	});

	$body.on('click', '#SetModuleSync [data-action="confirm"]', function(){
		//alert('SetModuleSync');
		var uri = $("#SetModuleSync #Module_uri").val();
		var select = $("#SetModuleSync select").find("option:selected").text();
		var createCate = $("#SetModuleSync #Category").val();
		var syncRelease = $("#SetModuleSync #Sync_release").is(':checked');

		if (createCate) {
			removeCate(uri, function(r1){
				storCate(uri, select, createCate, function(r2){
					if(r2.isSuccess) { showTips(r2.message, 'tip-success'); }
				});
			});

		} else if( select.indexOf('无分类')>-1 ) {
			removeCate(uri, function(r){
				if(r.isSuccess) { showTips(r.message, 'tip-success'); }
			});

		} else {
			removeCate(uri, function(r1){
				storCate(uri, select, createCate, function(r2){
					if (r1.isDel) { 
						ReadySync(uri, r2.newCate, syncRelease);
					} else {
						showTips(r2.message, 'tip-success');
					}
				});
			});

		}
	});

})();

