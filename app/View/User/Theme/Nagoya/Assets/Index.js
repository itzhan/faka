!function () {
    const $page = $('.nagoya-page');

    if ($page.length === 0) {
        return;
    }

    const $levels = $('#nagoya-category-levels');
    const $rootRail = $('#nagoya-root-rail');
    const $dropdown = $('#nagoya-category-dropdown');
    const $flyout = $('#nagoya-category-flyout');
    const $flyoutClose = $('#nagoya-flyout-close');
    const $categoryBrowser = $('.nagoya-category-browser');
    const $mobileCategoryTrigger = $('#nagoya-mobile-category-trigger');
    const $mobileCategoryBackdrop = $('#nagoya-mobile-category-backdrop');
    const $mobileCategoryClose = $('#nagoya-mobile-category-close');
    const $crumbs = $('#nagoya-category-crumbs');
    const $path = $('#nagoya-category-path');
    const $summaryLabel = $('#nagoya-category-summary-label');
    const $productsTitle = $('.nagoya-products-title');
    const $productGrid = $('#nagoya-product-grid');
    const $productsStage = $('#nagoya-products-stage');
    const defaultCategoryId = String($page.data('defaultCategory') || '').trim();
    const isUserLoggedIn = Number($page.data('userLoggedIn')) === 1;
    const showSold = Number($page.data('showSold')) === 1;
    const initialSearchKeyword = new URLSearchParams(window.location.search).get('nagoya_search') || '';

    let categoryTree = [];
    let categoryMap = new Map();
    let parentMap = new Map();
    let activePathIds = [];
    let activeLeafId = '';
    let isSearchMode = false;
    let flyoutOpen = false;
    let flyoutAnchorLeft = null;
    let flyoutAnchorRootId = '';
    let commodityRequestToken = 0;
    let flyoutAnimationTimer = 0;
    let mobileDrawerOpen = false;

    function escapeHtml(value) {
        const safe = value === null || value === undefined ? '' : value;
        return String(safe).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function rawHtml(value) {
        return value === null || value === undefined ? '' : String(value);
    }

    function stripHtml(value) {
        return $('<div>').html(value || '').text();
    }

    function getCategoryIcon(node) {
        return escapeHtml((node && node.icon) || '/favicon.ico');
    }

    function formatPrice(value) {
        if (typeof format !== 'undefined' && typeof format.amountRemoveTrailingZeros === 'function') {
            return format.amountRemoveTrailingZeros(value);
        }
        const numeric = Number(value);
        if (Number.isNaN(numeric)) {
            return value;
        }
        return numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    }

    function isMobileViewport() {
        return window.matchMedia('(max-width: 767px)').matches;
    }

    function toPriceNumber(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    }

    function toCountNumber(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    }

    function request(url, data = {}) {
        return new Promise((resolve, reject) => {
            const search = new URLSearchParams();

            Object.entries(data).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    search.append(key, value);
                }
            });

            $.get({
                url: `${url}${search.toString() ? `?${search.toString()}` : ''}`,
                success: res => {
                    if (res.code !== 200) {
                        reject(res);
                        return;
                    }
                    resolve(res.data);
                },
                error: reject
            });
        });
    }

    function hasChildren(node) {
        return Boolean(node && Array.isArray(node.children) && node.children.length > 0);
    }

    function hydrateAggregateCounts(nodes) {
        if (!Array.isArray(nodes)) {
            return 0;
        }

        return nodes.reduce((total, node) => {
            const ownCount = toCountNumber(node && node.commodity_count);
            const childCount = hasChildren(node) ? hydrateAggregateCounts(node.children) : 0;
            const mergedCount = ownCount + childCount;

            node.commodity_count = mergedCount;
            return total + mergedCount;
        }, 0);
    }

    function walkCategories(nodes, trail = [], parentId = null) {
        nodes.forEach(node => {
            const id = String(node.id);
            const mapped = {
                ...node,
                id,
                __path: trail.concat(node.name)
            };

            categoryMap.set(id, mapped);
            parentMap.set(id, parentId);

            if (hasChildren(node)) {
                walkCategories(node.children, mapped.__path, id);
            }
        });
    }

    function getAncestryIds(id) {
        const path = [];
        let current = String(id || '');

        while (current && categoryMap.has(current)) {
            path.unshift(current);
            current = parentMap.get(current) || '';
        }

        return path;
    }

    function getFirstLeafId(nodes) {
        for (const node of nodes) {
            if (!hasChildren(node)) {
                return String(node.id);
            }

            const childLeafId = getFirstLeafId(node.children);
            if (childLeafId) {
                return childLeafId;
            }
        }

        return '';
    }

    function updateHero(title, summary, productsTitle = title) {
        $productsTitle.html(productsTitle);
    }

    function setProductsMessage(message) {
        $productGrid.html(`<div class="nagoya-products-empty">${escapeHtml(message)}</div>`);
    }

    function setCategorySummary(content) {
        $summaryLabel.html(content);
    }

    function renderPath() {
        if (isSearchMode) {
            $path.html('<span>搜索结果</span>');
            return;
        }

        if (activePathIds.length === 0) {
            $path.html('<span>全部商品</span>');
            return;
        }

        const html = activePathIds.map(id => {
            const node = categoryMap.get(id);
            return `<span>${rawHtml(node ? node.name : '')}</span>`;
        }).join('<i class="fa-duotone fa-regular fa-angle-right"></i>');

        $path.html(html);
    }

    function getFlyoutState() {
        if (categoryTree.length === 0) {
            return {
                visible: false,
                label: '<span class="nagoya-category-summary-text">请选择子分类</span>',
                nodes: [],
                selectedId: ''
            };
        }

        if (isSearchMode || activePathIds.length === 0 || !flyoutOpen) {
            return {
                visible: false,
                label: `<span class="nagoya-category-summary-text">${escapeHtml(isSearchMode ? '搜索结果' : '点击主分类浏览子级')}</span>`,
                nodes: [],
                selectedId: ''
            };
        }

        const rootId = activePathIds[0];
        const rootNode = rootId ? categoryMap.get(rootId) : null;
        const rootLabel = rootNode ? `
            <span class="nagoya-category-summary-chip">
                <span class="nagoya-category-summary-chip-icon">
                    <img src="${getCategoryIcon(rootNode)}" alt="${escapeHtml(stripHtml(rootNode.name))}">
                </span>
                <span class="nagoya-category-summary-chip-name">${rawHtml(rootNode.name)}</span>
            </span>
        ` : '<span class="nagoya-category-summary-text">请选择子分类</span>';

        const currentId = activePathIds[activePathIds.length - 1];
        const currentNode = categoryMap.get(currentId);

        if (currentNode && hasChildren(currentNode)) {
            return {
                visible: true,
                label: rootLabel,
                nodes: currentNode.children,
                selectedId: ''
            };
        }

        const parentId = parentMap.get(currentId);
        const parentNode = parentId ? categoryMap.get(parentId) : null;

        if (parentNode && Array.isArray(parentNode.children)) {
            return {
                visible: true,
                label: rootLabel,
                nodes: parentNode.children,
                selectedId: currentId
            };
        }

        return {
            visible: false,
            label: '点击主分类浏览子级',
            nodes: [],
            selectedId: currentId
        };
    }

    function buildRootRail() {
        const selectedRootId = activePathIds[0] || '';
        const focusedNode = activePathIds.length > 1
            ? categoryMap.get(activePathIds[activePathIds.length - 1]) || null
            : null;

        return categoryTree.map(node => {
            const id = String(node.id);
            const branch = hasChildren(node);
            const active = selectedRootId === id;
            const displayNode = active && focusedNode ? focusedNode : node;
            const count = Number((displayNode && displayNode.commodity_count) || 0);
            const arrowClass = branch && active && flyoutOpen ? 'fa-angle-up' : 'fa-angle-down';

            return `
                <button type="button" class="nagoya-root-tab ${active ? 'is-active' : ''}" data-id="${escapeHtml(id)}" data-has-children="${branch ? 1 : 0}">
                    <span class="nagoya-root-tab-icon">
                        <img src="${getCategoryIcon(displayNode)}" alt="${escapeHtml(stripHtml(displayNode ? displayNode.name : node.name))}">
                    </span>
                    <span class="nagoya-root-tab-copy">
                        <span class="nagoya-root-tab-name">${rawHtml(displayNode ? displayNode.name : node.name)}</span>
                        <span class="nagoya-root-tab-meta">共 ${escapeHtml(count)} 件商品</span>
                    </span>
                    ${branch ? `<span class="nagoya-root-tab-arrow"><i class="fa-duotone fa-regular ${arrowClass}"></i></span>` : ''}
                </button>
            `;
        }).join('');
    }

    function buildFlyoutItems(nodes, selectedId) {
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return '<div class="nagoya-level-empty">当前层级没有更多子分类。</div>';
        }

        return nodes.map(node => {
            const id = String(node.id);
            const branch = hasChildren(node);
            const active = selectedId === id;
            const meta = branch
                ? '继续浏览'
                : `共 ${Number(node.commodity_count || 0)} 件`;

            return `
                <button type="button" class="nagoya-flyout-item ${active ? 'is-active' : ''}" data-id="${escapeHtml(id)}" data-has-children="${branch ? 1 : 0}">
                    <span class="nagoya-flyout-item-icon">
                        <img src="${getCategoryIcon(node)}" alt="${escapeHtml(stripHtml(node.name))}">
                    </span>
                    <span class="nagoya-flyout-item-copy">
                        <span class="nagoya-flyout-item-name">${rawHtml(node.name)}</span>
                        <span class="nagoya-flyout-item-meta">${escapeHtml(meta)}</span>
                    </span>
                    <span class="nagoya-flyout-item-arrow">
                        <i class="fa-duotone fa-regular ${branch ? 'fa-angle-right' : 'fa-circle-small'}"></i>
                    </span>
                </button>
            `;
        }).join('');
    }

    function buildCrumbs() {
        if (activePathIds.length === 0) {
            return '';
        }

        return activePathIds.map((id, index) => {
            const node = categoryMap.get(id);
            const branch = node ? hasChildren(node) : false;
            const current = index === activePathIds.length - 1;

            return `
                <button type="button" class="nagoya-crumb ${current ? 'is-current' : ''}" data-id="${escapeHtml(id)}" data-has-children="${branch ? 1 : 0}">
                    <span>${rawHtml(node ? node.name : '')}</span>
                </button>
            `;
        }).join('<i class="fa-duotone fa-regular fa-angle-right nagoya-crumb-separator"></i>');
    }

    function renderLevels() {
        if (categoryTree.length === 0) {
            $rootRail.html('<div class="nagoya-level-empty">当前没有可展示的分类。</div>');
            $flyout.attr('hidden', true);
            $flyout.removeClass('is-visible is-animating');
            $flyout.css({left: '', top: '', display: ''});
            $crumbs.empty();
            $levels.html('<div class="nagoya-level-empty">当前没有可展示的分类。</div>');
            setCategorySummary('暂无分类');
            renderPath();
            return;
        }

        const flyoutState = getFlyoutState();

        $rootRail.html(buildRootRail());
        setCategorySummary(flyoutState.label);

        if (!flyoutState.visible) {
            $flyout.attr('hidden', true);
            $flyout.removeClass('is-visible is-animating');
            $flyout.css({left: '', top: '', display: ''});
            $crumbs.empty();
            $levels.empty();
            renderPath();
            return;
        }

        $flyout.removeAttr('hidden');
        $flyout.css('display', 'grid');
        $flyout.addClass('is-visible');
        $crumbs.html(buildCrumbs());
        $levels.html(buildFlyoutItems(flyoutState.nodes, flyoutState.selectedId));
        renderPath();
        positionFlyout();
        animateFlyout();
    }

    function positionFlyout() {
        if ($flyout.is('[hidden]') || $dropdown.length === 0) {
            return;
        }

        if (window.matchMedia('(max-width: 767px)').matches) {
            $flyout.css({left: '', top: ''});
            return;
        }

        const rootId = activePathIds[0];
        const $anchor = rootId
            ? $rootRail.find(`.nagoya-root-tab[data-id="${rootId}"]`)
            : $();

        if ($anchor.length === 0) {
            $flyout.css({left: '', top: ''});
            return;
        }

        const dropdownWidth = $dropdown.innerWidth() || 0;
        const flyoutWidth = $flyout.outerWidth() || 380;
        const flyoutHeight = $flyout.outerHeight() || 260;
        const anchorLeft = $anchor.position().left;
        const anchorTop = $anchor.position().top;

        if (flyoutAnchorRootId !== String(rootId) || flyoutAnchorLeft === null) {
            let left = anchorLeft;
            left = Math.max(0, Math.min(left, Math.max(0, dropdownWidth - flyoutWidth)));
            flyoutAnchorLeft = left;
            flyoutAnchorRootId = String(rootId);
        }

        const top = anchorTop - flyoutHeight - 12;

        $flyout.css({
            left: `${flyoutAnchorLeft}px`,
            top: `${top}px`
        });
    }

    function animateFlyout() {
        if ($flyout.is('[hidden]')) {
            return;
        }

        window.clearTimeout(flyoutAnimationTimer);
        $flyout.removeClass('is-animating');

        window.requestAnimationFrame(() => {
            $flyout.addClass('is-animating');
            flyoutAnimationTimer = window.setTimeout(() => {
                $flyout.removeClass('is-animating');
            }, 220);
        });
    }

    function syncMobileDrawerState() {
        const open = mobileDrawerOpen && isMobileViewport();

        $categoryBrowser.toggleClass('is-mobile-open', open);
        $mobileCategoryBackdrop.prop('hidden', !open).toggleClass('is-visible', open);
        $('body').toggleClass('nagoya-mobile-drawer-open', open);
    }

    function openMobileDrawer() {
        mobileDrawerOpen = true;
        syncMobileDrawerState();
    }

    function closeMobileDrawer() {
        mobileDrawerOpen = false;
        syncMobileDrawerState();
    }

    function closeFlyout() {
        if (!flyoutOpen) {
            return;
        }

        flyoutOpen = false;
        flyoutAnchorLeft = null;
        flyoutAnchorRootId = '';
        renderLevels();
    }

    function renderProducts(items) {
        if (!Array.isArray(items) || items.length === 0) {
            setProductsMessage('当前分类下没有商品。');
            return;
        }

        const html = items.map((item, index) => {
            const stockState = item.stock_state !== undefined && item.stock_state !== null ? item.stock_state : item.stock;
            const soldOut = Number(stockState) <= 0 || String(item.stock) === '0' || String(item.stock) === '已售罄';
            const href = `/item/${item.id}`;
            const priceValue = toPriceNumber(item.price);
            const userPriceValue = toPriceNumber(item.user_price);
            const showLoginPrice = !isUserLoggedIn
                && priceValue !== null
                && userPriceValue !== null
                && userPriceValue < priceValue;
            const deliveryText = item.delivery_way === 0 ? '自动发货' : '在线发货';
            const deliveryClass = item.delivery_way === 0 ? 'is-auto' : 'is-live';
            const desktopBadges = soldOut
                ? `
                    <span class="nagoya-product-badge is-muted">已售罄</span>
                    ${showSold ? `<span class="nagoya-product-badge is-sales">销量 ${escapeHtml(item.order_sold)}</span>` : ''}
                `
                : `
                    <span class="nagoya-product-badge ${deliveryClass}">${escapeHtml(deliveryText)}</span>
                    <span class="nagoya-product-badge is-stock">库存 ${escapeHtml(item.stock)}</span>
                    ${showSold ? `<span class="nagoya-product-badge is-sales">销量 ${escapeHtml(item.order_sold)}</span>` : ''}
                `;
            const mobileBadges = soldOut
                ? `
                    <span class="nagoya-product-badge is-price">￥${escapeHtml(formatPrice(item.price))}</span>
                    <span class="nagoya-product-badge is-muted">已售罄</span>
                    ${showLoginPrice ? `<span class="nagoya-product-badge is-member">登录后 ￥${escapeHtml(formatPrice(item.user_price))}</span>` : ''}
                `
                : `
                    <span class="nagoya-product-badge is-price">￥${escapeHtml(formatPrice(item.price))}</span>
                    <span class="nagoya-product-badge ${deliveryClass}">${escapeHtml(deliveryText)}</span>
                    <span class="nagoya-product-badge is-stock">库存 ${escapeHtml(item.stock)}</span>
                    ${showSold ? `<span class="nagoya-product-badge is-sales">销量 ${escapeHtml(item.order_sold)}</span>` : ''}
                    ${showLoginPrice ? `<span class="nagoya-product-badge is-member">登录后 ￥${escapeHtml(formatPrice(item.user_price))}</span>` : ''}
                `;
            const captionText = soldOut
                ? '暂时售罄'
                : showSold
                    ? `库存 ${escapeHtml(item.stock)} · 销量 ${escapeHtml(item.order_sold)}`
                    : `库存 ${escapeHtml(item.stock)}`;

            return `
                <article class="nagoya-product-card ${soldOut ? 'is-soldout' : ''}">
                    <a class="nagoya-product-main" href="${href}">
                        <span class="nagoya-product-visual">
                            <img src="${escapeHtml(item.cover || '/favicon.ico')}" alt="${escapeHtml(stripHtml(item.name))}">
                        </span>
                        <span class="nagoya-product-copy">
                            <span class="nagoya-product-kicker ${deliveryClass}">${escapeHtml(deliveryText)}</span>
                            <h3 class="nagoya-product-name">${rawHtml(item.name)}</h3>
                            <span class="nagoya-product-badges">${desktopBadges}</span>
                            <span class="nagoya-product-mobile-badges">${mobileBadges}</span>
                            <span class="nagoya-product-caption">${captionText}</span>
                        </span>
                    </a>
                    <div class="nagoya-product-foot">
                        <div class="nagoya-product-price-stack">
                            <span class="nagoya-product-price">￥${escapeHtml(formatPrice(item.price))}</span>
                            ${showLoginPrice ? `<span class="nagoya-product-member">登录后 ￥${escapeHtml(formatPrice(item.user_price))}</span>` : ''}
                        </div>
                        ${soldOut
                            ? '<span class="nagoya-product-state">已售罄</span>'
                            : `<a class="nagoya-product-buy" href="${href}">购买</a>`}
                    </div>
                </article>
            `;
        }).join('');

        $productGrid.html(html);
    }

    function getCurrentFocusNode() {
        if (activePathIds.length === 0) {
            return null;
        }

        return categoryMap.get(activePathIds[activePathIds.length - 1]) || null;
    }

    function pushCategoryHistory(id) {
        if (!id) {
            return;
        }

        history.pushState(null, '', `/cat/${id}`);
    }

    function loadLeaf(id, pushHistory = false) {
        const node = categoryMap.get(String(id));

        if (!node) {
            return;
        }

        const requestToken = ++commodityRequestToken;
        const previousRootId = activePathIds[0] || '';
        const nextPathIds = getAncestryIds(id);
        const nextRootId = nextPathIds[0] || '';

        activeLeafId = String(id);
        activePathIds = nextPathIds;
        isSearchMode = false;
        flyoutOpen = activePathIds.length > 1;

        if (previousRootId !== nextRootId) {
            flyoutAnchorLeft = null;
            flyoutAnchorRootId = '';
        }

        renderLevels();
        updateHero(node.name, '已聚焦到最终分类，当前展示的是可直接下单的商品列表。');
        setProductsMessage('正在加载商品...');

        if (isMobileViewport()) {
            closeMobileDrawer();
        }

        request('/user/api/index/commodity', {categoryId: activeLeafId})
            .then(result => {
                if (requestToken !== commodityRequestToken) {
                    return;
                }

                renderProducts(result);
                if (pushHistory) {
                    pushCategoryHistory(activeLeafId);
                }
            })
            .catch(error => {
                if (requestToken !== commodityRequestToken) {
                    return;
                }

                setProductsMessage(error && error.msg ? error.msg : '商品加载失败，请稍后再试。');
            });
    }

    function focusBranch(id, pushHistory = false, openFlyout = true) {
        const node = categoryMap.get(String(id));

        if (!node) {
            return;
        }

        const previousRootId = activePathIds[0] || '';
        const nextPathIds = getAncestryIds(id);
        const nextRootId = nextPathIds[0] || '';

        activeLeafId = '';
        activePathIds = nextPathIds;
        isSearchMode = false;
        flyoutOpen = openFlyout;

        if (!openFlyout || previousRootId !== nextRootId) {
            flyoutAnchorLeft = null;
            flyoutAnchorRootId = '';
        }

        renderLevels();
        updateHero('探索商品目录', '通过多层分类逐步聚焦目标商品，在更纯净的浏览节奏里完成选择。', '当前商品');
        setProductsMessage('请继续选择下一级分类。');

        if (pushHistory) {
            pushCategoryHistory(id);
        }
    }

    function searchProducts(keywords) {
        const value = String(keywords || '').trim();
        const requestToken = ++commodityRequestToken;

        if (!value) {
            if (typeof message !== 'undefined') {
                message.error('请输入要搜索的商品关键词');
            }
            return;
        }

        isSearchMode = true;
        flyoutOpen = false;
        flyoutAnchorLeft = null;
        flyoutAnchorRootId = '';
        renderLevels();
        updateHero('搜索结果', `当前展示的是“${value}”的搜索结果。`);
        setProductsMessage('正在搜索商品...');

        request('/user/api/index/commodity', {keywords: value})
            .then(result => {
                if (requestToken !== commodityRequestToken) {
                    return;
                }

                renderProducts(result);
                if ($productsStage.length > 0) {
                    const top = Math.max(0, $productsStage.offset().top - 32);

                    if (typeof window.scrollTo === 'function') {
                        window.scrollTo({
                            top,
                            behavior: 'smooth'
                        });
                    }
                }
                history.pushState(null, '', '/');
            })
            .catch(error => {
                if (requestToken !== commodityRequestToken) {
                    return;
                }

                setProductsMessage(error && error.msg ? error.msg : '搜索失败，请稍后重试。');
            });
    }

    window.nagoyaSearchProducts = searchProducts;

    function bindEvents() {
        $dropdown.off('click.nagoyaIndex').on('click.nagoyaIndex', function (event) {
            event.stopPropagation();
        });

        $rootRail.off('click.nagoyaIndex', '.nagoya-root-tab').on('click.nagoyaIndex', '.nagoya-root-tab', function (event) {
            event.stopPropagation();
            const id = String($(this).data('id'));
            const branch = Number($(this).data('hasChildren')) === 1;
            const selectedRootId = activePathIds[0] || '';

            if (branch) {
                if (selectedRootId === id) {
                    if (flyoutOpen) {
                        closeFlyout();
                        return;
                    }

                    flyoutAnchorLeft = null;
                    flyoutAnchorRootId = '';
                    flyoutOpen = true;
                    renderLevels();
                    return;
                }

                focusBranch(id, true, true);
                return;
            }

            loadLeaf(id, true);
        });

        $levels.off('click.nagoyaIndex', '.nagoya-flyout-item').on('click.nagoyaIndex', '.nagoya-flyout-item', function (event) {
            event.stopPropagation();
            const id = String($(this).data('id'));
            const branch = Number($(this).data('hasChildren')) === 1;

            if (branch) {
                focusBranch(id, true);
                return;
            }

            loadLeaf(id, true);
        });

        $crumbs.off('click.nagoyaIndex', '.nagoya-crumb').on('click.nagoyaIndex', '.nagoya-crumb', function (event) {
            event.stopPropagation();
            const id = String($(this).data('id'));
            const branch = Number($(this).data('hasChildren')) === 1;

            if (branch) {
                focusBranch(id, true);
                return;
            }

            loadLeaf(id, true);
        });

        $flyoutClose.off('click.nagoyaIndex').on('click.nagoyaIndex', function (event) {
            event.stopPropagation();
            closeFlyout();
        });

        $mobileCategoryTrigger.off('click.nagoyaIndex').on('click.nagoyaIndex', function (event) {
            event.preventDefault();
            openMobileDrawer();
        });

        $mobileCategoryBackdrop.off('click.nagoyaIndex').on('click.nagoyaIndex', function () {
            closeMobileDrawer();
        });

        $mobileCategoryClose.off('click.nagoyaIndex').on('click.nagoyaIndex', function (event) {
            event.preventDefault();
            closeMobileDrawer();
        });

        $(window).off('popstate.nagoyaIndex').on('popstate.nagoyaIndex', function () {
            const match = window.location.pathname.match(/^\/cat\/(\d+)$/);

            if (!match) {
                const firstLeafId = getFirstLeafId(categoryTree);
                if (firstLeafId) {
                    loadLeaf(firstLeafId, false);
                }
                return;
            }

            const node = categoryMap.get(String(match[1]));
            if (!node) {
                return;
            }

            if (hasChildren(node)) {
                focusBranch(node.id, false);
            } else {
                loadLeaf(node.id, false);
            }
        });

        $(window).off('resize.nagoyaIndex').on('resize.nagoyaIndex', function () {
            flyoutAnchorLeft = null;
            flyoutAnchorRootId = '';
            positionFlyout();
            syncMobileDrawerState();
        });

        $(document).off('click.nagoyaFlyoutDismiss').on('click.nagoyaFlyoutDismiss', function (event) {
            if (window.matchMedia('(max-width: 767px)').matches) {
                return;
            }

            if ($(event.target).closest('#nagoya-category-dropdown').length > 0) {
                return;
            }

            closeFlyout();
        });

        $(document).off('keydown.nagoyaIndex').on('keydown.nagoyaIndex', function (event) {
            if (event.key === 'Escape') {
                closeFlyout();
                closeMobileDrawer();
            }
        });
    }

    function init() {
        bindEvents();
        setProductsMessage('正在加载分类...');

        request('/user/api/index/data')
            .then(data => {
                categoryTree = Array.isArray(data) ? data : [];
                categoryMap = new Map();
                parentMap = new Map();
                hydrateAggregateCounts(categoryTree);
                walkCategories(categoryTree);

                renderLevels();

                if (initialSearchKeyword) {
                    searchProducts(initialSearchKeyword);
                    return;
                }

                const urlMatch = window.location.pathname.match(/^\/cat\/(\d+)$/);
                const initialId = urlMatch && categoryMap.has(String(urlMatch[1]))
                    ? String(urlMatch[1])
                    : (defaultCategoryId && categoryMap.has(defaultCategoryId) ? defaultCategoryId : getFirstLeafId(categoryTree));

                if (!initialId) {
                    renderLevels();
                    updateHero('探索商品目录', '当前没有可展示的分类。');
                    setProductsMessage('当前没有可展示的商品分类。');
                    return;
                }

                const initialNode = categoryMap.get(String(initialId));

                if (initialNode && hasChildren(initialNode)) {
                    focusBranch(initialNode.id, false);
                    return;
                }

                loadLeaf(initialId, false);
            })
            .catch(error => {
                $levels.html('<div class="nagoya-level-empty">分类加载失败，请刷新页面后重试。</div>');
                updateHero('探索商品目录', '分类加载失败，请稍后重试。');
                setProductsMessage(error && error.msg ? error.msg : '分类加载失败，请稍后重试。');
            });
    }

    init();
}();
