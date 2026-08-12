<?php
declare(strict_types=1);

namespace App\View\User\Theme\Tokyo;

use App\Consts\Render;

/**
 * Tokyo 前台主题（对齐参考站样式）
 */
interface Config
{
    const INFO = [
        "NAME" => "Tokyo",
        "AUTHOR" => "acg-faka",
        "VERSION" => "1.0.0",
        "WEB_SITE" => "#",
        "DESCRIPTION" => "现代黑白极简商城主题：分类树 + 商品表",
        "RENDER" => Render::ENGINE_SMARTY
    ];

    const SUBMIT = [
        [
            "title" => "ICP备案号",
            "name" => "icp",
            "type" => "input",
            "placeholder" => "填写后将会在店铺底部显示ICP备案号，不填写则不显示。"
        ],
        [
            "title" => "商品列表显示销量",
            "name" => "show_sold",
            "type" => "switch",
            "text" => "开启",
            "default" => 0
        ],
    ];

    /**
     * 仅覆盖商城前台模板；会员中心/登录仍走 Cartoon（glass）
     */
    const THEME = [
        "INDEX" => "Index/Index.html",
        "CLOSED" => "Index/Closed.html",
        "QUERY" => "Index/Query.html",
        "ITEM" => "Index/Item.html",
    ];
}
