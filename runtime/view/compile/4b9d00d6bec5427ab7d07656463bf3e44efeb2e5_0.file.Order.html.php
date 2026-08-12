<?php
/* Smarty version 3.1.46, created on 2026-06-21 15:08:52
  from '/var/www/html/app/View/Admin/User/Order.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_6a378e044f9d56_49532307',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '4b9d00d6bec5427ab7d07656463bf3e44efeb2e5' => 
    array (
      0 => '/var/www/html/app/View/Admin/User/Order.html',
      1 => 1782004971,
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
function content_6a378e044f9d56_49532307 (Smarty_Internal_Template $_smarty_tpl) {
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
            <div class="polaris-grid polaris-grid-2" style="margin-bottom:20px;">
                <div class="polaris-stat-card">
                    <div class="stat-label">订单数量</div>
                    <div class="stat-value order_count">...</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">订单金额</div>
                    <div class="stat-value text-success order_amount">...</div>
                </div>
            </div>

            <!-- Table -->
            <div class="card mb-5 mb-xl-8">
                <!--begin::Header-->
                <div class="card-header">
                    <div class="card-toolbar">
                        <button class="btn btn-sm btn-light-primary clear me-3">
                            <i class="fa-duotone fa-regular fa-trash-can-clock"></i> 一键清理无用订单
                        </button>
                        <button class="btn btn-sm btn-light-success btn-app-export me-3"><i class="fa-duotone fa-regular fa-down-to-line"></i>
                            导出筛选订单
                        </button>
                    </div>
                </div>
                <!--end::Header-->
                <div class="card-body py-3">
                    <table id="recharge-order-table" ></table>
                </div>
            </div>
        </div>
        <!--end::Container-->
    </div>
    <!--end::Post-->
</div>
<!--end::Content-->
<?php echo ready("/assets/admin/controller/user/recharge.order.js");?>

<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_ORDER_FOOTER);?>

<!--end::HOOK-->
<?php $_smarty_tpl->_subTemplateRender("file:../Footer.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
}
}
