

mui.init();
(function($) {
	
	function $c(id){
		return document.getElementsByClassName(id)[0];
	}
	
	var phone = $c('phone');
	var realName = $c('realName');  //真实名字
	var change_nickname = $c('change-nickname');  // 更改昵称
	var change_realName = $c('change-realName');  // 更改真实姓名
	var change_mobile = $c('change-mobile');      // 修改手机号
	var nickname = $c('nickname');  // 昵称
	var sel_sex = $c('sel-sex');  
	var user_pic = $c('user-pic');  
	var quit_login = $c('quit');
	var change_psw = $c('change-psw');
	var sel_s = $c('sel-s');
	var sex = $c('sex');
	var man = $c('man');
	var woman = $c('woman');
	var black_box = $c('mui-popover');
	var user_span = $c('user-pic-span');
	var portrait = $c('portrait');
	
	var head = document.getElementById('head');
	var self;
	var token;
	var network_flag = true;    // true 网络正常
	var localstorage = window.localStorage;  
	var info_ip = localstorage.getItem('ip');
	
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		self.setStyle({
			scrollIndicator: 'none'
		});
		var pop = new popover('#black-box');
		function wainshow() {
		    if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
		    	network_flag = false;
		    	mui.fire(plus.webview.getLaunchWebview(),'update-network',{});
		    } else {
				network_flag = true;
		    }
		}
		function info() {
			realName.innerHTML = localstorage.getItem('realName'); 	// 真实姓名
			phone.innerHTML = localstorage.getItem('mobile');       // 手机号
			nickname.innerHTML = localstorage.getItem('nickname');  // 昵称
			sex.innerHTML = localstorage.getItem('gender');       	// 性别
			setTimeout(function(){
				user_pic.setAttribute('data-src',localstorage.getItem('portrait'));
				lazyImg.lazyLoad( true );
			}, 125);    										//  本地读取 头像时候，动画 比较卡
		}
		info();
		wainshow();
		$.previewImage();    // 预览头像 初始化
		window.addEventListener('second-reload', function(e) {  // 仅退出登录第一次才能监听到
			info();											    // 防止换账号后第一次显示的是原有的信息
			user_pic.src = localstorage.getItem('portrait');    // 由于退出换账号，personal-info页只是隐藏
			wainshow();
			$.previewImage();
		})
		window.addEventListener('personal-info',function(event){
			plus.nativeUI.closeWaiting();
			info();
		});
		function open(url) {
			$.openWindow({
				id: url,
				url: url,
				show: {
					aniShow: 'slide-in-right'
				},
				styles: {
					popGesture: 'close'
				},
				waiting: {
					autoShow: false
				}
			});
		}
		quit_login.addEventListener('tap', function() {
			plus.nativeUI.confirm('确认退出登录？',function(e) {
				if ( e.index == 0 ) {
					localstorage.setItem('loginFlag', 'false');
					localstorage.setItem('sec-login', 'true');   // 登录了，点击退出登录，再登录
					localstorage.setItem('token', null);
					$.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-order.html'),'quit-init-order', {
						quit:true
					});
					$.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-mall.html'),'quit-init-mall', {
						quit:true
					});
					$.openWindow({
						id:'login.html',
						url: 'login.html',
						styles: {
							popGesture: 'none'
						},
						show: {
							aniShow: 'pop-in',
							duration: 300
						},
						waiting: {
							autoShow: false
						}
					});
				}
			}, '提示',['确定','取消']);
		});
		change_nickname.addEventListener('tap',function() {
			open('nickname.html');
		});
		change_realName.addEventListener('tap',function() {
			open('realName.html');
		});
		change_psw.addEventListener('tap', function() {
			open('change-psw.html');
		});
		sel_sex.addEventListener('tap', function() {
			pop.open();
			if ( sex.innerHTML == '男' ) {
				man.checked = true;
				woman.checked = false;
			} else {
				woman.checked = true;
				man.checked = false;
			}
			setTimeout(function(){
				pop.close();
			}, 10 * 1000)
		})

		function gender(num, sex){
			if ( !network_flag ) {
				mui.toast('网络异常，请检查网络状况');
			}
			token = localstorage.getItem('token');
			var task = plus.uploader.createUpload(info_ip+'/api/v1/basic/customer/update_info', {
				method: 'post', 
				blocksize:204800,
				timeout: 10
			},stateChanged);
			task.addData('gender', num);
			task.addData('token', token);
			task.start();
			function stateChanged(upload, status) {
				if ( upload.state == 4 && status == 200 ) {
					plus.uploader.clear(); //清除上传
					localstorage.setItem('gender',sex);
					sex.innerHTML = sex;
//					console.log(upload.responseText); //服务器返回存在这里
					info();
					plus.nativeUI.toast('修改成功');
				} else {
					plus.nativeUI.alert('更改失败',function() {},'','确定');
				}
			}
		}
		mui('.sel-s').on('tap', 'div:nth-child(2)', function() {
			man.checked = false;
			woman.checked = false;
			gender('1', '男');
			pop.close();
		});
		mui('.sel-s').on('tap', 'div:nth-child(3)', function() {
			woman.checked = false;
			man.checked = false;
			gender('2', '女');
			pop.close();
		});
		change_mobile.addEventListener('tap',function() {
		    
		})
		portrait.addEventListener('tap', function(e) {
				if(mui.os.plus){
					var a = [{
						title: "拍照"
					}, {
						title: "从手机相册选择"
					}];
					plus.nativeUI.actionSheet({
						title: "修改头像",
						cancel: "取消",
						buttons: a
					}, function(b) {
						switch (b.index) {
							case 0:
								break;
							case 1:
								getImage();
								break;
							case 2:
								galleryImg();
								break;
							default:
								break
						}
					})	
				}
			});
	
			function getImage() {
				var openTime = new Date().getTime();
				var closeTime, longTime;
				if ( mui.os.ios) {
					var AVCaptureDevice = plus.ios.importClass("AVCaptureDevice");
					var Status = AVCaptureDevice.authorizationStatusForMediaType("vide");
					if (3 != Status) {
					    var btnArray = ['确定'];
					    mui.confirm(' ','请在设置中允许使用相机',btnArray,function(e) {});
					}
					return;
				}
				var c = plus.camera.getCamera();
				c.captureImage(function(e) {
					plus.io.resolveLocalFileSystemURL(e, function(entry) {
						var s = entry.toLocalURL() + "?version=" + new Date().getTime();
						compressImage(s);
					}, function(e) {
						plus.nativeUI.alert("读取拍照文件错误");
					});
				}, function(s) {
					closeTime = new Date().getTime();
					longTime = closeTime - openTime;
					if ( longTime <= 500 && s.code == 11) {
						plus.nativeUI.alert('请在权限管理中打开相机权限');
					} else {
						plus.nativeUI.toast('用户已取消拍照');
					}
				}, {
					filename: "_doc/head.jpg"
				});
			}
			function galleryImg() {
				plus.gallery.pick(function(a) {
					plus.io.resolveLocalFileSystemURL(a, function(entry) {
						plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
							root.getFile("head.jpg", {}, function(file) {
								//文件已存在
								file.remove(function() {
									entry.copyTo(root, 'head.jpg', function(e) {
											var e = e.fullPath + "?version=" + new Date().getTime();
											compressImage(e);
									},function(e) {
//											console.log('copy image fail:' + e.message);
									});
								}, function() {
//									console.log("delete image fail:" + e.message);
								});
							}, function() {
								//文件不存在
								entry.copyTo(root, 'head.jpg', function(e) {
									var path = e.fullPath + "?version=" + new Date().getTime();
									compressImage(e);
								},
								function(e) {
//										console.log('copy image fail:' + e.message);
								});
							});
						}, function(e) {
//							console.log("get _www folder fail");
						})
					}, function(e) {
						plus.nativeUI.alert("读取拍照文件错误");
					});
				}, function(a) {}, {
					filter: "image"
				})
			};
			function compressImage(src){
				plus.nativeUI.showWaiting();
				plus.zip.compressImage({
					src: '_doc/head.jpg',
					dst:"_downloads/cm.jpg",
					quality: 30,
					format: 'jpg',
					overwrite: true,
					width:'60%'
				},
				function(i){
					plus.nativeUI.closeWaiting();
					uploadHead(i.target);
//					console.log("压缩图片成功："+JSON.stringify(i));
				},function(e){
					plus.nativeUI.closeWaiting();
				});
			}
			function uploadHead(imgPath) { 
				token = localstorage.getItem('token'); 
	            plus.nativeUI.showWaiting();
	            setTimeout(function() {
	            	plus.nativeUI.closeWaiting();
	            }, 6000);
	            var image = new Image(); 
	            image.src = imgPath; 
	            image.onload = function() { 
	                /*在这里调用上传接口*/ 
					var task = plus.uploader.createUpload(info_ip+'/api/v1/basic/customer/update_info', {
						method: 'post', 
						blocksize:20480000,
						timeout: 10
					},stateChanged);
					task.addFile( image.src,{ key:'portrait'});
					task.addData('token', token);
					task.start();
					function stateChanged(upload, status) { 
						plus.nativeUI.closeWaiting();
						if ( upload.state == 4 && status == 200 ) {
							plus.uploader.clear(); //清除上传
//							console.log(upload.responseText); //服务器返回存在这里
							upload.responseText = JSON.parse(upload.responseText);
							if (upload.responseText.code == 0) {
								localstorage.setItem('portrait', upload.responseText.data.portrait);
								user_pic.src = upload.responseText.data.portrait;    
								console.log(upload.responseText.data.portrait);
								// 直接更换路径的话， 仅第一次有用， 压缩（ dst ）的图片的 imgPath 路径是一样的，
								// overwrite = true表示，每次压缩的生成的img 都会被覆盖   但是img会使用缓存  压缩之后使用时间戳
								$.fire(plus.webview.getWebviewById('pages/tab-webview-subpage-setting.html'),'portrait',{});
								mui.toast('上传成功');
							} else {
								plus.nativeUI.alert('上传失败',function() {},'','确定');
							}
						} else {
							plus.nativeUI.alert('上传失败',function() {},'','确定');
						}
					}
	            } 
	    	}; 
	});
}(mui))








































