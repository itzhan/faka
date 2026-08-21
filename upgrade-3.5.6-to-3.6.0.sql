-- 升级 3.5.6.x -> 3.6.0（表前缀 acg_）
-- 注意：本脚本按当前库缺失项生成；acg_commodity.shared_premium_type、
-- admin_entrance / request_log 配置已存在，不重复添加。

-- ===== 新增列 =====
ALTER TABLE `acg_commodity`
    ADD COLUMN `shared_premium_template` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '加价模板ID：0=未使用模板' AFTER `shared_premium_type`,
    ADD COLUMN `tags` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '商品标签：JSON [{text,color}]';

ALTER TABLE `acg_order`
    ADD COLUMN `leave_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '发货留言快照：下单时从商品复制，商品后续改动不影响历史订单';

ALTER TABLE `acg_pay`
    ADD COLUMN `pay_config_id` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '支付配置id(pay_config.id)：0=未选择配置',
    ADD COLUMN `archived` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '归档：0=正常，1=归档(仅保留供历史订单显示)';

ALTER TABLE `acg_user_commodity`
    ADD COLUMN `rounding` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '价格取整：0=不取整，1=四舍五入到整元，2=向上取整到整元',
    ADD COLUMN `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '自定义商品介绍，NULL/空=沿用主站';

ALTER TABLE `acg_user_recharge`
    ADD COLUMN `pay_cost` decimal(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '支付接口手续费';

-- ===== 新增表 =====
CREATE TABLE IF NOT EXISTS `acg_price_template`  (
    `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '模板名称',
    `base` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '加价基准：0=成本价，1=当前售价',
    `guest_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '游客价加价方式：0=固定金额，1=百分比',
    `guest_value` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '游客价加价值',
    `user_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '会员价加价方式：0=固定金额，1=百分比',
    `user_value` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '会员价加价值',
    `level_config` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '各会员等级加价规则：{等级id:{type,value}}',
    `rounding` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '价格取整：0=不取整，1=四舍五入到整元，2=向上取整到整元',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

CREATE TABLE IF NOT EXISTS `acg_pay_config`  (
    `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `handle` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '所属支付插件目录名(app/Pay/{handle})',
    `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '配置名称，站长自定义，如“主商户”“备用商户”',
    `config` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '配置值：扁平JSON对象，键取自插件 Config/Submit 定义',
    `sort` smallint UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    `update_time` datetime NULL DEFAULT NULL COMMENT '最后修改时间',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `handle_name`(`handle` ASC, `name` ASC) USING BTREE,
    INDEX `handle`(`handle` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

CREATE TABLE IF NOT EXISTS `acg_lang` (
    `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `hash` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'md5(source)',
    `source` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '中文原文',
    `lang` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '目标语言:zh-tw/en/ja',
    `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '译文,NULL=待翻译',
    `scene` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '来源场景:tpl/js/api/dyn/ext:{扩展名}',
    `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '0=待翻译 1=机器翻译 2=人工确认',
    `create_time` datetime NULL DEFAULT NULL,
    `update_time` datetime NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `uk_hash_lang`(`hash` ASC, `lang` ASC) USING BTREE,
    INDEX `idx_lang_status`(`lang` ASC, `status` ASC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

-- ===== 新增配置（按 key 判重，id 自动顺延）=====
INSERT INTO `acg_config` (`key`, `value`)
SELECT * FROM (SELECT 'force_login', '0') tmp
WHERE NOT EXISTS (SELECT 1 FROM `acg_config` WHERE `key` = 'force_login');

INSERT INTO `acg_config` (`key`, `value`)
SELECT * FROM (SELECT 'admin_login_verification', '1') tmp
WHERE NOT EXISTS (SELECT 1 FROM `acg_config` WHERE `key` = 'admin_login_verification');

INSERT INTO `acg_config` (`key`, `value`)
SELECT * FROM (SELECT 'lang_version', '0') tmp
WHERE NOT EXISTS (SELECT 1 FROM `acg_config` WHERE `key` = 'lang_version');

INSERT INTO `acg_config` (`key`, `value`)
SELECT * FROM (SELECT 'user_theme_alias', 'Tokyo') tmp
WHERE NOT EXISTS (SELECT 1 FROM `acg_config` WHERE `key` = 'user_theme_alias');
