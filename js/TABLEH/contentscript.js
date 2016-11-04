'use strict';

(function(){
	$('[data-moduletype="addCustom"]').trigger("click");  // 模拟鼠标点击六月工具 “添加自定义内容背景” 按钮

	/*
	 * 修改六月工具 “生成代码” 按钮
	 */
	$('#jBtnCodeExport').attr('data-target', 'module-clicked');
	$('#jBtnCodeExport').attr('data-moduletype', 'addCustom');
	$('#jBtnCodeExport').removeAttr('data-codetype');
	$('#jBtnCodeExport').find('.j-hop-hover').remove();

	/*
	 * 剔除 “保存” “导入代码” 按钮
	 */
	$('#save').remove();
	$('#jBtnCodeImport').remove();

	var req = {};

	req.Action = 'getValue';
	chrome.runtime.sendMessage(req, function(result){
		var CustomCode = result['#TableHandle'];

		var i = setInterval(function(){
			if ($('#codeText').length > 0) {
				window.clearInterval(i);
				$('#codeText').val(CustomCode);
				$('button:contains("添加")').trigger("click");
				$('button:contains("关闭")').trigger("click");
			}
		}, 100);

		var req = {};
		req.Action = 'setValue';
		req.Key = '#TableHandle';
		req.Value = '';
		chrome.runtime.sendMessage(req, function(result){});
	});
})();
