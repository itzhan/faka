<?php
/* Smarty version 3.1.46, created on 2026-03-06 14:52:05
  from '/var/www/html/app/View/Admin/Footer.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69aa7995c19a04_31263995',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'b05336bc420d545e6c7857493bbabd0e425d3530' => 
    array (
      0 => '/var/www/html/app/View/Admin/Footer.html',
      1 => 1772779897,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69aa7995c19a04_31263995 (Smarty_Internal_Template $_smarty_tpl) {
?>        </main>
        <!--end::Main Content-->
    </div>
    <!--end::Layout-->
</div>
<!--end::Shopify Admin Shell-->

<div id="kt_scrolltop" class="scrolltop" data-kt-scrolltop="true"><i class="fa-duotone fa-regular fa-arrow-up text-white"></i></div>

<?php echo js(array("/assets/common/js/_.js","/assets/admin/js/_admin.js"),array("/assets/common/js/util/dict.js","/assets/common/js/jquery.min.js","/assets/common/js/toastr.min.js","/assets/common/js/component/loading.js","/assets/common/js/util.js","/assets/common/js/layer/layer.js","/assets/common/js/jquery.pjax.min.js","/assets/common/js/jquery.qrcode.min.js","/assets/common/js/format.js","/assets/common/js/message.js","/assets/common/js/component.js","/assets/common/js/layui/layui.js","/assets/common/js/jquery.treegrid.min.js","/assets/common/js/bootstrap/bootstrap.bundle.min.js","/assets/common/js/table/bootstrap-table.min.js","/assets/common/js/table/bootstrap-table-treegrid.min.js","/assets/common/js/component/form.js","/assets/common/js/component/search.js","/assets/common/js/component/xm-select.js","/assets/common/js/component/tree.select.js","/assets/common/js/component/authtree.js","/assets/common/js/component/table.js","/assets/common/js/component/select2.min.js","/assets/common/js/cache.js","/assets/common/js/editor/editor.js","/assets/common/js/editor/code/code.js","/assets/common/js/component/decimal.js","/assets/admin/js/dict.js","/assets/admin/js/menu.js","/assets/admin/controller/global.js"));?>


<?php echo '<script'; ?>
>
/* Shopify Admin — Sidebar Toggle, Search & Active State Sync */
document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('sp_sidebar_toggle');
    var sidebar = document.getElementById('sp_sidebar');
    var overlay = null;

    /* --- Sidebar mobile toggle --- */
    if (toggle && sidebar) {
        toggle.addEventListener('click', function() {
            sidebar.classList.toggle('sp-sidebar-open');
            if (sidebar.classList.contains('sp-sidebar-open')) {
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'sp-overlay';
                    overlay.addEventListener('click', function() {
                        sidebar.classList.remove('sp-sidebar-open');
                        overlay.classList.remove('sp-overlay-show');
                    });
                    document.body.appendChild(overlay);
                }
                setTimeout(function() { overlay.classList.add('sp-overlay-show'); }, 10);
            } else if (overlay) {
                overlay.classList.remove('sp-overlay-show');
            }
        });
    }

    /* --- ⌘K search shortcut --- */
    var searchBtn = document.getElementById('sp_search_trigger');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (typeof layer !== 'undefined') {
                layer.msg('搜索功能即将上线', {icon: 6, time: 1500});
            }
        });
        document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchBtn.click();
            }
        });
    }

    /* --- Sidebar Active State Sync --- */
    function syncSidebarActive() {
        var path = window.location.pathname.replace(/\/+$/, '');
        var allLinks = document.querySelectorAll('.sp-nav-link, .sp-sidebar-bottom .sp-nav-link');
        var bestMatch = null;
        var bestLen = 0;

        allLinks.forEach(function(link) {
            link.classList.remove('sp-active');
            var href = (link.getAttribute('href') || '').replace(/\/+$/, '');
            if (href && path.indexOf(href) === 0 && href.length > bestLen) {
                bestMatch = link;
                bestLen = href.length;
            }
        });

        if (bestMatch) {
            bestMatch.classList.add('sp-active');
        }
    }

    /* Sync on first load */
    syncSidebarActive();

    /* Sync after pjax navigation */
    if (typeof $ !== 'undefined') {
        $(document).on('pjax:end', function() {
            syncSidebarActive();
        });
    }
});
<?php echo '</script'; ?>
>

<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_BODY);?>

<!--end::HOOK-->
</body>
<!--end::Body-->
<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_FOOTER);?>

<!--end::HOOK-->
</html><?php }
}
