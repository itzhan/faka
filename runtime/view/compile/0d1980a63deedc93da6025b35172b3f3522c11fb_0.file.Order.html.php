<?php
/* Smarty version 3.1.46, created on 2026-03-06 14:05:52
  from '/var/www/html/app/View/Admin/Trade/Order.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69aa6ec0ae8395_48079021',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '0d1980a63deedc93da6025b35172b3f3522c11fb' => 
    array (
      0 => '/var/www/html/app/View/Admin/Trade/Order.html',
      1 => 1772697582,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:../Header.html' => 1,
    'file:../Toolbar.html' => 1,
    'file:../Footer.html' => 1,
  ),
),false)) {
function content_69aa6ec0ae8395_48079021 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_subTemplateRender("file:../Header.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>

<!--begin::Content-->
<div class="content d-flex flex-column flex-column-fluid" id="kt_content">
    <!--begin::Toolbar-->
    <?php $_smarty_tpl->_subTemplateRender("file:../Toolbar.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>
    <!--end::Toolbar-->
    <!--begin::Post-->
    <div class="post d-flex flex-column-fluid" id="kt_post">
        <!--begin::Container-->
        <div id="kt_content_container" class="container-fluid">
            <!-- Stat Cards -->
            <div class="polaris-grid polaris-grid-3" style="margin-bottom:20px;">
                <div class="polaris-stat-card">
                    <div class="stat-label">订单数量</div>
                    <div class="stat-value order_count">...</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">订单金额</div>
                    <div class="stat-value text-success order_amount">...</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">手续费</div>
                    <div class="stat-value text-critical order_cost">...</div>
                </div>
            </div>

            <!-- Table -->
            <div class="card mb-5 mb-xl-8">
                <!--begin::Header-->
                <div class="card-header border-0">
                    <div class="card-toolbar">
                        <button class="btn btn-sm btn-light-primary clear me-3"><i class="fa-duotone fa-regular fa-trash-can-clock"></i>
                            一键清理无用订单
                        </button>
                        <!--start::HOOK-->
                        <?php echo hook(\App\Consts\Hook::ADMIN_VIEW_ORDER_TOOLBAR);?>

                        <!--end::HOOK-->
                        <span class="badge badge-light-primary fs-8">Tips：上方订单数据显示会根据下方的查询条件进行筛选显示。</span>
                    </div>
                </div>
                <!--end::Header-->

                <div class="card-body py-3">
                    <table id="order-table"></table>
                </div>
            </div>
        </div>
        <!--end::Container-->
    </div>
    <!--end::Post-->
</div>
<!--end::Content-->
<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_ORDER_FOOTER);?>

<!--end::HOOK-->
<?php echo ready("/assets/admin/controller/trade/order.js");?>

<?php $_smarty_tpl->_subTemplateRender("file:../Footer.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
}
}
