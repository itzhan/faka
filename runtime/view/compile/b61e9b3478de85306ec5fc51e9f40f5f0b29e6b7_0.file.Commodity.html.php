<?php
/* Smarty version 3.1.46, created on 2026-03-05 16:32:45
  from '/var/www/html/app/View/Admin/Trade/Commodity.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69a93fad63c750_81616438',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'b61e9b3478de85306ec5fc51e9f40f5f0b29e6b7' => 
    array (
      0 => '/var/www/html/app/View/Admin/Trade/Commodity.html',
      1 => 1772697592,
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
function content_69a93fad63c750_81616438 (Smarty_Internal_Template $_smarty_tpl) {
$_smarty_tpl->_subTemplateRender("file:../Header.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>
<!--begin::Content-->
<div class="content d-flex flex-column flex-column-fluid">
    <!--begin::Toolbar-->
    <?php $_smarty_tpl->_subTemplateRender("file:../Toolbar.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
?>
    <!--end::Toolbar-->
    <!--begin::Post-->
    <div class="post d-flex flex-column-fluid">
        <!--begin::Container-->
        <div id="kt_content_container" class="container-fluid">
            <!-- Stat Cards -->
            <div class="polaris-grid polaris-grid-6" style="margin-bottom:20px;">
                <div class="polaris-stat-card">
                    <div class="stat-label">总商品</div>
                    <div class="stat-value"><?php echo $_smarty_tpl->tpl_vars['all']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">已上架</div>
                    <div class="stat-value text-success"><?php echo $_smarty_tpl->tpl_vars['shelves']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">未上架</div>
                    <div class="stat-value text-critical"><?php echo $_smarty_tpl->tpl_vars['not']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">主站商品</div>
                    <div class="stat-value text-info"><?php echo $_smarty_tpl->tpl_vars['main']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">子站商品</div>
                    <div class="stat-value"><?php echo $_smarty_tpl->tpl_vars['child']->value;?>
</div>
                </div>
                <div class="polaris-stat-card">
                    <div class="stat-label">子站上架</div>
                    <div class="stat-value text-success"><?php echo $_smarty_tpl->tpl_vars['child_shelves']->value;?>
</div>
                </div>
            </div>

            <!-- Table -->
            <div class="card mb-5 mb-xl-8">
                <!--begin::Header-->
                <div class="card-header border-0">
                    <div class="card-toolbar">
                        <button class="btn btn-sm btn-light-primary btn-app-create me-3"><i class="fa-duotone fa-regular fa-circle-plus"></i>
                            添加商品
                        </button>
                        <button class="btn btn-sm btn-light-success listed me-3"><i class="fa-duotone fa-regular fa-up-from-bracket"></i>
                            上架选中商品
                        </button>
                        <button class="btn btn-sm btn-light-dark delist me-3"><i class="fa-duotone fa-regular fa-down-to-bracket"></i>
                            下架选中商品
                        </button>
                        <button class="btn btn-sm btn-light-primary handle me-3"><i class="fa-duotone fa-regular fa-rotate"></i>
                            一键操作选中商品
                        </button>
                        <button class="btn btn-sm btn-light-danger btn-app-del me-3"><i class="fa-duotone fa-regular fa-trash-can"></i> 移除选中商品
                        </button>
                        <!--start::HOOK-->
                        <?php echo hook(\App\Consts\Hook::ADMIN_VIEW_COMMODITY_TOOLBAR);?>

                        <!--end::HOOK-->
                    </div>
                </div>
                <!--end::Header-->
                <div class="card-body py-3">
                    <table id="commodity-table"></table>
                </div>
            </div>
        </div>
        <!--end::Container-->
    </div>
    <!--end::Post-->
</div>
<!--end::Content-->
<!--start::HOOK-->
<?php echo hook(\App\Consts\Hook::ADMIN_VIEW_COMMODITY_FOOTER);?>

<!--end::HOOK-->
<?php echo ready("/assets/admin/controller/trade/commodity.js");?>

<?php $_smarty_tpl->_subTemplateRender("file:../Footer.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
}
}
