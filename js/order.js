
(function($, doc) {
	$.init();
	$('.mui-scroll-wrapper').scroll({
		indicators: false //是否显示滚动条
	});
	
	var self;
	$.plusReady(function() {
		_self = plus.webview.currentWebview();
		_self.setPullToRefresh({
			support: true,
			height: '50px',
			range: '100px',
			style: 'circle',
			offset: '1px'
		}, pulldownRefresh);
	})

	mui('#item1mobile').on('tap','.mui-btn-gray',function() {
		this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
	})
	function addData() {
//		var table = document.body.querySelector('.mui-table-view');
//		var cells = document.body.querySelectorAll('.mui-table-view-cell');
//		for(var i = cells.length, len = i + 5; i < len; i++) {
//			var li = document.createElement('li');
//			li.className = 'mui-table-view-cell';
//			li.innerHTML = '<a class="mui-navigate-right">Item ' + (i + 1) + '</a>';
//			//下拉刷新，新纪录插到最前面；
//			table.insertBefore(li, table.firstChild);
//		}
	}
	function pulldownRefresh() {
		setTimeout(function() {
			addData();
			_self.endPullToRefresh();
		}, 1500);
	}
	var html2 = '<ul id="paid" class="mui-table-view" >'
			                +'<li class="mui-table-view-cell">'
		                		+'<p class="order-number">订单编号：2838383833838</p>'
		                		+'<p class="order-goods-name">'
		                			+'<span class="mui-pull-left">商品名称：2838383833838</span>'
		                			+'<span class="mui-pull-right">¥5</span>'
		                		+'</p><p class="order-seller-name">'
		                			+'<span class="mui-pull-left">商家名称：换电网</span>'
		                			+'<span class="mui-pull-right">未付款</span>'
		                		+'</p></li></ul>';
	var html3 = '<ul id="paid" class="mui-table-view" >'
			                +'<li class="mui-table-view-cell">'
		                		+'<p class="order-number">订单编号：2838383833838</p>'
		                		+'<p class="order-goods-name">'
		                			+'<span class="mui-pull-left">商品名称：2838383833838</span>'
		                			+'<span class="mui-pull-right">¥5</span>'
		                		+'</p><p class="order-seller-name">'
		                			+'<span class="mui-pull-left">商家名称：换电网</span>'
		                			+'<span class="mui-pull-right">未付款</span>'
		                		+'</p></li></ul>';
	var item2 = document.getElementById('item2mobile');
	var item3 = document.getElementById('item3mobile');
	document.getElementById('slider').addEventListener('slide', function(e) {
		if(e.detail.slideNumber === 1) {
					item2.querySelector('.mui-scroll').innerHTML = html2;
		} else if(e.detail.slideNumber === 2) {
					item3.querySelector('.mui-scroll').innerHTML = html3;
		}
	});
})(mui, document);































