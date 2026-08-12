<?php
declare(strict_types=1);

namespace App\View\User\Theme\Nagoya;

use App\Consts\Render;

/**
 * Nagoya 前台主题（对齐参考站 ?theme=Nagoya）
 */
interface Config
{
    const INFO = [
        "NAME" => "Nagoya",
        "AUTHOR" => "acg-faka",
        "VERSION" => "1.0.0",
        "WEB_SITE" => "#",
        "DESCRIPTION" => "Nagoya 导航式商城主题：主分类轨道 + 商品网格",
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
            "default" => 1
        ],
    ];

    const THEME = [
        "INDEX" => "Index/Index.html",
        "CLOSED" => "Index/Closed.html",
        "QUERY" => "Index/Query.html",
        "ITEM" => "Index/Item.html",
    ];
}
