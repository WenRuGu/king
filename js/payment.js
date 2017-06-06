
mui.init();

var self;
var token;
var localstorage = window.localStorage;
var pay_ip = localstorage.getItem('ip');

var goods_num;				// 数量
var price;					// 单价
var itemId;					// 商品id
var orderId;				// 订单id
var total_compare;			// 判断余额是否充足
var cabinetId;				// 充电返回的 桩点
var pay = document.getElementsByClassName('pay')[0];
var goods_title = document.getElementsByClassName('goods-title')[0];
var total = document.getElementsByClassName('total')[0];
var price = document.getElementsByClassName('goods-price')[0];
var amount = document.getElementsByClassName('amount')[0];
var path = '/api/v1/hdw/common_order/balance_pay';
var create_path = '/api/v1/hdw/exchange_order/create';   // 扫码没有订单。

mui.plusReady(function() {
	plus.nativeUI.closeWaiting();
	self = plus.webview.currentWebview();
	orderId = self.orderId;
	goods_title.innerHTML = self.itemName;
	price.innerHTML = self.price + '元';
	total.innerHTML = self.total + '元';
	total_compare = self.total;
	amount.innerHTML = self.amount;
	

	function getChargeId(){
		if ( self.orderId == 0 ) {
			token = localstorage.getItem('token');
			mui.post( pay_ip+'/api/v1/hdw/exchange_order/create',{
					token: token,
					cabinetId: self.cabinetId
			},function(data){
//					console.log(JSON.stringify(data));
					if ( data.code == 0 ) {
						orderId = data.data.id;
					}
				},'json'
			);
		}
	}
	getChargeId();
	mui('.pay-mo').on('tap', '.mui-input-row', function() {
		mui('.iconfont').each(function() {
			this.classList.remove('check');
			this.classList.remove('icon-checkbox');
			this.classList.add('icon-checkbox1');
		})
		this.querySelector('.iconfont').classList.add('check');
		this.querySelector('.iconfont').classList.remove('icon-checkbox1');
		this.querySelector('.iconfont').classList.add('icon-checkbox');
	});
	var pays={};
	// 获取支付通道
	plus.payment.getChannels(function(channels){
		console.log(JSON.stringify(channels));
		for(var i in channels){
			var channel=channels[i];
//			console.log(channel.id + ',' + channel.description+','+channel.serviceReady);
			if(channel.id=='qhpay'||channel.id=='qihoo'){	// 过滤掉不支持的支付通道：暂不支持360相关支付
				continue;
			}
			pays[channel.id]=channel;
			checkServices(channel);
		}
	},function(e){
		plus.nativeUI.toast('获取支付通道失败：'+e.message);
	});
	// 检测是否安装支付服务
	function checkServices(pc){
		console.log(JSON.stringify(pc));
		if(!pc.serviceReady){
			var txt=null;
			switch(pc.id){
				case 'alipay':
				txt='检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？';
				break;
				default:
				txt='系统未安装“'+pc.description+'”服务，无法完成支付，是否立即安装？';
				break;
			}
			plus.nativeUI.confirm(txt, function(e){
				if(e.index==0){
					pc.installService();
				}
			}, pc.description);
		}
	}

	function update() {
		mui.fire(plus.webview.getLaunchWebview(),'update-balance',{});
		mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-order.html'),'update-order',{ order: true });
	}
	mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-order.html'),'update-order',{ order: true });
	function closePage() {
		update();
		plus.nativeUI.alert('支付成功!',function(){
			if ( self.charge == 'true') {
				mui.openWindow({
					id: 'open-box-1.html',
					url: 'open-box-1.html',
					styles: {
						popGesture: 'none'
					},
					show: {
						aniShow: 'slide-in-right'
					},
					waiting: {
						autoShow: false
					},
					extras: {
						code: self.cabinetId,		// 桩点
						orderId: orderId			// 订单
					}
				});
			} else {
				plus.webview.close('pages/tab-webview-subpage-scan.html');
				plus.webview.close('mall-order.html');
				plus.webview.close('mall-details.html');
				plus.webview.close(self);
			}
			
		},'提示','确定');
	}
	function payment(path,ip, classify){
//		console.log(orderId);
		token = localstorage.getItem('token');
//		console.log(self.itemName);
		if ( orderId == 0 ) {
			getChargeId();
			setTimeout(function() {
				plus.nativeUI.alert('获取换电订单失败,请再次点击付款',function(){},'提示','确定');
			}, 30);
		} else {
			plus.nativeUI.showWaiting();
			mui.post(ip+path,{
					token:token,
					orderId: orderId
			},function(data){
					console.log(JSON.stringify(data));
					plus.nativeUI.closeWaiting();
					if ( data.code == 0 ) {
						if ( classify == 'balance' ) {
							closePage();
						} else {
							/**
							 * 如果没有安装 支付宝， 会使用验证码登录网页版支付宝进行支付
							 * */
							plus.payment.request(pays[classify],data.data.alipayParam,function(result){
//								console.log(JSON.stringify(result));
								closePage();
							},function(e){
								plus.nativeUI.alert('支付失败',function() {},'提示','确定');
							});
						}
					} else {
						update();
						plus.nativeUI.alert('支付失败',function() {},'提示','确定');
					}
				},'json'
			);
		}
	}
	pay.addEventListener('tap', function(){
		var check = document.getElementsByClassName('check')[0];
		var classify = check.parentNode.getAttribute('data-test');
		if ( classify == 'balance' ) {
			plus.nativeUI.confirm('是否使用余额支付？',function(e) {
				if ( e.index == 0) {
					var balance = parseFloat(localstorage.getItem('balance'));
					path = '/api/v1/hdw/common_order/balance_pay';
					if ( total_compare > balance ) {
						plus.nativeUI.alert('余额不足，请充值',function(){},'提示','确定');
						return;
					} else {
						payment(path,pay_ip,classify);
					}
				}
			}, '',['确定','取消']);
		} else if ( classify == 'wxpay') {
			path = '/api/v1/hdw/common_order/weixin_pay';
			payment(path,pay_ip,classify);
		} else {
			path = '/api/v1/hdw/common_order/alipay_pay';
			payment(path,pay_ip,classify);
		}
	})
	var old_back = mui.back;  
    mui.back = function() {  
		plus.webview.close('pages/tab-webview-subpage-scan.html');
		old_back();
    }     
});






