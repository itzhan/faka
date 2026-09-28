#!/usr/bin/env bash
# 线上更新：在服务器 /opt/faka 执行 bash deploy/update-prod.sh
# 只做快进拉取；服务器本地改过的文件（如插件商店更新的微信支付插件）若与仓库冲突，
# git 会拒绝并中止，不会覆盖。数据库配置、runtime/、.env 不在仓库里，不受影响。
set -euo pipefail
cd /opt/faka

before=$(git rev-parse HEAD)
git pull --ff-only origin main
after=$(git rev-parse HEAD)
if [ "$before" = "$after" ]; then
  echo "已是最新：$(git log -1 --oneline)"
  exit 0
fi

# 模板编译缓存要清掉，否则会继续使用旧页面
rm -f runtime/view/compile/*

changed=$(git diff --name-only "$before" "$after")

if echo "$changed" | grep -q '^frontend/'; then
  cd frontend
  if echo "$changed" | grep -qE '^frontend/package(-lock)?\.json$'; then
    npm ci
  fi
  # 转发地址在构建时写入，需与 faka-frontend 服务的 API_BASE 一致
  API_BASE=http://127.0.0.1:8180 npx next build
  systemctl restart faka-frontend
  cd ..
fi

echo "已更新：$(git log -1 --oneline)"
