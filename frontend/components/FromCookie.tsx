"use client";

import { useEffect } from "react";

/** 把推广参数 ?from=uid 写成 cookie，下单/注册时 PHP 才能认到上级。 */
export default function FromCookie() {
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    if (from && /^\d+$/.test(from)) {
      document.cookie = `promotion_from=${from};path=/;max-age=${10 * 365 * 24 * 3600}`;
    }
  }, []);
  return null;
}
