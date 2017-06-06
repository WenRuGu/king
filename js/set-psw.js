
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
	
	var localstorage = window.localStorage;  
	var goods_ip = localstorage.getItem('ip');
	$.plusReady(function() {
		self = plus.webview.currentWebview();
//		console.log(self.authcode);
		function register(){
			
			plus.nativeUI.showWaiting();
			mui.post(goods_ip +'/api/v1/basic/customer/register',{
					mobile: self.mobile,
					password: hex_md5("678CAC1884EC98A89E9A269671AEDC28" + hex_sha1("678CAC1884EC98A89E9A269671AEDC28" + sec_psw.value).toUpperCase()).toUpperCase(),
					authCode: self.authcode
			},function(data){
//				console.log(JSON.stringify(data));
//				console.log( self.authcode);
				plus.nativeUI.closeWaiting();
				if ( data.code == 0) {
					plus.webview.close('register-2.html');
					plus.webview.close('register.html');
					plus.webview.close(self);
					
					plus.nativeUI.toast('注册成功');
				} else if ( data.code == 2 ) {
					plus.nativeUI.alert( data.message, function(){}, '', "确定" );
				} else {
					plus.nativeUI.alert( '注册失败', function(){}, '', "确定" );
				}
				},'json'
			);
		}
		
		function input_disabled(){             // 没有输入内容 禁用 按钮
			if ( first_psw.value == '' || sec_psw.value == ''  ) {
				finish.setAttribute('disabled','disabled');
			} else {
				finish.disabled = false;
			}
		}
		
		first_psw.addEventListener('input', input_disabled);
		sec_psw.addEventListener('input', input_disabled);
		
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
	
}(mui, document))





























