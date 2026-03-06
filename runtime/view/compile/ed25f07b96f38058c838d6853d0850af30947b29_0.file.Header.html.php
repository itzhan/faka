<?php
/* Smarty version 3.1.46, created on 2026-03-06 15:32:51
  from '/var/www/html/app/View/User/Theme/Cartoon/Index/Header.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69aa832380bbb3_25517659',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'ed25f07b96f38058c838d6853d0850af30947b29' => 
    array (
      0 => '/var/www/html/app/View/User/Theme/Cartoon/Index/Header.html',
      1 => 1772782369,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69aa832380bbb3_25517659 (Smarty_Internal_Template $_smarty_tpl) {
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="keywords" content="<?php echo $_smarty_tpl->tpl_vars['config']->value['keywords'];?>
"/>
    <meta name="description" content="<?php echo $_smarty_tpl->tpl_vars['config']->value['description'];?>
"/>
    <link href="<?php echo $_smarty_tpl->tpl_vars['favicon']->value;?>
?v=<?php echo $_smarty_tpl->tpl_vars['app']->value['version'];?>
" rel="icon">
    <title><?php echo $_smarty_tpl->tpl_vars['title']->value;?>
 - <?php echo $_smarty_tpl->tpl_vars['config']->value['shop_name'];?>
</title>
    <?php echo css(array("/assets/common/css/bootstrap.min.css","/assets/common/css/_.css","/assets/user/css/index.css"),array("/assets/common/css/font.min.css","/assets/common/js/layui/css/layui.css","/assets/common/css/select2.min.css","/assets/common/css/component.css","/assets/common/js/table/bootstrap-table.css","/assets/common/js/layer/theme/default/layer.css","/assets/common/css/bootstrap.min.css","/assets/common/css/toastr.min.css","/assets/user/css/index.css"));?>

    <?php echo js("/assets/common/js/ready.js");?>

    <?php echo index_var();?>

    <!--start::HOOK-->
    <?php echo hook(\App\Consts\Hook::USER_GLOBAL_VIEW_HEADER);?>

    <?php echo hook(\App\Consts\Hook::USER_VIEW_INDEX_HEADER);?>

    <!--end::HOOK-->
</head>
<body style="background-size: cover;background-image: linear-gradient(180deg, rgb(255 255 255 / 0%), rgb(255 255 255 / 71%)), url('<?php echo $_smarty_tpl->tpl_vars['config']->value['background_url'];?>
')">
<nav class="navbar navbar-expand-lg navbar-acg">
    <div class="container">
        <a class="navbar-brand fw-bold d-flex align-items-center" href="/">
            <img src="/favicon.ico" alt="ACG Logo" class="brand-logo me-2">
            <span style="color: #1396558a;"><?php echo $_smarty_tpl->tpl_vars['config']->value['shop_name'];?>
</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto mb-lg-0">
                <li class="nav-item"><a class="nav-link <?php if ($_smarty_tpl->tpl_vars['title']->value == "首页") {?>active<?php }?>" href="/"><i
                                class="fa-duotone fa-regular fa-cart-shopping nav-icon"></i>购物</a></li>
                <li class="nav-item"><a class="nav-link <?php if ($_smarty_tpl->tpl_vars['title']->value == "订单查询") {?>active<?php }?>"
                                        href="/user/index/query"><i
                                class="fa-duotone fa-regular fa-folders nav-icon"></i>订单查询</a></li>
            </ul>
            <div class="d-none d-lg-flex search-input" role="search">
                <div class="input-group">
                    <span class="input-group-text"><i
                                class="fa-duotone fa-regular fa-magnifying-glass nav-icon"></i></span>
                    <input class="form-control item-search-input" type="search" placeholder="搜索商品关键词.."
                           aria-label="Search">
                </div>
            </div>
        </div>

        <?php if ($_smarty_tpl->tpl_vars['user']->value) {?>
            <div class="ms-2 user-info-box">
                <div class="dropdown">
                    <button class="btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center"
                            type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <img id="user-avatar"
                             src="<?php echo $_smarty_tpl->tpl_vars['user']->value['avatar'];?>
"
                             alt="用户头像" class="rounded-circle me-2"
                             style="width: 32px; height: 32px; object-fit: cover; background-color: #f8f9fa;">
                        <div class="d-flex flex-column align-items-start me-2">
                                <span id="username" class="fw-bold text-dark"
                                      style="font-size: 14px; line-height: 1.2;"><?php echo $_smarty_tpl->tpl_vars['user']->value['username'];?>
</span>
                            <span id="user-balance" class="text-muted" style="font-size: 12px; line-height: 1.2;">余额: <span
                                        class="text-success">¥<?php echo $_smarty_tpl->tpl_vars['user']->value['balance'];?>
</span></span>
                        </div>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="/user/dashboard/index"><i
                                        class="fa-duotone fa-regular fa-user me-2"></i>个人中心</a></li>
                        <li><a class="dropdown-item" href="/user/recharge/index"><i
                                        class="fa-duotone fa-regular fa-wallet me-2"></i>钱包充值</a></li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li><a class="dropdown-item" href="/user/personal/purchaseRecord"><i
                                        class="fa-duotone fa-regular fa-receipt me-2"></i>我的订单</a></li>
                        <li><a class="dropdown-item" href="/user/security/personal"><i
                                        class="fa-duotone fa-regular fa-gear me-2"></i>设置</a></li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li><a class="dropdown-item text-danger" href="/user/authentication/logout"><i
                                        class="fa-duotone fa-regular fa-sign-out me-2"></i>退出登录</a></li>
                    </ul>
                </div>
            </div>
        <?php } else { ?>
            <div class="ms-2 user-login-box">
                <a class="btn btn-outline-secondary btn-sm br-12" href="/user/authentication/login"><i
                            class="fa-duotone fa-regular fa-right-to-bracket nav-icon"></i>登录</a>
                <a class="btn btn-primary btn-sm br-12" href="/user/authentication/register"><i
                            class="fa-duotone fa-regular fa-user-plus nav-icon"></i>创建账号</a>
            </div>
        <?php }?>

    </div>
</nav>
<div id="pjax-container"><?php }
}
