-- 商品封面图 / 详情图拆分
ALTER TABLE `acg_commodity`
    ADD COLUMN `detail_image` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '商品详情图片' AFTER `cover`;
