!function () {
    const pjaxContainerSelector = '#pjax-container';
    const pjaxLinkSelector = '.nagoya-nav-link[href], .nagoya-product-main[href], .nagoya-product-buy[href]';
    let lastPjaxUrl = '';

    function isPlainLeftClick(event) {
        return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.which > 1);
    }

    function isPjaxEligible(link) {
        const href = String(link.getAttribute('href') || '').trim();

        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return false;
        }

        if (link.hasAttribute('download') || link.getAttribute('target') === '_blank') {
            return false;
        }

        try {
            const url = new URL(href, window.location.href);

            if (url.origin !== window.location.origin) {
                return false;
            }

            return /^\/($|item\/|cat\/|user\/index\/query)/.test(url.pathname.replace(/^\//, '') ? `/${url.pathname.replace(/^\//, '')}` : url.pathname);
        } catch (error) {
            return false;
        }
    }

    function collapseMobileNav() {
        $('#nagoyaNavMenu').removeClass('show');
        $('.nagoya-nav-toggle').addClass('collapsed').attr('aria-expanded', 'false');
    }

    function syncActiveNav(pathname) {
        const currentPath = String(pathname || window.location.pathname || '/');
        const isQueryPage = currentPath.indexOf('/user/index/query') === 0;

        $('.nagoya-nav-link[href]').removeClass('is-active').each(function () {
            const href = String($(this).attr('href') || '').trim();

            if (isQueryPage && href === '/user/index/query') {
                $(this).addClass('is-active');
                return;
            }

            if (!isQueryPage && href === '/') {
                $(this).addClass('is-active');
            }
        });
    }

    function cleanupSharedHandlers() {
        $(document).off('click', '.pay-list .pay');
    }

    function submitSearch(value) {
        const keyword = String(value || '').trim();

        if (!keyword) {
            if (typeof message !== 'undefined') {
                message.error('请输入要搜索的商品关键词');
            }
            return false;
        }

        if (typeof window.nagoyaSearchProducts === 'function' && $('.nagoya-page').length > 0) {
            window.nagoyaSearchProducts(keyword);
            return true;
        }

        window.location.href = `/?nagoya_search=${encodeURIComponent(keyword)}`;
        return true;
    }

    function initPjax() {
        if (typeof $ === 'undefined' || typeof $.pjax !== 'function') {
            return;
        }

        $(document).off('click.nagoyaPjax', pjaxLinkSelector).on('click.nagoyaPjax', pjaxLinkSelector, function (event) {
            if (!isPlainLeftClick(event) || !isPjaxEligible(this)) {
                return;
            }

            $.pjax.click(event, {
                container: pjaxContainerSelector,
                fragment: pjaxContainerSelector,
                timeout: 10000,
                scrollTo: false
            });
        });

        $(document).off('pjax:start.nagoyaPjax').on('pjax:start.nagoyaPjax', function (event, xhr, options) {
            lastPjaxUrl = options && options.url ? options.url : '';
            cleanupSharedHandlers();
            collapseMobileNav();
            $(pjaxContainerSelector).addClass('is-pjax-loading');
        });

        $(document).off('pjax:end.nagoyaPjax').on('pjax:end.nagoyaPjax', function () {
            $(pjaxContainerSelector).removeClass('is-pjax-loading');
            syncActiveNav(window.location.pathname);

            if (typeof window.scrollTo === 'function') {
                window.scrollTo({top: 0, behavior: 'auto'});
            }
        });

        $(document).off('pjax:error.nagoyaPjax').on('pjax:error.nagoyaPjax', function (event, xhr, textStatus, errorThrown, options) {
            $(pjaxContainerSelector).removeClass('is-pjax-loading');
            event.preventDefault();
            window.location.href = options && options.url ? options.url : (lastPjaxUrl || window.location.href);
        });
    }

    $(document).off('submit.nagoyaSearch', '.nagoya-nav-search-form').on('submit.nagoyaSearch', '.nagoya-nav-search-form', function (event) {
        event.preventDefault();
        const $form = $(this);
        const $input = $form.find('.nagoya-nav-search-input');
        const handled = submitSearch($input.val());

        if (handled) {
            collapseMobileNav();
            $input.trigger('blur');
        } else {
            $input.trigger('focus');
        }
    });

    syncActiveNav(window.location.pathname);
    initPjax();
}();
