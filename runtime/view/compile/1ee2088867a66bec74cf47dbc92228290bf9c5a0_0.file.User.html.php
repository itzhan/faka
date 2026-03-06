<?php
/* Smarty version 3.1.46, created on 2026-03-05 16:32:47
  from '/var/www/html/app/View/Admin/User/User.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69a93faf6168a4_94986976',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '1ee2088867a66bec74cf47dbc92228290bf9c5a0' => 
    array (
      0 => '/var/www/html/app/View/Admin/User/User.html',
      1 => 1772697599,
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
function content_69a93faf6168a4_94986976 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_subTemplateRender("file:../Header.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>
<style>
    .layui-popup .layui-layer-content {
        position: relative !important;
        overflow: auto !important;
    }
</style>
<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_USER_HEADER);?>

<!--end::HOOK-->
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
            <div class="polaris-grid polaris-grid-6" style="margin-bottom:20px;">
                <div class="polaris-stat-card">
                    <div class="stat-label">总用户</div>
                    <div class="stat-value"><?php echo $_smarty_tpl->tpl_vars['userCount']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">商家</div>
                    <div class="stat-value text-success"><?php echo $_smarty_tpl->tpl_vars['businessCount']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">当前余额</div>
                    <div class="stat-value">￥<?php echo $_smarty_tpl->tpl_vars['balance']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">总充值</div>
                    <div class="stat-value text-success"><?php echo $_smarty_tpl->tpl_vars['recharge']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">当前硬币</div>
                    <div class="stat-value">￥<?php echo $_smarty_tpl->tpl_vars['coin']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">总获得硬币</div>
                    <div class="stat-value text-success"><?php echo $_smarty_tpl->tpl_vars['totalCoin']->value;?>
</div>
                </div>
            </div>

            <!-- Table -->
            <div class="card mb-5 mb-xl-8">
                <!--begin::Header-->
                <div class="card-header">
                    <div class="card-toolbar">
                        <button class="btn btn-sm btn-light-primary handle me-3"><i class="fa-duotone fa-regular fa-user-pen"></i>修改会员等级
                        </button>
                        <button class="btn btn-sm btn-light-danger btn-app-del me-3"><i class="fa-duotone fa-regular fa-trash-can"></i> 移除选中用户 </button>
                        <!--start::HOOK-->
                        <?php echo hook(\App\Consts\Hook::ADMIN_VIEW_USER_TOOLBAR);?>

                        <!--end::HOOK-->
                    </div>
                </div>
                <!--end::Header-->
                <div class="card-body py-3">
                    <table id="user-table"></table>
                </div>
            </div>
        </div>
        <!--end::Container-->
    </div>
    <!--end::Post-->
</div>
<!--end::Content-->

<?php echo ready("/assets/admin/controller/user/index.js");?>

<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_USER_FOOTER);?>

<!--end::HOOK-->
<?php $_smarty_tpl->_subTemplateRender("file:../Footer.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
}
}
