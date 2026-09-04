"use client";

import { useEffect, useState } from "react";

export interface SessionUser {
  id: number;
  username: string;
  nicename?: string;
  avatar: string;
  email?: string;
  phone?: string;
  qq?: string;
  alipay?: string;
  wechat?: string;
  wallet_address?: string;
  settlement?: number;
  balance: string;
  coin?: string;
  recharge?: string;
  total_coin?: string;
  create_time?: string;
  login_time?: string;
  last_login_time?: string;
  login_ip?: string;
  last_login_ip?: string;
  app_key?: string;
  business_level?: { id: number; name: string; supplier: number } | null;
  group?: { name: string; icon: string } | null;
}

/** 顶栏登录态:调 whoami,游客返回 null;loading 期间为 undefined */
export function useUser(): SessionUser | null | undefined {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    fetch("/user/api/personal/whoami", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) =>
        setUser(json.code === 200 && json.data?.id ? json.data : null)
      )
      .catch(() => setUser(null));
  }, []);

  return user;
}
