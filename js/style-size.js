//var map_top;
(function (doc, win) {
	var map_box = doc.getElementsByClassName('map-box')[0];
	var mapa = doc.getElementById('map');
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      docEl.style.fontSize = 50 * (clientWidth / 375) + 'px';
//			map_top = 50 * (clientWidth / 375) * 6 + 23;					// charge top的距离
//			if ( map_box != undefined) {													// 判断   加载map-box map高度
//				map_box.style.height = 50 * (clientWidth / 375) * 6 + 20+'px';
//				mapa.style.height = 50 * (clientWidth / 375) * 6 + 'px';
//			}
			
    };
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);

function getStyle( obj , attr ){
	if ( window.getComputedStyle ) {
		return getComputedStyle( obj , null )[attr];
	}else{
		return obj.currentStyle[attr];
	}
}