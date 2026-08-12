-- ============================================================
-- 数据库迁移：acg-faka 3.4.9 → 3.5.6（用于现有数据库）
-- 全新安装无需执行（Install.sql 已包含这些结构）。
--
-- 使用方法：
--   1. 先备份数据库！
--   2. 把下方所有 __PREFIX__ 替换为你的实际表前缀（默认 acg_）。
--   3. 在数据库中执行本文件。
--   4. 列/表已存在会报错，可安全忽略并跳过该语句。
-- ============================================================

-- manage 表：谷歌验证器
ALTER TABLE `__PREFIX__manage`
    ADD COLUMN `google_secret` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '谷歌验证器密钥';

-- config 新配置项
INSERT IGNORE INTO `__PREFIX__config` (`key`, `value`) VALUES ('user_center_mobile_theme', '0');
INSERT IGNORE INTO `__PREFIX__config` (`key`, `value`) VALUES ('callback_ip_whitelist', '0');
INSERT IGNORE INTO `__PREFIX__config` (`key`, `value`) VALUES ('callback_ip_whitelist_rules', '');

-- 管理员会话表
CREATE TABLE IF NOT EXISTS `__PREFIX__manage_session` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `manage_id` int UNSIGNED NOT NULL COMMENT '管理员id',
  `session_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '会话标识SHA-256哈希',
  `device_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '设备类型',
  `device_name` varchar(96) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '设备名称',
  `user_agent` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录User-Agent',
  `login_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录IP',
  `last_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '最近IP',
  `created_time` datetime NOT NULL COMMENT '登录时间',
  `last_seen_time` datetime NOT NULL COMMENT '最近活跃时间',
  `expires_time` datetime NOT NULL COMMENT '过期时间',
  `revoked_time` datetime NULL DEFAULT NULL COMMENT '撤销时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `session_hash`(`session_hash` ASC) USING BTREE,
  INDEX `manage_active`(`manage_id` ASC, `revoked_time` ASC, `expires_time` ASC) USING BTREE,
  INDEX `last_seen_time`(`last_seen_time` ASC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

-- 工单
CREATE TABLE IF NOT EXISTS `__PREFIX__ticket` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `ticket_no` char(22) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '工单编号',
  `user_id` int UNSIGNED NOT NULL COMMENT '创建会员id',
  `type` tinyint UNSIGNED NOT NULL COMMENT '类型：0=售前咨询，1=售后支持',
  `priority` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '优先级：0=低，1=中，2=高',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态：0=待客服，1=待用户，2=已解决，3=已关闭',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `commodity_id` int UNSIGNED NULL DEFAULT NULL COMMENT '关联商品id',
  `commodity_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '商品名称快照',
  `order_id` int UNSIGNED NULL DEFAULT NULL COMMENT '关联订单id',
  `order_trade_no` char(19) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '订单号快照',
  `order_source` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '订单来源：0=无，1=会员，2=游客',
  `proof_upload_id` int UNSIGNED NULL DEFAULT NULL COMMENT '购买凭证上传记录id',
  `proof_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '购买凭证路径快照',
  `last_message_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '最后消息id',
  `last_sender_type` tinyint UNSIGNED NULL DEFAULT NULL COMMENT '最后发言方：0=用户，1=管理员，2=系统',
  `last_message_excerpt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '最后消息摘要',
  `last_message_time` datetime NULL DEFAULT NULL COMMENT '最后消息时间',
  `user_unread` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户未读数',
  `manage_unread` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '后台未读数',
  `closed_by` int UNSIGNED NULL DEFAULT NULL COMMENT '结束工单的管理员id',
  `closed_time` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ticket_no`(`ticket_no` ASC) USING BTREE,
  INDEX `user_status_message`(`user_id` ASC, `status` ASC, `last_message_time` ASC) USING BTREE,
  INDEX `status_priority_message`(`status` ASC, `priority` ASC, `last_message_time` ASC) USING BTREE,
  INDEX `commodity_id`(`commodity_id` ASC) USING BTREE,
  INDEX `order_id`(`order_id` ASC) USING BTREE,
  INDEX `proof_upload_id`(`proof_upload_id` ASC) USING BTREE,
  INDEX `closed_by`(`closed_by` ASC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `__PREFIX__ticket_message` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `ticket_id` int UNSIGNED NOT NULL COMMENT '工单id',
  `sender_type` tinyint UNSIGNED NOT NULL COMMENT '发送方：0=用户，1=管理员，2=系统',
  `sender_id` int UNSIGNED NULL DEFAULT NULL COMMENT '发送方id',
  `sender_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '发送方名称快照',
  `kind` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '消息类型：0=正文，1=解决回复，2=关闭事件',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '消息内容',
  `create_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '发送IP',
  `create_time` datetime NOT NULL COMMENT '发送时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ticket_message_id`(`ticket_id` ASC, `id` ASC) USING BTREE,
  INDEX `sender`(`sender_type` ASC, `sender_id` ASC) USING BTREE,
  INDEX `create_time`(`create_time` ASC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

-- 系统消息
CREATE TABLE IF NOT EXISTS `__PREFIX__system_message` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `audience_type` tinyint UNSIGNED NOT NULL COMMENT '接收范围：0=全体用户，1=会员等级，2=指定用户',
  `audience_id` int UNSIGNED NULL DEFAULT NULL COMMENT '会员等级id或指定用户id',
  `audience_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '接收范围名称快照',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息标题',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '净化后的消息正文',
  `summary` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息摘要',
  `jump_url` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '点击跳转地址',
  `recipient_count` int UNSIGNED NOT NULL DEFAULT 0 COMMENT '发送时接收人数',
  `created_by` int UNSIGNED NULL DEFAULT NULL COMMENT '创建管理员id',
  `updated_by` int UNSIGNED NULL DEFAULT NULL COMMENT '最后编辑管理员id',
  `manage_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '创建管理员名称快照',
  `update_manage_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '最后编辑管理员名称快照',
  `create_time` datetime NOT NULL COMMENT '发送时间',
  `update_time` datetime NOT NULL COMMENT '最后编辑时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `audience`(`audience_type` ASC, `audience_id` ASC) USING BTREE,
  INDEX `create_time`(`create_time` ASC) USING BTREE,
  INDEX `created_by`(`created_by` ASC) USING BTREE,
  INDEX `updated_by`(`updated_by` ASC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `__PREFIX__user_message` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `message_id` int UNSIGNED NOT NULL COMMENT '系统消息id',
  `user_id` int UNSIGNED NOT NULL COMMENT '接收用户id',
  `read_time` datetime NULL DEFAULT NULL COMMENT '首次阅读时间',
  `create_time` datetime NOT NULL COMMENT '接收时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `message_user`(`message_id` ASC, `user_id` ASC) USING BTREE,
  INDEX `user_message`(`user_id` ASC, `id` ASC) USING BTREE,
  INDEX `user_read_message`(`user_id` ASC, `read_time` ASC, `id` ASC) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;
