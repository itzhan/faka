!function () {
    const namespace = '.mdConfigRechargeProviderController';
    // 各对接类型的默认接口地址，新增商家时自动填入
    const DEFAULT_API_BASE = {
        beibei: 'https://beibeichongzhi.com'
    };
    let controllerActive = true;
    let saveInFlight = false;

    if (typeof window.__mdConfigRechargeProviderDestroy === 'function') window.__mdConfigRechargeProviderDestroy();

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }

    function loadJson(id, fallback) {
        try {
            const parsed = JSON.parse(document.getElementById(id)?.value || '');
            return parsed && typeof parsed === 'object' ? parsed : fallback;
        } catch (e) {
            return fallback;
        }
    }

    const DRIVERS = loadJson('md-recharge-driver-source', {});

    function driverOptions(selected) {
        return Object.keys(DRIVERS).map(key => {
            const sel = key === selected ? ' selected' : '';
            return `<option value="${escapeHtml(key)}"${sel}>${escapeHtml(DRIVERS[key])}</option>`;
        }).join('');
    }

    function rowHtml(item) {
        const tokenHint = item.has_token ? '已配置，留空则不修改' : '必填';
        return `<div class="provider-row border rounded p-5">
            <input type="hidden" class="provider-id" value="${escapeHtml(item.id || '')}">
            <div class="row g-4">
                <div class="col-6">
                    <label class="form-label fw-bold">对接类型</label>
                    <select class="form-select form-select-solid provider-driver">${driverOptions(item.driver)}</select>
                </div>
                <div class="col-6">
                    <label class="form-label fw-bold">名称</label>
                    <input type="text" class="form-control form-control-solid provider-name" maxlength="32" value="${escapeHtml(item.name || '')}" placeholder="显示名称">
                </div>
                <div class="col-6">
                    <label class="form-label fw-bold">兑换码前缀</label>
                    <input type="text" class="form-control form-control-solid provider-prefix" maxlength="16" value="${escapeHtml(item.prefix || '')}" placeholder="如 bb-">
                </div>
                <div class="col-6">
                    <label class="form-label fw-bold">密钥</label>
                    <input type="password" class="form-control form-control-solid provider-token" maxlength="1024" value="" autocomplete="new-password" placeholder="${escapeHtml(tokenHint)}">
                </div>
                <div class="col-12">
                    <label class="form-label fw-bold">接口地址</label>
                    <input type="url" class="form-control form-control-solid provider-api-base" maxlength="512" value="${escapeHtml(item.api_base || '')}" placeholder="https://">
                </div>
            </div>
            <div class="mt-4 d-flex align-items-center justify-content-between">
                <label class="form-check form-switch form-check-custom form-check-solid">
                    <input class="form-check-input provider-enabled" type="checkbox" ${item.enabled ? 'checked' : ''}>
                    <span class="form-check-label fw-bold">启用</span>
                </label>
                <button type="button" class="btn btn-sm btn-light-danger provider-remove">删除</button>
            </div>
        </div>`;
    }

    function syncEmpty() {
        $('#provider-empty').toggle($('#provider-list .provider-row').length === 0);
    }

    function render(list) {
        $('#provider-list').empty();
        list.forEach(item => $('#provider-list').append(rowHtml(item)));
        syncEmpty();
    }

    function collect() {
        const list = [];
        $('#provider-list .provider-row').each(function () {
            const $row = $(this);
            list.push({
                id: $row.find('.provider-id').val(),
                driver: $row.find('.provider-driver').val(),
                name: $row.find('.provider-name').val(),
                prefix: $row.find('.provider-prefix').val(),
                api_base: $row.find('.provider-api-base').val(),
                token: $row.find('.provider-token').val(),
                enabled: $row.find('.provider-enabled').is(':checked')
            });
        });
        return list;
    }

    const initial = loadJson('md-recharge-provider-source', []);
    render(Array.isArray(initial) ? initial : []);

    $('.provider-add').off(namespace).on('click' + namespace, function () {
        const driver = Object.keys(DRIVERS)[0] || '';
        $('#provider-list').append(rowHtml({
            driver,
            name: DRIVERS[driver] || '',
            api_base: DEFAULT_API_BASE[driver] || '',
            enabled: true
        }));
        syncEmpty();
    });

    $('#provider-list').off(namespace)
        .on('click' + namespace, '.provider-remove', function () {
            $(this).closest('.provider-row').remove();
            syncEmpty();
        })
        .on('change' + namespace, '.provider-driver', function () {
            const $row = $(this).closest('.provider-row');
            const $base = $row.find('.provider-api-base');
            if (!$base.val()) $base.val(DEFAULT_API_BASE[$(this).val()] || '');
        });

    $('.save-data').off(namespace).on('click' + namespace, function () {
        if (!controllerActive || saveInFlight) return;
        saveInFlight = true;
        $(this).prop('disabled', true);
        const done = () => {
            saveInFlight = false;
            $('.save-data').prop('disabled', false);
        };
        util.post({
            url: '/admin/api/config/rechargeProvider',
            data: { providers: JSON.stringify(collect()) },
            done: res => {
                if (!controllerActive) return;
                done();
                layer.msg(res.msg || i18n('保存成功'));
                if (Array.isArray(res.data)) render(res.data);
            },
            error: res => {
                if (!controllerActive) return;
                done();
                message.error(res?.msg || i18n('充值商家保存失败'));
            },
            fail: () => {
                if (!controllerActive) return;
                done();
                message.error('网络异常，充值商家未保存');
            }
        });
    });

    function destroy() {
        if (!controllerActive) return;
        controllerActive = false;
        saveInFlight = false;
        $('.provider-add, .save-data, #provider-list').off(namespace);
        $(document).off('pjax:beforeReplace' + namespace);
        if (window.__mdConfigRechargeProviderDestroy === destroy) delete window.__mdConfigRechargeProviderDestroy;
    }

    window.__mdConfigRechargeProviderDestroy = destroy;
    $(document).off('pjax:beforeReplace' + namespace).one('pjax:beforeReplace' + namespace, destroy);
}();
