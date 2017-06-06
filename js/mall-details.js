
mui.init();
(function($, doc){
		var self;
		
		function $c(id){
			return document.getElementsByClassName(id)[0];
		}
		
		var goods_pic = $c('goods-pic');
		var goods_details = $c('goods-details');
		var price = $c('buy-price');
		var old_price = $c('old-price');
		var goods_title = $c('goods-title');
		var pay = $c('buy-btn');
//		var img_item = $c('mui-slider-group');
//		var indicator = $c('mui-slider-indicator');
		var wrapper = $c('swiper-wrapper');
		var pagination = $c('swiper-pagination');
		var only_pic = $c('only-pic'); 
		
		var itemName;				// mall 商品名称
		var priceNew;				// 实际价格
		var src;					// mall订单 pic
		var itemId;					// mall id
		var token;
		var exchangeMoney = 0;
		var localstorage = window.localStorage;
		var mallde_ip = localstorage.getItem('ip');
		var get_count = 0;
		$('.mui-scroll-wrapper').scroll({
			deceleration: 0.0005 
		});
		var swiper = new Swiper('.swiper-container', {
	        pagination: '.swiper-pagination',
	        paginationClickable: true,
	        observer:true,//修改swiper自己或子元素时，自动初始化swiper
	    	observeParents:true,//修改swiper的父元素时，自动初始化swiper
	    });
	    pagination.style.display = 'none';
		$.plusReady(function(){
			plus.nativeUI.closeWaiting();
			self = plus.webview.currentWebview();
			
			token = localstorage.getItem('token');
//			console.log(token+','+self.goodsId);
			function get_goods() {
				$.post( mallde_ip +'/api/v1/hdw/item/detail',{
						token:token,
						itemId:self.goodsId
				},function(data){ 
//						console.log(JSON.stringify(data));
						if ( data.code == 0) {
							goods_title.innerHTML= itemName = data.data.itemName;
							goods_details.innerHTML = data.data.introduction;
							priceNew = data.data.price;
							price.innerHTML = '¥ '+data.data.price;
							old_price.innerHTML = '¥ '+data.data.showPrice;
							src = data.data.imageList[0];
							itemId = data.data.id;
							exchangeMoney = data.data.exchangeMoney;
							
							var len = data.data.imageList.length;
							if ( len == 1 ) {
								only_pic.style.display = 'block';
								only_pic.src = data.data.imageList[0];
							} else {
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
						} else {
							get_count++;
							if ( get_count >= 2) {
								plus.nativeUI.alert('获取商品详情失败，请重新选择商品');
							}
							get_goods();
						}
					},'json'
				);
			}
			get_goods();
		    //显示当前页面
			pay.addEventListener('tap', function() {
//					console.log(itemId+','+itemName+','+priceNew+','+src);
				$.openWindow({
					id: 'mall-order.html',
					url: 'mall-order.html',
					show: {
						aniShow: 'slide-in-right',
						duration: 250
					},
					styles: {
						popGesture: 'close'
					},
					extras: {
						itemId: itemId,
						itemName: itemName,
						price: priceNew,
						src:src,
						exchangeMoney:exchangeMoney
					},
					waiting: {
						autoShow: false
					}
				})
			})
		});
	
}(mui,document))


























