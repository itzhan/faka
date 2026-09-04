!function () {
    const namespace = '.mdConfigCommunityController';
    const TYPES = {
        telegram_notice: '电报通知群',
        telegram_chat: '电报交流群',
        qq_notice: 'QQ 通知群'
    };
    let controllerActive = true;
    let saveInFlight = false;

    if (typeof window.__mdConfigCommunityDestroy === 'function') window.__mdConfigCommunityDestroy();

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]);
    }

    function loadSource() {
        try {
            const parsed = JSON.parse(document.getElementById('md-community-source')?.value || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function typeOptions(selected) {
        return Object.keys(TYPES).map(key => {
            const sel = key === selected ? ' selected' : '';
            return `<option value="${key}"${sel}>${escapeHtml(TYPES[key])}</option>`;
        }).join('');
    }

    function rowHtml(item) {
        const image = item.image || '';
        return `<div class="community-row border rounded p-5">
            <input type="hidden" class="community-id" value="${escapeHtml(item.id || '')}">
            <input type="hidden" class="community-image" value="${escapeHtml(image)}">
            <div class="row g-4 align-items-start">
                <div class="col-lg-2">
                    <label class="form-label fw-bold">类型</label>
                    <select class="form-select form-select-solid community-type">${typeOptions(item.type)}</select>
                </div>
                <div class="col-lg-3">
                    <label class="form-label fw-bold">名称</label>
                    <input type="text" class="form-control form-control-solid community-name" maxlength="32" value="${escapeHtml(item.name || '')}" placeholder="显示名称">
                </div>
                <div class="col-lg-4">
                    <label class="form-label fw-bold">邀请链接</label>
                    <input type="url" class="form-control form-control-solid community-url" maxlength="2048" value="${escapeHtml(item.url || '')}" placeholder="https://t.me/… 或 QQ 群链接">
                </div>
                <div class="col-lg-3">
                    <label class="form-label fw-bold">群图片 / 二维码</label>
                    <div class="d-flex align-items-center gap-3">
                        <img class="community-preview rounded border" src="${escapeHtml(image)}" alt="" style="width:72px;height:72px;object-fit:cover;${image ? '' : 'display:none'}">
                        <div class="d-flex flex-column gap-2">
                            <label class="btn btn-sm btn-light mb-0">
                                上传图片
                                <input type="file" class="community-image-file d-none" accept=".png,.jpg,.jpeg,.webp,.gif">
                            </label>
                            <button type="button" class="btn btn-sm btn-light-danger community-clear-image">清除图片</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4 text-end">
                <button type="button" class="btn btn-sm btn-light-danger community-remove">删除</button>
            </div>
        </div>`;
    }

    function syncEmpty() {
        const empty = $('#community-list .community-row').length === 0;
        $('#community-empty').toggle(empty);
    }

    function addRow(item) {
        const type = item?.type && TYPES[item.type] ? item.type : 'telegram_notice';
        $('#community-list').append(rowHtml({
            id: item?.id || '',
            type,
            name: item?.name || TYPES[type],
            url: item?.url || '',
            image: item?.image || ''
        }));
        syncEmpty();
    }

    function collect() {
        const list = [];
        $('#community-list .community-row').each(function () {
            const $row = $(this);
            list.push({
                id: $row.find('.community-id').val(),
                type: $row.find('.community-type').val(),
                name: $row.find('.community-name').val(),
                url: $row.find('.community-url').val(),
                image: $row.find('.community-image').val()
            });
        });
        return list;
    }

    loadSource().forEach(addRow);
    syncEmpty();

    $('.community-add').off(namespace).on('click' + namespace, function () {
        addRow({ type: $(this).data('type') });
    });

    $('#community-list').off(namespace)
        .on('click' + namespace, '.community-remove', function () {
            $(this).closest('.community-row').remove();
            syncEmpty();
        })
        .on('click' + namespace, '.community-clear-image', function () {
            const $row = $(this).closest('.community-row');
            $row.find('.community-image').val('');
            $row.find('.community-preview').hide().attr('src', '');
            $row.find('.community-image-file').val('');
        })
        .on('change' + namespace, '.community-image-file', function () {
            const file = this.files && this.files[0];
            const $row = $(this).closest('.community-row');
            if (!file) return;
            const formdata = new FormData();
            formdata.append('file', file);
            Loading.show();
            $.ajax({
                type: 'POST',
                url: '/admin/api/upload/send?mime=image',
                data: formdata,
                contentType: false,
                processData: false,
                dataType: 'json',
                success: function (res) {
                    Loading.hide();
                    if (!controllerActive) return;
                    if (res.code == 200 && res.data?.url) {
                        $row.find('.community-image').val(res.data.url);
                        $row.find('.community-preview').attr('src', res.data.url).show();
                        layer.msg(i18n('图片已上传，保存后才会在前台生效'));
                    } else {
                        layer.msg(res.msg || i18n('上传失败'));
                    }
                },
                error: function () {
                    Loading.hide();
                    layer.msg(i18n('网络错误'));
                }
            });
        });

    $('.save-data').off(namespace).on('click' + namespace, function () {
        if (!controllerActive || saveInFlight) return;
        saveInFlight = true;
        $(this).prop('disabled', true);
        util.post({
            url: '/admin/api/config/community',
            data: { groups: JSON.stringify(collect()) },
            done: res => {
                if (!controllerActive) return;
                saveInFlight = false;
                $('.save-data').prop('disabled', false);
                layer.msg(res.msg || i18n('保存成功'));
                if (Array.isArray(res.data)) {
                    $('#community-list').empty();
                    res.data.forEach(addRow);
                    syncEmpty();
                }
            },
            error: res => {
                if (!controllerActive) return;
                saveInFlight = false;
                $('.save-data').prop('disabled', false);
                message.error(res?.msg || i18n('社群设置保存失败'));
            },
            fail: () => {
                if (!controllerActive) return;
                saveInFlight = false;
                $('.save-data').prop('disabled', false);
                message.error('网络异常，社群设置未保存');
            }
        });
    });

    function destroy() {
        if (!controllerActive) return;
        controllerActive = false;
        saveInFlight = false;
        $('.community-add, .save-data, #community-list').off(namespace);
        $(document).off('pjax:beforeReplace' + namespace);
        if (window.__mdConfigCommunityDestroy === destroy) delete window.__mdConfigCommunityDestroy;
    }

    window.__mdConfigCommunityDestroy = destroy;
    $(document).off('pjax:beforeReplace' + namespace).one('pjax:beforeReplace' + namespace, destroy);
}();
