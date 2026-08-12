!function () {
    const $coverCard = $('.nagoya-item-cover-card');
    const $coverTrigger = $('.nagoya-item-cover-trigger');
    const $coverImage = $('.item-cover');
    const $formWrap = $('.nagoya-item-content-inner');
    let previewCache = { src: '', loaded: false };

    if ($coverCard.length === 0 || $coverImage.length === 0 || $formWrap.length === 0) {
        return;
    }

    function isDesktopViewport() {
        return window.matchMedia('(min-width: 992px)').matches;
    }

    function syncCoverHeight() {
        if (!isDesktopViewport()) {
            $coverCard.css('--nagoya-item-cover-height', '');
            return;
        }

        const formHeight = Math.ceil($formWrap.outerHeight() || 0);

        if (formHeight <= 0) {
            return;
        }

        $coverCard.css('--nagoya-item-cover-height', `${formHeight}px`);
    }

    function scheduleSync() {
        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(syncCoverHeight);
            return;
        }

        syncCoverHeight();
    }

    function openImagePreview() {
        const imageSrc = String($coverTrigger.data('image') || $coverImage.attr('src') || '').trim();
        const imageTitle = String($coverTrigger.data('title') || $coverImage.attr('alt') || '商品图片').trim();

        if (!imageSrc || typeof layer === 'undefined') {
            return;
        }

        const safeTitle = $('<div>').text(imageTitle).html();
        const safeSrc = $('<div>').text(imageSrc).html();

        function showPreview() {
            layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                shadeClose: true,
                area: window.innerWidth <= 767 ? ['calc(100% - 24px)', 'auto'] : ['auto', 'auto'],
                shade: [0.48, 'rgba(0, 0, 0, 0.9)'],
                skin: 'nagoya-image-layer',
                content: `
                    <div class="nagoya-image-preview">
                        <button type="button" class="nagoya-image-preview-close" aria-label="关闭预览">×</button>
                        <img src="${safeSrc}" alt="${safeTitle}">
                    </div>
                `,
                success: function (layero, index) {
                    $(layero).find('.nagoya-image-preview-close').off('click').on('click', function (event) {
                        event.preventDefault();
                        layer.close(index);
                    });
                }
            });
        }

        if (previewCache.src === imageSrc && previewCache.loaded) {
            showPreview();
            return;
        }

        const preloadImage = new window.Image();
        previewCache = { src: imageSrc, loaded: false };

        preloadImage.onload = function () {
            previewCache = { src: imageSrc, loaded: true };
            showPreview();
        };

        preloadImage.onerror = function () {
            showPreview();
        };

        preloadImage.src = imageSrc;
    }

    function bindEvents() {
        $coverTrigger.off('click.nagoyaItem').on('click.nagoyaItem', function (event) {
            event.preventDefault();
            openImagePreview();
        });

        $coverTrigger.off('keydown.nagoyaItem').on('keydown.nagoyaItem', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            openImagePreview();
        });

        $(window).off('resize.nagoyaItem orientationchange.nagoyaItem').on('resize.nagoyaItem orientationchange.nagoyaItem', scheduleSync);
        $coverImage.off('load.nagoyaItem').on('load.nagoyaItem', scheduleSync);
    }

    function observeLayout() {
        if (window.__nagoyaItemResizeObserver && typeof window.__nagoyaItemResizeObserver.disconnect === 'function') {
            window.__nagoyaItemResizeObserver.disconnect();
        }

        if (typeof ResizeObserver !== 'function') {
            window.setTimeout(scheduleSync, 160);
            window.setTimeout(scheduleSync, 420);
            window.setTimeout(scheduleSync, 900);
            return;
        }

        const observer = new ResizeObserver(() => {
            scheduleSync();
        });

        observer.observe($formWrap.get(0));
        window.__nagoyaItemResizeObserver = observer;
    }

    bindEvents();
    observeLayout();
    scheduleSync();
    window.setTimeout(scheduleSync, 220);
    window.setTimeout(scheduleSync, 640);
}();
