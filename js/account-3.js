

(function($, doc){
	$.init();
	
	var next = doc.getElementById('next');
	var time_s = doc.getElementsByClassName('time-s')[0];
	var user_phone = doc.getElementsByClassName('user-phone')[0];
	var pin = doc.getElementsByClassName('pin')[0]; //验证码
	var span_s = doc.getElementsByClassName('span-s')[0];
	var gain = doc.getElementsByClassName('gain')[0];
	var self;
	
	var re = /(\d{3})\d{4}(\d{4})/; // 3****4
	var re_six = /^[0-9]{6}$/;
	var re_e = /(?!)^[e]$/;
	var count = 60;
	var authCode;
	var mobile;
	var localstorage = window.localStorage;  
	var reset_ip = localstorage.getItem('ip');
	//input
	pin.addEventListener('input', function() {
		if ( pin.value == '' ) {
			next.setAttribute('disabled','disabled');
		} else {
			next.disabled = false;
		}
	})
		
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		mobile = self.mobile;
		user_phone.innerText = mobile.replace(re, '$1****$2');
		
		function authcode() {
			mui.post(reset_ip + '/api/v1/basic/auth_code/get',{
					mobile: mobile
			},function(data){
				if( data.code == 0 ) {
					gain_sixty();
				} else {
					mui.toast(data.message);
				}
				},'json'
			);
		}
		function gain_sixty () {
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
		authcode();
		time_s.addEventListener('tap', function() {
			if ( count == 60 ) {
				mui.toast('正在获取');
				authcode();
			}
		})
		next.addEventListener('tap', function() {   // 
			
			if ( re_six.test(pin.value) ) {
				mui.post(reset_ip + '/api/v1/basic/auth_code/check_ok',{     // 验证 验证码是否正确
						authCode: pin.value,
						mobile: mobile
				},function(data){
					console.log(JSON.stringify(data));
						if ( data.code == 0 ) {
							$.openWindow({
								url: 'reset-psw.html',
								id: 'reset-psw.html',
								show: {
									aniShow: 'pop-in'
								},
								waiting: {
									autoShow: false
								},
								styles: {
									popGesture: 'close'
								},
								extras: {
									phone_num: mobile,
									authCode: pin.value
								}
							});
						} else {
							plus.nativeUI.toast('验证码错误');
						}
					},'json'
				);	
			} else {
				plus.nativeUI.toast('验证码错误');
			}
		})
	})
	
}(mui, document));





























