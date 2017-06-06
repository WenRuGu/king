
	mui.init();
(function($, doc) { 
	var reg = doc.getElementById('register');
	var phone = doc.getElementsByClassName('phone-num')[0];
	var news = doc.getElementsByClassName('prompt-news')[0];
	var re = /^1[3|4|5|7|8][0-9]{9}$/;
	
	var localstorage = window.localStorage;  
	var goods_ip = localstorage.getItem('ip');
	$.plusReady(function() {
		plus.webview.currentWebview().setStyle({scrollIndicator:'none'});
		phone.addEventListener('input', function() {
			if ( phone.value == '' ) {
				reg.setAttribute('disabled', 'disabled');
			} else {
				reg.disabled = false;
			}
		})
		reg.addEventListener('tap',function() {
			var flag = re.test(phone.value);      // 简单验证手机号格式
			if ( flag ) {
				mui.ajax( goods_ip+'/api/v1/basic/customer/mobile_exist',{    //  验证手机号是否存在
					data:{
						mobile: phone.value
					},
					dataType:'json',
					type:'post',//HTTP请求类型
					timeout:6000,	              
					success:function(data){
						console.log(JSON.stringify(data));
						if ( data.code == 0 ) {
							$.openWindow({
								url: 'register-2.html',
								id: 'register-2.html',
								extras:{
									phone_num: phone.value
								},
								styles: {
									popGesture: 'none'
								},
								show: {
									aniShow: 'slide-in-right',
								},
								waiting: {
									autoShow: false
								}
							});
						} else {
							plus.nativeUI.toast('请输入正确的手机号');
						}
					},
					error:function(xhr,type,errorThrown){
						//异常处理；
						console.log(type);
					}
				});
			} else {
				plus.nativeUI.toast('请输入正确的手机号');
			}
		})
	})
	
}(mui, document));





























