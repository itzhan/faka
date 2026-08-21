-- ============================================================
-- 数据库迁移：acg-faka 3.2.6 → 3.4.9（用于现有数据库）
-- 全新安装无需执行（Install.sql 已包含这些结构）。
--
-- 使用方法：
--   1. 先备份数据库！
--   2. 把下方所有 __PREFIX__ 替换为你的实际表前缀（默认 acg_）。
--   3. 在数据库中执行本文件。
--   4. 列已存在会报 "Duplicate column" 错误，可安全忽略并跳过该行。
-- ============================================================

-- card 表：预选成本
ALTER TABLE `__PREFIX__card`
    ADD COLUMN `cost` decimal(10,2) unsigned DEFAULT 0 COMMENT '预选成本';

-- commodity 表：同步开关
ALTER TABLE `__PREFIX__commodity`
    ADD COLUMN `shared_amount_sync` tinyint UNSIGNED DEFAULT 0 COMMENT '同步金额',
    ADD COLUMN `shared_config_sync` tinyint UNSIGNED DEFAULT 0 COMMENT '同步配置参数';

-- user 表：USDT 提现钱包地址
ALTER TABLE `__PREFIX__user`
    ADD COLUMN `wallet_address` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '钱包地址';

-- config 表：新配置项（已存在则自动跳过）
INSERT IGNORE INTO `__PREFIX__config` (`key`, `value`) VALUES ('session_expire', '0');
INSERT IGNORE INTO `__PREFIX__config` (`key`, `value`) VALUES ('cash_type_usdt', '1');
INSERT IGNORE INTO `__PREFIX__config` (`key`, `value`) VALUES ('user_center_theme', 'MountFuji');
