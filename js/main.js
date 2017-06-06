
mui.init();
var localstorage = window.localStorage;  
//localstorage.setItem('ip','http://192.9.198.241:8080');       // 这里修改地址,charge页都要修改
localstorage.setItem('ip','http://hd.yusong.com.cn:5180');       // 这里修改地址,charge页都要修改
var title = document.getElementById("title");
var msg = document.getElementsByClassName('msg')[0];
var msg_s = document.getElementsByClassName('msg-s')[0];
var subpages = [
				'pages/tab-webview-subpage-mall.html', 
				'pages/tab-webview-subpage-order.html', 
				'pages/tab-webview-subpage-setting.html'
				];
var subpage_style = {
	top: '44px',
	bottom: '48px',
	zindex: 99
};
var scan = 'pages/tab-webview-subpage-scan.html';   //中间扫码
var scan_style = {
	height: '100%',
	bottom:0,
	top: 0,
	zindex: 1002
}
var tabbar = 'pages/bottom-main.html';    //底部导航
var tabbar_style = {
	height:"70px",
    bottom:"0px",
    background: "transparent",
    zindex:100
}
var width = document.documentElement.clientWidth || window.screen.width;
var self;
var second;
var showLogin;			// 登录状态
var token;			
var allId;				// 登录过的账户
var main_ip;			// ip
var sub;
var aniShow = {};
var getTokenNum = 0;
var network_flag = true;
var tab_count = 0;
var noNet = false;
function preload(){
	for (var i = 0; i < 3; i++) {
		sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
		self.append(sub);
		sub.show();    
		sub.hide();   		//这里直接hide，相当于sub，没有显示过，第一次点击tab，会有空白
	}
	setTimeout(function() {
		plus.webview.show('pages/bottom-main.html');
	}, 800);
}
function wainshow() {
    if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
    	network_flag = false;
    } else {
		network_flag = true;		// 有网络
    }
}
mui.plusReady(function() {
	self = plus.webview.getLaunchWebview();
	second = plus.webview.getSecondWebview();
	self.append(second);
	localstorage.setItem('width', width);
	main_ip = localstorage.getItem('ip');
	if ( mui.os.android ) {
		plus.navigator.setStatusBarBackground('#000000');
	}
	plus.screen.lockOrientation('portrait-primary');			  // 竖屏
	showLogin = localstorage.getItem('loginFlag') || 'false';     //  判断用户是否 登录过
	var sup = plus.webview.create(tabbar,tabbar,tabbar_style);
	self.append(sup);
	if ( showLogin == 'true' ) {
		getToken();
		preload();
	} else {
		mui.openWindow({
			id:'login.html',
			url: 'pages/login.html',
			styles: {
				popGesture: 'none'
			},
			show: {
				aniShow: 'none'
			},
			waiting: {
				autoShow: false
			}
		});
	};
	if ( showLogin == 'true' ) {
		wainshow();
		if ( !network_flag ) {
			var net_error = plus.webview.create('pages/net-error.html', 'pages/net-error.html', subpage_style);
			self.append(net_error);
			noNet = true;
			plus.webview.show('pages/bottom-main.html');
		}
	}
	function getAddress() {		// 获取默认地址
		mui.ajax( main_ip+'/api/v1/basic/address_book/query_default',{
			data:{
				token: token
			},
			dataType:'json',
			type:'post',
			success:function(data){
//				console.log(JSON.stringify(data));
				if ( data.code == 0 ) {
					function isEmptyObject(obj){
					   for(var key in obj){
					     return false
					   };
					   return true
					};
					if ( !isEmptyObject( data.data) ){   				// 判断 不是为空对象
						var arr_address = [];
						arr_address[0] = data.data.contact;				// 收件人
						arr_address[1] = data.data.tel;					// tel
						arr_address[2] = data.data.provinceName+data.data.cityName+data.data.districtName; //大概位置
						arr_address[3] = data.data.street;				// 详细位置
						arr_address[4] = data.data.province;			// 省编码
						arr_address[5] = data.data.city;				// 市编码
						arr_address[6] = data.data.district;			// 县区编码
						
						localstorage.setItem('default_address', JSON.stringify(arr_address));
					} else {
						localstorage.setItem('default_address','false');
					}
				} 
			}
		});
	}
	function getInfo() {
		mui.getJSON(main_ip+'/api/v1/basic/customer/info',{token:token},function(item){
//			console.log( '个人信息 = '+JSON.stringify(item));
			if ( item.code == 0 ) {
//				localstorage.setItem('agentId', item.data.agentId);
				localstorage.setItem('agentName', item.data.agentName);     // 运营商
				if ( item.data.nickname == null ) {							// 昵称
					localstorage.setItem('nickname', '未设置');
				} else {
					localstorage.setItem('nickname',item.data.nickname);
				}
				localstorage.setItem('mobile',item.data.mobile);			// 手机号
				var realName = item.data.realName || '未设置';
				localstorage.setItem('realName',realName);					// 真实姓名
				if ( item.data.aboutUrl == null) {
					localstorage.setItem('aboutUrl', '');
				} else {
					localstorage.setItem('aboutUrl', item.data.aboutUrl);		// 关于我们url
				}
				if ( item.data.gender == 1) {								// 性别
					localstorage.setItem('gender', '男');
				} else if ( item.data.gender == 2) {
					localstorage.setItem('gender', '女');
				}
				if ( item.data.portrait == null ) {							// 个人信息中使用的
					localstorage.setItem('portrait', '../img/default-user.png');
				} else {
					localstorage.setItem('portrait', item.data.portrait);
				}
				
				if ( item.data.portrait == null ) {							// 判断是否为默认头像   登录过的账户
					item.data.portrait = '../img/default-user.png';
				}
				if ( allId == '') {                             			// 为空添加第一个id
					allId = item.data.mobile+','+item.data.portrait + ';';
				} else {	
					var arr = allId.split(';');
					for ( var i = 0; i < arr.length - 1; i++ ) {
						var arr_1 = arr[i].split(',')
						if ( arr_1[0] == item.data.mobile ) {		// 判断是否 相同   相同就删除
							arr.splice(i,1);
						} 
					}
					allId = arr.join(';')  + item.data.mobile +','+ item.data.portrait + ';';   //  添加当前账号的 mobile 头像
				}
				localstorage.setItem('allId',allId);
			}
			mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-setting.html'),'info',{});
		})
	};
	function getBalance(){
		mui.post( main_ip+'/api/v1/basic/customer/balance',{
				token:token
		},function(item){
//			console.log(JSON.stringify(item));
				if ( item.code == 0 ) {
					localstorage.setItem('balance', item.data.balance/100);
					localstorage.setItem('exbalance', item.data.exchangeBalance/100);
					mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-setting.html'),'info',{});
				}
			},'json'
		);
	}
	function getList(){
		mui.get(main_ip+'/api/v1/hdw/item_category/list',{ token: token },function(data){
			console.log(JSON.stringify(data));
				if ( data.code == 0 ) {
					var list_title = [];
					var list_id = [];
					mui.each( data.data, function( index, item) {
						list_title[index] = item.itemName;
						list_id[index] = item.id;
					});
					localstorage.setItem('mall-list-title', JSON.stringify(list_title));
					localstorage.setItem('mall-list-id', JSON.stringify(list_id));
					mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-mall.html'),'mall',{});  // 商城开始请求
				}
			},'json'
		);
	}
	function getPushInfo(){
		var info = plus.push.getClientInfo();
		var deviceToken = info.token;
		if ( mui.os.android) {
			deviceToken = localstorage.getItem('token');
		}
		mui.post(  main_ip + '/api/v1/basic/customer/cid',{
				token: deviceToken,
				clientId: info.clientid
		},function(data){
			console.log(JSON.stringify(data));
				if ( data.code == 0 ) {
					localstorage.setItem('version', ''+data.data.edition);
					if ( tab_count == 0) {
						if ( mui.os.ios ) {
							updateVersion();
							var GeTuiSdk = plus.ios.importClass('GeTuiSdk');
   							GeTuiSdk.setBadge(0);
						} else {
							setTimeout(function() {
								updateVersion();
							}, 2600);
						}
					}
				} else {
					getPushInfo();
				}
			},'json'
		);
	}
	plus.push.setAutoNotification( false );
	plus.runtime.setBadgeNumber(0);
	plus.push.addEventListener('click', function( msg ) {
		plus.runtime.setBadgeNumber(0);
		msg_s.classList.add('msg-pormpt');
	}, false);
	plus.push.addEventListener('receive', function( msg ) {
		msg_s.classList.add('msg-pormpt');
		var m = msg;
		var payload = (plus.os.name == 'iOS') ? m.payload : JSON.parse(m.payload);
		if ( m.push == undefined ) {
			m.push = 'true';
			plus.push.createMessage( msg.content, 'LoginMSG', {
				cover:false,
				title: msg.title
			});
		}
	}, false);
	document.addEventListener("resume", function() {
		plus.runtime.setBadgeNumber( 0 );
		if ( mui.os.android ) {
			//		plus.push.setAutoNotification( false );  
			var pushManager = plus.android.importClass("com.igexin.sdk.PushManager");
			plus.android.invoke( pushManager, 'initialize' );
			//		pushManager.getInstance().initialize(context);
		} else {
			var GeTuiSdk = plus.ios.importClass('GeTuiSdk');
            GeTuiSdk.setBadge(0);
		}
		token_isOutTime();
		wainshow();
		if ( !network_flag ) {
			network();
		}
	}, false);
	function compareVersion( ov, nv ){
		if ( !ov || !nv || ov=="" || nv=="" ){
			return false;
		}
		console.log(typeof ov);
		console.log(typeof nv);
		var b=false,
		ova = ov.split(".",4),
		nva = nv.split(".",4);
		for ( var i=0; i<ova.length&&i<nva.length; i++ ) {
			var so=ova[i],no=parseInt(so),sn=nva[i],nn=parseInt(sn);
			if ( nn>no || sn.length>so.length  ) {
				return true;
			} else if ( nn<no ) {
				return false;
			}
		}
		if ( nva.length>ova.length && 0==nv.indexOf(ov) ) {
			return true;
		}
	}
	function updateVersion() {
//		console.log('版本 == '+localstorage.getItem('version')+','+plus.runtime.version);
//		if ( localstorage.getItem('version') ==  plus.runtime.version ) {
//			return;
//		}
		var isUpdate = compareVersion(plus.runtime.version,localstorage.getItem('version'));
		if ( isUpdate == undefined || isUpdate == false ) {
			return;
		}
//		console.log(isUpdate);
		plus.nativeUI.confirm('修复一些bug，app使用更流畅',function(e) {
			if ( e.index == 0 ) {
				mui.post( main_ip +'/api/v1/basic/customer/latest_version',{
						token: token
				},function(data){
//					console.log(JSON.stringify(data));
						if ( data.code == 0 ) {
							if ( mui.os.android) {
								var dtask = plus.downloader.createDownload( data.data.android, {}, function( d, status) {
//									console.log(JSON.stringify(d)+','+JSON.stringify(status));
									if ( status == 200 ) {
										var path = d.filename;
										plus.runtime.install(path);
									} else {
										plus.nativeUI.alert('下载失败');
									}
								});
								dtask.start();
							} else {
//								var url = encodeURI(data.data.ios);
								plus.runtime.openURL( data.data.ios );
							}
						}
					},'json'
				);
			}
		}, '更新到新版本？',['确定','取消']);
	}
	function init() {
		token = localstorage.getItem('token');
		allId = localstorage.getItem('allId');       			// 取出 加入
		
		getList();			// 获取商城list
		getInfo();			// 个人信息
		getBalance();		// 获取余额
		setTimeout(function() {
			getAddress();		// 获取默认地址
			getPushInfo();
		}, 300);
	}
	function getToken() {
		mui.post(main_ip+'/api/v1/basic/customer/login',{
				mobile: localstorage.getItem('userMobile'),
				password: localstorage.getItem('userpsw')
		},function(data){
			console.log(JSON.stringify(data) +','+localstorage.getItem('userpsw'));
				if ( data.code == 0) {
					getTokenNum = 0;
					var gainTime = new Date().getTime();               
					localstorage.setItem('expireIn', data.data.expireIn);	//  token 过期时间
					localstorage.setItem('token', data.data.token);     //  token 
					localstorage.setItem('gainTime', gainTime);         //  获取token时间   （毫秒数）
					init();												//  获取其他信息
				} else {
					if ( getTokenNum >= 3 ) {
						return;
					} else {
						getTokenNum++;
						getToken();
					}
				}
			},'json'
		);
	}
	function token_isOutTime(){
		var gainTime = localstorage.getItem('gainTime');	// 获取token时间
		var nowTime = new Date().getTime();					// 现在时间
		var expireIn = localstorage.getItem('expireIn');	// token有效时间
		if ( nowTime >= (parseInt(gainTime) + parseInt(expireIn) - 200 * 1000 - 20 * 60 * 1000)) {        
			// 一个小时四十分钟后 获取token
		    // 现在   <= 获取 + 有效 - 20分钟 - 200秒   五个二十分钟，过去。刷新token
		    getToken();
		}
	}
	var timer = setInterval(function() {					// 20分钟判断1小时40分钟， 超过请求token
		token_isOutTime();
	}, 20 * 60 * 1000);
	function network() {
		wainshow();
		if ( network_flag ) {   // 有网络的情况
	    	plus.nativeUI.showWaiting(' 网络已连接',{
	    		loading: {
	    			display:'inline'
	    		}
	    	});
	    	setTimeout(function() {
	    		plus.nativeUI.closeWaiting();
	    	}, 3000);
	    	getToken();
	    	title.innerHTML = '预约充电';
	    	msg.style.display = 'block';
			mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-charge.html'),'network',{});
			mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-order.html'),'network',{});
			mui.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-mall.html'),'network',{});
			mui.fire(plus.webview.getWebviewById('pages/charge-sub.html'),'network',{});
			mui.fire(plus.webview.getWebviewById('pages/bottom-main.html'),'active',{});
			plus.webview.hide('pages/tab-webview-subpage-setting.html');
		}
	}
	wainshow();
	window.addEventListener('init',function(event) {			// 监听登录
		preload();
		init();
	});
	window.addEventListener('sec-init', function(event) {
		init();
		setTimeout(function(){
			plus.webview.show('pages/bottom-main.html');
			wainshow();
		}, 500)
	});
	window.addEventListener('update-balance',function(event) {	// 预约支付/充值余额/商品余额支付  刷新余额
		getBalance();
	})
	window.addEventListener('update-default-address',function(event) {	// add_address页默认地址 刷新余额
		getAddress();
	})
	window.addEventListener('msg-old', function(event) {          // 消息提示 小红点
		msg_s.classList.remove('msg-pormpt');
	});
	window.addEventListener('update-network', function(event) {
	 	network();
	});
	var activeTab = 'pages/tab-webview-subpage-charge.html';
	window.addEventListener('newid', function(event) {
	 	var targetTab = event.detail.id;
	 	var title_bar = event.detail.title;
		plus.nativeUI.closeWaiting();
//		if ( tab_count != 0 ) {
			if (targetTab == activeTab) {
				return;
			}
//		}
		if ( targetTab == 'pages/tab-webview-subpage-charge.html') {
			title.innerHTML = '预约换电';
			msg.style.display = 'block';
		} else {
			title.innerHTML = title_bar;
			msg.style.display = 'none';
		}
//		console.log(activeTab+ ','+targetTab);
		if ( network_flag ) {
			if ( (mui.os.android && parseInt(plus.os.version) >= 5) || mui.os.ios ) { 
				if(mui.os.ios||aniShow[targetTab]){
					plus.webview.show(targetTab);
				} else {
					var temp = {};
					temp[targetTab] = "true";
					mui.extend(aniShow,temp);
					plus.webview.show(targetTab,"fade-in",200);
				}
			} else {
				plus.webview.show(targetTab);
			}
			plus.webview.hide(activeTab); 
			plus.webview.show('pages/bottom-main.html');
			activeTab = targetTab;
		} else {
			if (targetTab == 'pages/tab-webview-subpage-setting.html') {
				plus.webview.show('pages/tab-webview-subpage-setting.html');
				plus.webview.hide('pages/net-error.html');
			} else {
				plus.webview.show('pages/net-error.html');
			}
			activeTab = targetTab;
		}
	})
	// 打开消息页
	msg.addEventListener('tap',function(){
		mui.openWindow({
			url:"pages/news.html",
			id: 'news.html',
			styles: {
				popGesture: 'close'
			},
			show:{
				aniShow: 'pop-in'
			},
			waiting: {
				autoShow: false
			}
		})
	}) 

	mui.oldBack = mui.back;
	var backButtonPress = 0;
	mui.back = function(event) {
		backButtonPress++;
		if (backButtonPress > 1) {
			localstorage.setItem('token', null);  
			localstorage.setItem('sec-login', 'false');  // 退出应用，二次登录为false
			// 退出清除当前token，避免 mall order token判断为已获取
			// 并且，每次退出之后， token都会重新获取;
			plus.runtime.quit();
		} else {
			plus.nativeUI.toast('再按一次退出应用');
		}
		setTimeout(function() {
			backButtonPress = 0;
		}, 2000);
		return false;
	};
});
