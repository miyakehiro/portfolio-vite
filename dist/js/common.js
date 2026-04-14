/* ===========================================
common.js
=========================================== */
(function($) {
	"use strict";
/* var
------------------------------------- */
	var $win = $(window),
		speed = 300,
		easing = 'swing';

/* get media query
------------------------------------- */
	function funcIsDevice() {
		return $('.js-media-query').css('font-family').replace(/"/g, '');
	}

/* js-switch-img
------------------------------------- */
	$(function() {
		function funcImageSwitch() {
			$('img[src*="_sp."],img[src*="_pc."]').each(function() {
				if (funcIsDevice() === 'pc') {
					$(this).attr('src', $(this).attr('src').replace('_sp.', '_pc.'));
				} else {
					$(this).attr('src', $(this).attr('src').replace('_pc.', '_sp.'));
				}
			});
		}
		funcImageSwitch();
		var resizeTimer;
		$(window).on('resize', function() {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				funcImageSwitch();
			}, 200);
		});
	});

/* smoothScroll
------------------------------------- */
	//scroll speed
	var speed = 500;
	//pagetop btn
	$('a[href="#top"]').on('click', function() {
		$('body,html').animate({ scrollTop: '0' }, speed, 'swing');
		return false;
	});

	// .js-headerがなかった時は「var headerHeight....」と「 - headerHeightを消してください」
	$(window).on('load',function(){
		//unchor link in site
		var urlHash = location.hash;
		if(urlHash){
	        var target = $(urlHash);

	        if( !target.length ) { return }

	        var headerHeight = $('.js-header').innerHeight();
	        var position = target.offset().top - headerHeight;
	        $('body,html').animate({ scrollTop:position }, speed, easing);
	    }
	});
    //other link
    $('a[href^="#"]:not([href="#top"]):not(".js-no-scroll")').on('click',function(){
        var href= $(this).attr('href'),
            target = $(href === '#' || href === '' ? 'html' : href);

        if( !target.length ) { return }

        var headerHeight = $('.js-header').innerHeight(),
            position = target.offset().top - headerHeight;
        $('body,html').animate({ scrollTop:position }, speed, easing);
        return false;
    });

/* headerFixed
------------------------------------- */
var startPos = 0,
winScrollTop = 0;
$(window).on('scroll',function(){
	winScrollTop = $(this).scrollTop();
	if( winScrollTop > startPos ) {
		if(winScrollTop >= 200) {
			$('.js-header').addClass('is_active');
		}
	} else if( startPos > winScrollTop ) {
		$('.js-header').removeClass('is_active');
	}
	startPos = winScrollTop;
});

/* pagetop btn
------------------------------------- */
	var $pagetop = $('.js-pagetop'),
		classView = 'is-view';
	$win.on('scroll',function(){
		// fade appear
		if($(this).scrollTop() > 300){
			$pagetop.addClass(classView);
		}else{
			$pagetop.removeClass(classView);
		}

		// stop over footer
		var scrollH = $(document).height();
		var scrollP = $win.height() + $win.scrollTop();
		var footerH = $('.js-footer').innerHeight();
		if(scrollH - scrollP <= footerH){
			$pagetop.css({'position': 'absolute', 'bottom': footerH + 'px'});
		}else{
			$pagetop.removeAttr('style');
		}
	});


/* hamburger menu
------------------------------------- */
	var $navBtn = $('.js-nav-btn'),
		$navCon = $('.js-nav-content'),
		$logo = $('.js-logo'),
		$navChara = $('.js-nav-chara'),
		$navOverlay = $('.js-nav-overlay'),
		class_open = 'is-open';
	function funcNaviOpen(){
		$navOverlay.fadeIn(speed);
		$navCon.addClass(class_open);
		$logo.addClass(class_open);
		$navBtn.addClass(class_open);
		$navChara.text('CLOSE');
	}
	function funcNaviReset(){
		$navOverlay.fadeOut(speed);
		$logo.removeClass(class_open);
		$navCon.removeClass(class_open);
		$navBtn.removeClass(class_open);
		$navChara.text('MENU');
	}
	$navBtn.on('click',function(){
		if($navCon.hasClass(class_open)) {
			funcNaviReset();
			return false;
		} else {
			funcNaviOpen();
			return false;
		}
	});
	$navOverlay.on('click',function(){
		funcNaviReset();
	});
	$navCon.on('click',function(event){
		event.stopPropagation();
	});
	/* tabs switch
	------------------------------------- */
	if ( $('.js-switch-tab').length > 0 ){
		var $switch_tab = $('.js-switch-tab'),
			$switch_con = $('.js-switch-content'),
			class_active = 'is-active';

		$switch_tab.on('click',function(){
			//num set
			var num = $switch_tab.index(this);

			//class="is_active" set in content
			$switch_con.removeClass(class_active);
			$switch_con.eq(num).addClass(class_active);

			//class="is_active" set in tab
			$switch_tab.removeClass(class_active);
			$(this).addClass(class_active);
		});
	}




/* toggle
------------------------------------- */
if ( $('.js-toggle-trigger').length > 0 ){
	var	$toggleTrigger = $('.js-toggle-trigger'),
		classActive = 'is-active';
	$toggleTrigger.on('click',function(){
		$(this).toggleClass(classActive);
		$(this).next('.js-toggle-content').slideToggle(speed);
	});
}


	/* js-anime-elem
	------------------------------------- */
	$(function(){
	    // fade in
	    window.onload = function() {
	        setTimeout(function(){
				scroll_effect();
				$('.js-anime').addClass('is_animated');
	        },500);
	    }
	    $(window).scroll(function() {
			scroll_effect();
	    });

	    //fadein
	    function scroll_effect() {
	        $('.js-anime-elem').each(function() {
	            var elemPos = $(this).offset().top,
	                scrollPos = $(window).scrollTop(),
	                windowHeight = $(window).height();
	            if ( scrollPos > elemPos - windowHeight ) {
	                $(this).addClass('is_animated');
	            }
	        });
	    }
	});

})(jQuery);
