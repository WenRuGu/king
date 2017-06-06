

(function($, doc){
		$.init();
	
		var next = doc.getElementById('next');
		var time_s = doc.getElementsByClassName('time-s')[0];
		var user_phone = doc.getElementsByClassName('user-phone')[0];   // 手机号
		var pin = doc.getElementsByClassName('pin')[0]; //验证码
		var span_s = doc.getElementsByClassName('span-s')[0];   // 60秒
		var gain = doc.getElementsByClassName('gain')[0];       // 再次获取
		var self;
		var code;
		var phone_num;
		var re_six = /^[0-9]{6}$/;
		var re = /\B(?=(?:\d{4})+$)/g; // 344
		var count = 60;
		
		var localstorage = window.localStorage;  
		var goods_ip = localstorage.getItem('ip');
//		span_s.style.display = 'none';
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		phone_num = self.phone_num;
		user_phone.innerText = '+86 ' + phone_num.replace(re, ' ');
		
		function gain_sixty () {    // 定时器
			if ( count <= 1 ) {
				count = 60;
				span_s.innerHTML = 60;
				time_s.style.backgroundColor = '#38f';
				span_s.style.display = 'none';
				gain.style.width = '100%';
				gain.innerHTML = '获取验证码';
				gain.style.textAlign = 'center';
				gain.style.color = '#fefefe';
			} else {
				count--;
				span_s.innerHTML = count;
				time_s.style.backgroundColor = '#fff';
				span_s.style.display = 'block';
				gain.style.width = '65%';
				gain.innerHTML = '再次获取';
				gain.style.textAlign = 'left';
				gain.style.color = '#999';
				setTimeout(function() {
					gain_sixty();
				}, 1000);
			}
		}
		function authcode() {
			console.log(goods_ip+','+phone_num);
			mui.post( goods_ip+'/api/v1/basic/auth_code/get',{
				mobile: phone_num
			},function(data){
				console.log(JSON.stringify(data));
					if( data.code == 0 ) {
						gain_sixty();
					} else {
						mui.toast('获取验证码失败');
					}
				},'json'
			);
		}
		authcode();
		time_s.addEventListener('tap', function() {
			if ( count == 60 ) {
				mui.toast('正在获取');
				authcode();
			}
		})
		next.addEventListener('tap', function() {
			if ( !re_six.test(pin.value)  ) {
				plus.nativeUI.toast('验证码错误');
				return;
			}
			mui.post( goods_ip+'/api/v1/basic/auth_code/check_ok',{     // 验证 验证码是否正确
					authCode: pin.value,
					mobile: phone_num
			},function(data){
				console.log(JSON.stringify(data));
					if ( data.code == 0 ) {
						$.openWindow({
							url: 'set-psw.html',
							id: 'set-psw.html',
							show: {
								aniShow: 'slide-in-right'
							},
							styles: {
								popGesture: 'close'
							},
							waiting: {
								autoShow: false
							},
							extras: {
								mobile: phone_num,     // 手机号码
								authcode: pin.value	   // 验证码
							}
						});
						
					} else {
						plus.nativeUI.toast('验证码错误');
					}
				},'json'
			);	
		})
	})
		//input
	pin.addEventListener('input', function() {
		if ( pin.value == '' ) {
			next.setAttribute('disabled','disabled');
		} else {
			next.disabled = false;
		}
	})
	
}(mui, document));





























