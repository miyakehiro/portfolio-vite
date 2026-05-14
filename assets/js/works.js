(function($) {
    "use strict";

    function loadAndRenderJson(jsonUrl, targetElementId, isSlider) {
        $.ajax({
            url: jsonUrl,
            type: "GET",
            dataType: "json",
        })
        .done(function (data) {
            var work_json = data;
            var number = Object.keys(work_json).length;

            var html = "";
            for (let i = 0; i < number; i++) {
                const item = work_json[i];
                const imgHtml = item.img ? `<div class="img"><img src="${item.img}" alt="${item.title}"></div>` : '';
                html += `
                <li class="list__item">
                    <a class="link" href="${item.link}" target="_blank">
                        ${imgHtml}
                        <h3 class="sub-tit ${item.create} ${item.update}">${item.title}</h3>
                    </a>
                </li>
                `;
            }

            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = html;
                if (isSlider && number > 1) {
                    initSlick('#' + targetElementId);
                }
            } else {
                console.error("Target element with ID '" + targetElementId + "' not found.");
            }
        })
        .fail(function (error) {
            console.error("Error loading JSON: " + jsonUrl, error);
        });
    }

    function initSlick(target) {
        const $target = $(target);
        if ($target.length) {
            const width = $(window).width();
            if (width <= 583 && !$target.hasClass('slick-initialized') && $target.children().length > 1) {
                $target.slick({
                    arrows: true,
                    dots: true,
                    autoplay: true,
                    speed: 1500,
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: '30px',
                });
            } else if (width > 584 && $target.hasClass('slick-initialized')) {
                $target.slick('unslick');
            } else if (width <= 584 && $target.hasClass('slick-initialized') && $target.children().length <= 1) {
                $target.slick('unslick');
            }
        }
    }

    // タブクリック時の処理
    if ($('.js-switch-tab').length > 0) {
        $('.js-switch-tab').on('click', function () {
            // --- 1. 全てのリセット ---
            $('.js-switch-tab')
                .removeClass('is-active')
                .attr('aria-selected', 'false');
            
            $('.js-switch-content').removeClass('is-active');

            // --- 2. 選択されたタブのアクティブ化 ---
            $(this)
                .addClass('is-active')
                .attr('aria-selected', 'true');

            // --- 3. aria-controls の値（ID）を使ってコンテンツを特定して表示（より安全な方法） ---
            const targetId = $(this).attr('aria-controls'); // 例: "panel-c" を取得
            const $activeContent = $('#' + targetId);      // id="panel-c" の要素を直接指定
            $activeContent.addClass('is-active');

            // --- 4. スライダーの初期化 ---
            if ($activeContent.hasClass('js-slider')) {
                initSlick('#' + $activeContent.attr('id'));
            }
            $activeContent.find('.js-slider').each(function(){
                initSlick('#' + $(this).attr('id'));
            });
        });
    }

    $(function(){
        loadAndRenderJson("json/works01.json", "js-works01", false);
        loadAndRenderJson("json/works02.json", "js-works02", false);
        loadAndRenderJson("json/works03.json", "js-works03", true);
        loadAndRenderJson("json/works04.json", "js-works04", true);
        loadAndRenderJson("json/works05.json", "js-works05", true);

        $('.js-switch-content.is-active').each(function(){
            if($(this).hasClass('js-slider')) {
                initSlick('#' + $(this).attr('id'));
            }
        });

        let resizeTimer;
        $(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // 1. アクティブなパネル内のスライダーを再計算
                $('.js-switch-content.is-active').each(function(){
                    if($(this).hasClass('js-slider')) {
                        initSlick('#' + $(this).attr('id'));
                    }
                    $(this).find('.js-slider').each(function(){
                        initSlick('#' + $(this).attr('id'));
                    });
                });

                // 2. PCサイズ（600px超）になったら、全パネルのスライダークラスを解除して回る
                if ($(window).width() > 600) {
                    $('.slick-initialized').slick('unslick');
                }
            }, 200);
        });
    });

})(jQuery);