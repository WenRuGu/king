mui.init();

(function($, doc){

	var localstorage = window.localStorage;  
	var setting_ip = localstorage.getItem('ip');
	var self;
	
	function $c(id){
		return document.getElementsByClassName(id)[0];
	}
	
	var cache = $c('cache');
	var personal = $c('personal');
	var address = $c('address');
	var feedback= $c('feedback');
	var moverescue = $c('moverescue');
	var my_balance = $c('my-balance');
	var balance = $c('balance');
	var mobile = $c('mobile');
	var nickname = $c('nickname');
	var update = $c('update');
	
	var cache_clear = doc.getElementById('cache_clear');
	var userpic = doc.getElementById('userpic');
	var about = doc.getElementById('about-own');
	
	var token;
	var network_flag = true; 	// true 为网络正常

	function wainshow() {
	    if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
	    	network_flag = false;
	    } else {
			network_flag = true;
	    }
	}
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		self.setStyle({
			scrollIndicator: 'none'
		});
		function set_init(){
			mobile.innerHTML = localstorage.getItem('mobile');
			nickname.innerHTML = localstorage.getItem('nickname');
			balance.innerHTML ='¥ '+ localstorage.getItem('balance');
			userpic.setAttribute('data-src', localstorage.getItem('portrait'));
			setTimeout(function() {
				lazyImg.lazyLoad(true);
			}, 2500);
		}
		if ( network_flag ){
			if ( localstorage.getItem('loginFlag') == 'true' ) {
				function getSetting() {
//					console.log( 'setting登录 == '+ localstorage.getItem('loginFlag'));
					if ( localstorage.getItem('token') != null ) {
						set_init();
					} else {
						setTimeout(function(){
							getSetting();
						},1000);
					}
				}
				setTimeout(function(){
					getSetting();
				},1000)
			}
		} else {
			if ( localstorage.getItem('loginFlag') == 'true' ) {
				set_init();     // 没有网络， 但是进去 主页面， 说明没有退出登录， 还是当前用户
			}
		}
		window.addEventListener('info',function(event) {	// 基础页之一，必须在main页ajax获取信息后，获取
//			console.log('setting == info');
			setTimeout(function() { 						// 页面load之前，监听不到事件触发
				userpic.src = localstorage.getItem('portrait');
				set_init();
			},10);
		});
		window.addEventListener('portrait', function(event) {   // personal-info页 修改头像
			userpic.src = localstorage.getItem('portrait');
		});
		window.addEventListener('update-info',function(event){	// nickname页 修改刷新的
			set_init();
		})
		var version = update.querySelector('span');
		version.innerHTML = '当前版本'+plus.runtime.version;
		update.addEventListener('tap', function() {
			wainshow();
			if ( !network_flag ) {
				mui.toast('检查更新失败，请稍后再试');
				return;
			}
			if ( localstorage.getItem('version') ==  plus.runtime.version ) {
				mui.toast('当前已经是最新版本了')
				return;
			}
			plus.nativeUI.confirm('修复一些bug，app使用更流畅',function(e) {
				if ( e.index == 0 ) {
					mui.post(setting_ip + '/api/v1/basic/customer/latest_version',{
							token: token
					},function(data){
							if ( data.code == 0 ) {
								if ( 'Android' == plus.os.name ) {
									var dtask = plus.downloader.createDownload( data.data.url, {}, function( d, status) {
										if ( status == 200 ) {
											var path = d.filename;
											plus.runtime.install(path);
										} else {
											plus.nativeUI.alert('下载失败');
										}
									})
								} else {
//									var url = encodeURI(data.data.ios);
									plus.runtime.openURL( data.data.ios );
								}
							}
						},'json'
					);
				}
			}, '更新到新版本？',['确定','取消']);
		})
		
		cache_clear.addEventListener('tap', function() {
			plus.nativeUI.confirm('确认清楚缓存？',function(e) {
				if ( e.index == 0 ) {
					var size = 0;
				    for(item in window.localStorage) {
				        if(window.localStorage.hasOwnProperty(item)) {
				            size += window.localStorage.getItem(item).length;
				        }
				        plus.storage.setItem(item, window.localStorage.getItem(item));
//				        console.log(item);
				    }
//				    console.log('当前localStorage剩余容量为' + (size / 1024).toFixed(2) + 'KB');
				    plus.cache.clear();
				    if ( mui.os.ios ) {
				    	mui.toast('清除成功');
				    } else {
				    	common.cache.clear();
				    }
				    setTimeout(function() {
					    var keyNames = [];
						var numKeys = plus.storage.getLength();
						for ( var i = 0; i < numKeys; i++ ) {
							keyNames[i] = plus.storage.key(i);
							localstorage.setItem(keyNames[i], plus.storage.getItem(keyNames[i]));
						}
				    }, 20);
				}
			}, '',['确认','取消']);
		});
	});
	function open(url) {
		$.openWindow({
			id: url,
			url: url,
			show: {
				aniShow: 'slide-in-right',     // 不能使用pop-in效果
				duration: 200
			},
			styles: {
				popGesture: 'close'
			},
			waiting: {
				autoShow: false
			}
		});
	}
	personal.addEventListener('tap', function() {
		open('personal-info.html');
		mui.fire(plus.webview.getWebviewById('personal-info.html'),'second-reload');
	})
	my_balance.addEventListener('tap', function() {
		open('balance.html');
	});
	address.addEventListener('tap', function() {
		wainshow();
		if ( !network_flag ) {
			mui.toast('当前网络不给力，请稍后再试');
			return;
		}
		open('address.html');
	})
	about.addEventListener('tap', function() {
		wainshow();
		if ( !network_flag ) {
			mui.toast('当前网络不给力，请稍后再试');
			return;
		}
		open('about.html');
	});
	moverescue.addEventListener('tap', function() {
		open('moverescue.html');
	});
	feedback.addEventListener('tap', function() {
		open('feedback.html');
	});
	
}(mui, document));
