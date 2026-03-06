<?php
/* Smarty version 3.1.46, created on 2026-03-05 14:30:08
  from '/var/www/html/app/View/Rewrite.html' */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.46',
  'unifunc' => 'content_69a922f0c5d140_27106188',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '529ff4f9885b3fda9cabb32d7c54475bd502edbf' => 
    array (
      0 => '/var/www/html/app/View/Rewrite.html',
      1 => 1772603843,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
),false)) {
function content_69a922f0c5d140_27106188 (Smarty_Internal_Template $_smarty_tpl) {
?><!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>正在进行伪静态探测..</title>
    <?php echo '<script'; ?>
 src="/assets/static/jquery.min.js"><?php echo '</script'; ?>
>
    <style>
        body {
            background: url('/assets/admin/images/login/bg.jpg') fixed no-repeat;
            background-size: cover;
            font-family: 'Montserrat', sans-serif;
        }

        .container {
            position: absolute;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            top: 50%;
            left: 50%;
        }

        form {
            background: rgba(255, 255, 255, 0.3);
            padding: 3em;
            border-radius: 20px;
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
            box-shadow: 20px 20px 40px -6px rgba(0, 0, 0, 0.2);
            text-align: center;
            position: relative;
            -webkit-transition: all 0.2s ease-in-out;
            transition: all 0.2s ease-in-out;
        }

        form p {
            font-weight: bolder;
            color: pink;
            font-size: 1.4rem;
            margin-top: 0;
        }

    </style>
</head>
<body>
<div class="container">
    <form>
        <p class="message">正在检测..</p>
    </form>
</div>
<?php echo '<script'; ?>
>
    $.post("/install/rewrite", res => {
        window.location.href = "/install/step";
    }).fail(error => {
        $('.message').html("请先设置伪静态后在安装程序。");
    });
<?php echo '</script'; ?>
>
</body>
</html>
<?php }
}
