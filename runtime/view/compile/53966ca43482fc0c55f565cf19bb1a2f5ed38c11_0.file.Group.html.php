<?php
/* Smarty version 3.1.46, created on 2026-03-06 14:05:46
  from '/var/www/html/app/View/Admin/User/Group.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69aa6ebaa9fa97_02762315',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '53966ca43482fc0c55f565cf19bb1a2f5ed38c11' => 
    array (
      0 => '/var/www/html/app/View/Admin/User/Group.html',
      1 => 1772697628,
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
function content_69aa6ebaa9fa97_02762315 (Smarty_Internal_Template $_smarty_tpl) {
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
            <div class="row g-4">
                <!-- 会员等级 -->
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header border-0">
                            <div class="card-title">
                                <h3 style="font-size:14px;font-weight:600;color:#303030;margin:0;">
                                    <i class="fa-duotone fa-regular fa-users-gear" style="color:#616161;margin-right:6px;"></i>会员等级
                                </h3>
                            </div>
                            <div class="card-toolbar">
                                <button class="btn btn-sm btn-light-primary btn-group-create"><i class="fa-duotone fa-regular fa-circle-plus"></i>新增等级
                                </button>
                            </div>
                        </div>
                        <div class="card-body py-3">
                            <table id="user-group"></table>
                        </div>
                    </div>
                </div>

                <!-- 商品分组 -->
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header border-0">
                            <div class="card-title">
                                <h3 style="font-size:14px;font-weight:600;color:#303030;margin:0;">
                                    <i class="fa-duotone fa-regular fa-group-arrows-rotate" style="color:#616161;margin-right:6px;"></i>商品分组
                                </h3>
                            </div>
                            <div class="card-toolbar">
                                <button class="btn btn-sm btn-light-primary btn-commodity-group-create"><i class="fa-duotone fa-regular fa-circle-plus"></i>
                                    添加分组
                                </button>
                            </div>
                        </div>
                        <div class="card-body py-3">
                            <form class="search-query"></form>
                            <table id="commodity-group" ></table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--end::Container-->
    </div>
    <!--end::Post-->
</div>
<!--end::Content-->

<?php echo ready("/assets/admin/controller/user/group.js");?>

<?php $_smarty_tpl->_subTemplateRender("file:../Footer.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), 0, false);
}
}
