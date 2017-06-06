
(function($,doc) {
	
	$.init();
	
	var first_psw = doc.getElementsByClassName('first-psw')[0];
	var sec_psw = doc.getElementsByClassName('second-psw')[0];
	var news = doc.getElementsByClassName('prompt-news')[0];
	var finish = doc.getElementsByClassName('finish')[0];
	var re = /(^s*)|(s*$)/; 
	var re_psw = /^[\w]{6,12}$/;  //6-12数字字母正则
	var flag = false;
	var self;
	var phone_num;
	var authCode;
	
	var localstorage = window.localStorage;  
	var reset_ip = localstorage.getItem('ip');
	
	$.plusReady(function() {
		self = plus.webview.currentWebview();
		phone_num = self.phone_num;        // 忘记密码 的 手机号
		authCode = self.authCode;          // 接收的验证码
		console.log(authCode+'，'+phone_num);
		function register(){
			var newPsw = hex_md5("678CAC1884EC98A89E9A269671AEDC28" + (hex_sha1("678CAC1884EC98A89E9A269671AEDC28" + sec_psw.value)).toUpperCase()).toUpperCase();
			mui.post(reset_ip+'/api/v1/basic/customer/forget_password',{
					mobile: phone_num,
					password: newPsw,
					authCode: authCode
			},function(data){
					console.log(JSON.stringify(data));
					if ( data.code == 0){
						localstorage.setItem('userpsw', newPsw);
						plus.webview.close('account-3.html');
						plus.webview.close('account-2.html');
						plus.webview.close('account-1.html');
						plus.webview.close('account.html');
						plus.nativeUI.toast('设置成功');
						plus.webview.close(self);
					} else if ( data.code == 2 ) {
						plus.nativeUI.alert( data.message, function(){}, '', "确定" );
					} else {
						plus.nativeUI.alert( "设置失败", function(){}, '', "确定" );
					}
				},'json'
			);
		}
		finish.addEventListener('tap', function() {
			if( re_psw.test(first_psw.value) ){
				if (first_psw.value == sec_psw.value) {
					register();
				} else {
					plus.nativeUI.toast('两次密码不一致');
					sec_psw.value = '';
				}
			} else {
				plus.nativeUI.toast('请输入6-12数字或字母');
			}
		});
	})
	
	function input_disabled(){
		if ( first_psw.value == '' || sec_psw.value == ''  ) {
			finish.setAttribute('disabled','disabled');
		} else {
			finish.disabled = false;
		}
	}
	
	first_psw.addEventListener('input', input_disabled);
	sec_psw.addEventListener('input', input_disabled);
	
	
}(mui, document))





























