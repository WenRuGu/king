
mui.init();
(function($, doc){
	$('.mui-scroll-wrapper').scroll({
		deceleration: 0.0005,
		indicators: false
	});
	
	function $c(id) {
		return document.getElementsByClassName(id)[0];
	}

	var site = $c('site');
	var distance = $c('distance');
	var space = $c('space');
	var pay = $c('pay');
	var openTime = $c('openTime');
	var sel_price = $c('sel');				// 预约价格box
	var only_pic = $c('only-pic'); 
	var container = $c('swiper-cantainer');
	var wrapper = $c('swiper-wrapper');
	var pagination = $c('swiper-pagination');
	var payTest = '';
	
	var localstorage = window.localStorage; 
	var detail_ip = localstorage.getItem('ip');

	var price = 0;
	var orderType;
	var cabinetId;
	var payNum = 1;			// 数值不同，付款方式
	var token;
	var path = '/api/v1/hdw/exchange_order/bespeak_balance_pay';  // 初始默认选择的path
	var self;
	var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        preventClicks : false,//默认true
        observer:true,
    	observeParents:true,
   });
    pagination.style.display = 'none';
	$.plusReady(function() {
		plus.nativeUI.closeWaiting();
		self = plus.webview.currentWebview();
		cabinetId = self.cabinetId;
		var pays={};
		// 获取支付通道
		plus.payment.getChannels(function(channels){
			for(var i in channels){
				var channel=channels[i];
//				console.log(channel.id + ',' + channel.description+','+channel.serviceReady);
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
		
		function get_bespeak_price() {
			token = localstorage.getItem('token');
//			console.log(token+','+cabinetId);
			mui.post(detail_ip + '/api/v1/hdw/bespeak_price/list',{
					token: token,
					cabinetId: cabinetId
			},function(data){
					console.log(JSON.stringify(data));
					if ( data.code == 0 ) {
						var div;
						var fragment = document.createDocumentFragment();
						mui.each( data.data, function ( index, item) {
							div = document.createElement('div');
							div.className = 'priceBox';
							var sel_class = 'sel-blue';
							var rmb = '元';
							var time = '分钟';
							if ( index == 0) {
								div.className = 'priceBox priceBox-border';
								sel_class = 'superscript-show sel-blue';
							}
							if ( item.price == 0 ) {
								item.price = '免费';
								rmb = '';
							} else {
								item.price = item.price;
							}
							div.innerHTML = '<p><span class="charge-price">'+ item.price +'</span>'+ rmb +'</p>'
								+ '<p><span class="duration">'+ item.duration +'</span>'+ time +'</p>'
								+ '<span class="'+ sel_class +'"></span>';
							
							fragment.appendChild(div);
						});
						sel_price.appendChild(fragment);
					}
				},'json'
			);
		}
		
		function getcharge(){
			token = localstorage.getItem('token');
			mui.ajax( detail_ip + '/api/v1/hdw/cabinet/detail',{
				data:{
					token: token,
					id: cabinetId,
					lng: localstorage.getItem('lng'),
					lat: localstorage.getItem('lat')
				},
				dataType:'json',
				type:'post',
				timeout:10000,            
				success:function(data){
					console.log(JSON.stringify(data));
					if ( data.code == 0 ) {
						site.innerHTML = data.data.cabinetName;
						distance.innerHTML = (data.data.distance / 1000).toFixed(2) + 'km';
						space.innerHTML = data.data.freePoint;
						openTime.innerHTML = data.data.openTime;
						
						var len = data.data.imageList.length;
						if ( len == 1 ) {
							only_pic.style.display = 'block';
							only_pic.src = data.data.imageList[0];
						} else if ( len > 1 ){
							wrapper.innerHTML = '';
							pagination.style.display = 'block';
							var div;
							var fragment = doc.createDocumentFragment();
							$.each(data.data.imageList, function(index) {
								div = doc.createElement('div');
								div.className = 'swiper-slide';
								div.innerHTML = '<img src="'+ data.data.imageList[index] +'">';
								fragment.appendChild(div);
							});
							wrapper.appendChild(fragment);
						}
					}
				},
				error:function(xhr,type,errorThrown){
					//异常处理；
					console.log(type);
				}
			});
		}
		getcharge();			// 获取预约详情
		setTimeout(function() {
			get_bespeak_price();	// 获取预约价格
		}, 200);
		
		function update() {
			plus.nativeUI.alert('预约成功',function(){
				mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-charge.html'),'charge-update',{
					distance: localstorage.getItem('distance') || 5000,
					zoom: localstorage.getItem('zoom') || 12
				});      // charge-sub 和charge 页，更新桩点空闲数
				mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-order.html'),'update-order',{});
				plus.webview.close(self);
			},'提示','确定');
		}

		$('.sel').on('tap', '.priceBox', function() {
//			console.log('sads');
			$('.priceBox').each(function() {
				this.className = 'priceBox';
				this.querySelector('.sel-blue').className = 'sel-blue';
			})
			this.className = 'priceBox priceBox-border';
			this.querySelector('.sel-blue').classList.add('superscript-show');
		});
		function three_pay( payNum,price, duration) {
			token = localstorage.getItem('token');
			if ( price == 0 ) {
				path = '/api/v1/hdw/exchange_order/bespeak_balance_pay';
			}
			plus.nativeUI.showWaiting('正在请求支付...',{
				loading:{
					display:'none'
				}
			});
			console.log( payNum+','+detail_ip+path+','+price+','+self.cabinetId);
			mui.ajax( detail_ip + path,{
				data:{
					token: token,
					cabinetId: self.cabinetId,
					price: 100*price,   // 返回的要乘100
					duration: 1*duration
				},
				dataType:'json',
				type:'post',
				timeout:10000,
				success:function(data){
					plus.nativeUI.closeWaiting();
					console.log(JSON.stringify(data));
					if ( data.code == 0) {
						if ( payNum == 1 ) {
							mui.fire(plus.webview.getLaunchWebview(),'update-balance',{});
							update();
						} else {
							plus.payment.request(pays[payTest],data.data.alipayParam,function(result){
								console.log(result.code+','+result.message);
								update();
							},function(e){
								console.log(e.code+','+e.message);
								plus.nativeUI.alert('提醒', null, '支付失败：'+e.code);
							});
						}
					} else {
						plus.nativeUI.alert(data.message,function(){},'提示','确定');
					}
				},
				error:function(xhr,type,errorThrown){
					//异常处理；
					plus.nativeUI.closeWaiting();
					plus.nativeUI.alert('预约失败');
				}
			});
			if ( payNum == 2 ) {
				path = '/api/v1/hdw/exchange_order/bespeak_weixin_pay';
			} else if ( payNum == 3 ) {
				path = '/api/v1/hdw/exchange_order/bespeak_alipay_pay';
			}
		}
		pay.addEventListener('tap', function() {
			var selBox = document.querySelector('.priceBox-border'); 
			var charge_price = selBox.querySelector('.charge-price').innerHTML;
			var duration = selBox.querySelector('.duration').innerHTML;
//			console.log(charge_price+','+duration+','+payNum);
			if ( charge_price == '免费' ) {
				charge_price = 0;
			} 
			if ( path == '/api/v1/hdw/exchange_order/bespeak_balance_pay' ) {
				if ( payNum == 1 && parseFloat(localstorage.getItem('exbalance')) < charge_price ) {
					if ( parseFloat(localstorage.getItem('balance')) < charge_price ) {
						plus.nativeUI.alert('余额不足，请充值');
						return;
					}
				}
				plus.nativeUI.confirm('确认余额支付？',function(e) {
					if ( e.index == 1 ) {			// 取消
						return;
					} else {
						console.log(payNum);
						three_pay( payNum,charge_price,duration );
					}
				}, '',['确定','取消']);
			} else {
				three_pay( payNum,charge_price,duration );
			}
		})
		$('.payment').on('tap', 'div', function() {
			var pay = this.parentNode.children;
			$('.payment span').each(function() {
				this.className = '';
			});
			for( var i = 0; i < pay.length; i++ ){
				pay[i].className = '';
			}
			this.className = 'payment-active';
			if( this.getAttribute('id') == 'balance') {
				mui('.payment span')[0].className = 'superscript-show';
				payNum = 1;
				path = '/api/v1/hdw/exchange_order/bespeak_balance_pay'
			} else if( this.getAttribute('id') == 'weixin' ) {
				mui('.payment span')[1].className = 'superscript-show';
				payNum = 2;
				payTest = 'wxpay';
				path = '/api/v1/hdw/exchange_order/bespeak_weixin_pay';
			} else {
				mui('.payment span')[2].className = 'superscript-show';
				payNum = 3;
				payTest = 'alipay';
				path = '/api/v1/hdw/exchange_order/bespeak_alipay_pay';
			}
		})
	})
}(mui, document));




































