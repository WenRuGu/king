
	mui.init();
(function($,doc){
	
	var login = document.getElementById('login');
	var forgot_psw = document.getElementsByClassName('forgot-psw')[0];
	var register = document.getElementsByClassName('mui-btn-blue')[0];
	var user_id = document.getElementsByClassName('user-id')[0];
	var user_psw = document.getElementsByClassName('mui-input-password')[0];
	var sel_span = document.getElementsByClassName('sel-span')[0];
	var hide_id = document.getElementsByClassName('hide-id')[0];
	var shanchu = document.getElementsByClassName('icon-iconfontshanchu');
	var self;
	var allId;
	var onOff = true;  // 下拉账号
	
	var backButtonPress = 0;
	var localstorage = window.localStorage;
//	localstorage.setItem('ip','http://122.224.164.50:5180');   // main一个 login一个
	var login_ip = localstorage.getItem('ip');
	
	function input_disabled() {
		if ( user_id.value == '' || user_psw.value == '' ) {
			login.setAttribute('disabled', 'disabled');
		} else {
			login.disabled = false;
		}
	}
	user_id.addEventListener('input', input_disabled);
	user_psw.addEventListener('input',input_disabled);
	if ( user_psw.value!='' ){				//暂时部分
		login.disabled = false;
	}
	if ( localstorage.getItem('allId') == null) {
		localstorage.setItem('allId','');
	}
	if ( localstorage.getItem('sec-login') == null ) {
		localstorage.setItem('sec-login', 'false');
	}
	
	mui.plusReady(function(){
		self = plus.webview.currentWebview();
		self.setStyle({
			scrollIndicator: 'none'
		});
		allId = localstorage.getItem('allId');
		hide_id.innerHTML = '';
		plus.navigator.closeSplashscreen();					// 初始化页面关闭；
		plus.navigator.setFullscreen(false);
		if ( allId != '' ) {											// 下拉显示 曾经登录的账号
			var fragment = document.createDocumentFragment(); 
			var arr = allId.split(';');
			for ( var i = 0; i < arr.length - 1; i++) {
				var arr_1 = arr[i].split(',');
				var li = document.createElement('li');
				li.innerHTML = '<img src="'+ arr_1[1]+'" class="h-user-pic"/>'
					+ '<p class="h-user-p">'+ arr_1[0] +'</p>'
					+ '<span class="mui-icon iconfont icon-iconfontshanchu"></span>';
				fragment.appendChild(li);
			}
			hide_id.appendChild(fragment);
		}
		
		mui('.hide-id').on('tap','.icon-iconfontshanchu', function(e) {   // 删除账号
			var that = this;
			var li = this.parentNode;
			var txt = li.querySelector('.h-user-p').innerHTML;
			var pic_src = li.querySelector('.h-user-pic').getAttribute('src');
			
			plus.nativeUI.confirm( "删除该账号？", function(e){
				if (e.index == 0) {
					var arr = allId.split(';');
					console.log('arr.length'+arr.length);
					for ( var i = 0; i < arr.length - 1; i++ ) {
						var arr_1 = arr[i].split(',');
						if ( arr_1[0] == txt ) {		// 判断是否 相同
							console.log(arr_1[0]);
							arr.splice(i,1);
						} 
					}
					allId = arr.join(';');
					localstorage.setItem('allId', allId);
					that.parentNode.parentNode.removeChild(that.parentNode);
				}
				sel_span.classList.add('mui-icon-arrowdown');
				sel_span.classList.remove('mui-icon-arrowup');
				hide_id.style.opacity = 0;
				hide_id.style.display = 'none';
				onOff = true;
			}, "提醒", ["确定","取消"] );
			e.stopPropagation();
		})
		
		login.addEventListener('tap',function() {
			
		    if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
		    	mui.toast('网络不给力，请稍后再试');
		    	return;
		    } 
			var psw = hex_md5("678CAC1884EC98A89E9A269671AEDC28" + (hex_sha1("678CAC1884EC98A89E9A269671AEDC28" + user_psw.value)).toUpperCase()).toUpperCase();
			mui.post(login_ip+'/api/v1/basic/customer/login',{
					mobile: user_id.value,
					password: psw
				},function(data){
//					console.log(JSON.stringify(data));
					if ( data.code == 0 ) {
						var gainTime = new Date().getTime();
						localstorage.setItem('expireIn', ''+data.data.expireIn);//  token 过期时间
						localstorage.setItem('token', data.data.token);     	//  token 
						localstorage.setItem('userpsw', psw);					//  psw
						localstorage.setItem('userMobile', user_id.value);		//  手机号码
						localstorage.setItem('gainTime', gainTime);         	//  获取token时间   （毫秒数）
						localstorage.setItem('loginFlag', 'true');				// 	登录状态
						console.log(localstorage.getItem('token')+','+localstorage.getItem('expireIn')+','+localstorage.getItem('userpsw')+','+localstorage.getItem('userMobile'));
						if ( localstorage.getItem('sec-login') == 'false' ) {
							mui.fire(plus.webview.getLaunchWebview(),'init',{});
						} else {
							mui.fire(plus.webview.getLaunchWebview(),'sec-init',{});
						}
						plus.nativeUI.showWaiting();
						plus.webview.hide('personal-info.html');
						plus.webview.hide('pages/tab-webview-subpage-setting.html');
						plus.webview.show('pages/tab-webview-subpage-charge.html');
						plus.webview.show('pages/bottom-main.html');
						setTimeout(function() {
							mui.fire(plus.webview.getWebviewById('pages/bottom-main.html'),'active',{});
							mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-order.html'),'init-order',{});  // order
							mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-charge.html'),'charge-update',{
								distance: 5000,
								zoom: 12
							});
							plus.nativeUI.closeWaiting();
							plus.webview.close(self);
						}, 1000);
					} else if ( data.code == 2){
						plus.nativeUI.toast( "账号或密码错误");
					} else {
						plus.nativeUI.alert('登录失败',function() {},'','确定');
					}
				},'json'
			);
		})
	})
	sel_span.addEventListener('tap',function() {
		if ( onOff ) {
			this.classList.remove('mui-icon-arrowdown');
			this.classList.add('mui-icon-arrowup');
			hide_id.style.display = 'block';
			setTimeout(function() {
				hide_id.style.opacity = 1;
			},20);
			onOff = false;
		} else {
			this.classList.add('mui-icon-arrowdown');
			this.classList.remove('mui-icon-arrowup');
			hide_id.style.opacity = 0;
			hide_id.style.display = 'none';
			onOff = true;
		}
	});
	document.addEventListener('tap', function(e) {
		var aim = e.target;
		if ( aim != forgot_psw && aim != register && aim != user_psw && aim != sel_span) {
			for ( var i = 0; i < shanchu.length; i++ ) {
				if (shanchu[i] == aim) {
					return;
				}
			}
			sel_span.classList.add('mui-icon-arrowdown');
			sel_span.classList.remove('mui-icon-arrowup');
			hide_id.style.opacity = 0;
			hide_id.style.display = 'none';
			onOff = true;
		} 
		e.stopPropagation();
	})
	mui('.hide-id').on('tap','.h-user-p',function() {
		user_id.value = this.innerHTML;
		user_psw.value = '';
	});
	mui('.hide-id').on('tap','.h-user-pic',function() {
		user_id.value = this.nextSibling.nextSibling.innerHTML;
		user_psw.value = '';
	});
	function oPage(url) {
		mui.openWindow({
			id: url,
			url: url,
			show: {
				aniShow: 'slide-in-right',
				duration: 200
			},
			styles: {
				popGesture: 'close'
			},
			waiting: {
				autoShow: false
			}
		})
	}
	register.addEventListener('tap', function() {			// 打开注册页
		oPage('register.html');
	});
	forgot_psw.addEventListener('tap', function() {			// 忘记密码
		oPage('account.html');
	});
	mui.back = function(event) {
		backButtonPress++;
		if (backButtonPress > 1) {
			localstorage.setItem('token', null);  
			localstorage.setItem('sec-login', 'false');  // 退出应用，二次登录为false
			plus.runtime.quit();
		} else {
			plus.nativeUI.toast('再按一次退出应用');
		}
		setTimeout(function() {
			backButtonPress = 0;
		}, 2000);
		return false;
	};
}(mui,document));