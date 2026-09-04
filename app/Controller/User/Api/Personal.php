<?php
declare(strict_types=1);

namespace App\Controller\User\Api;

use App\Consts\User as UserConst;
use App\Controller\Base\API\User;
use App\Interceptor\Waf;
use App\Model\Business;
use App\Model\BusinessLevel;
use App\Util\Client;
use App\Util\Date;
use App\Util\JWT;
use Firebase\JWT\Key;
use Kernel\Annotation\Interceptor;

#[Interceptor([Waf::class], Interceptor::TYPE_API)]
class Personal extends User
{
    /**
     * 当前登录用户。游客返回 data=null,不踢会话。
     */
    public function whoami(): array
    {
        $user = $this->userFromCookie();
        if (!$user) {
            return $this->json(data: null);
        }
        return $this->json(data: $this->profile($user));
    }

    /**
     * 我的主页数据(资产/消费/经营)
     */
    public function dashboard(): array
    {
        $user = $this->userFromCookie();
        if (!$user) {
            return $this->json(0, "请先登录", null);
        }
        $uid = (int)$user->id;
        $monthStart = date("Y-m-01 00:00:00");
        $data = [
            "profile" => $this->profile($user),
            "buy_month" => "0.00",
            "buy_total" => "0.00",
            "buy_count" => 0,
            "merchant" => false,
        ];

        $buyModel = \App\Model\Order::query()->where("owner", $uid)->where("status", 1);
        $data["buy_month"] = sprintf("%.2f", (float)(clone $buyModel)->where("create_time", ">=", $monthStart)->sum("amount"));
        $data["buy_total"] = sprintf("%.2f", (float)(clone $buyModel)->sum("amount"));
        $data["buy_count"] = (clone $buyModel)->count();

        $shop = Business::query()->where("user_id", $uid)->first();
        $data["shop"] = $shop ? [
            "shop_name" => (string)$shop->shop_name,
            "title" => (string)$shop->title,
            "notice" => (string)$shop->notice,
            "service_qq" => (string)$shop->service_qq,
            "service_url" => (string)$shop->service_url,
            "subdomain" => (string)$shop->subdomain,
            "topdomain" => (string)$shop->topdomain,
            "master_display" => (int)$shop->master_display,
        ] : null;

        $data["levels"] = BusinessLevel::query()
            ->orderBy("price", "asc")
            ->get(["id", "name", "price", "supplier", "icon", "cost", "substation", "top_domain"])
            ->toArray();

        $fromOrders = \App\Model\Order::query()->where("from", $uid)->where("status", 1);
        $data["promote"] = [
            "share_url" => Client::getStorefrontUrl() . "?from=" . $uid,
            "children" => \App\Model\User::query()->where("pid", $uid)->count(),
            "orders" => (clone $fromOrders)->count(),
            "total" => sprintf("%.2f", (float)(clone $fromOrders)->sum("divide_amount")),
            "month" => sprintf("%.2f", (float)(clone $fromOrders)->where("create_time", ">=", $monthStart)->sum("divide_amount")),
        ];

        if ($user->business_level) {
            $data["merchant"] = true;
            $bill = \App\Model\Bill::query()->where("owner", $uid)->where("type", 1)->where("currency", 1);
            $data["today_income"] = sprintf("%.2f", (float)(clone $bill)->whereBetween("create_time", [Date::calcDay(), Date::calcDay(1)])->sum("amount"));
            $data["yesterday_income"] = sprintf("%.2f", (float)(clone $bill)->whereBetween("create_time", [Date::calcDay(-1), Date::calcDay()])->sum("amount"));
            $data["week_income"] = sprintf("%.2f", (float)(clone $bill)->whereBetween("create_time", [Date::weekDay(1, Date::TYPE_START), Date::weekDay(7, Date::TYPE_END)])->sum("amount"));
            $data["month_income"] = sprintf("%.2f", (float)(clone $bill)->where("create_time", ">=", $monthStart)->sum("amount"));

            $sellModel = \App\Model\Order::query()->where("user_id", $uid)->where("status", 1);
            $data["trade"] = sprintf("%.2f", (float)(clone $sellModel)->sum("amount"));
            $data["today_orders"] = (clone $sellModel)->whereBetween("create_time", [Date::calcDay(), Date::calcDay(1)])->count();
            $data["pending_delivery"] = (clone $sellModel)->where("delivery_status", 0)->count();
            $data["card_unsold"] = \App\Model\Card::query()->where("owner", $uid)->where("status", 0)->count();
            $data["commodity_online"] = \App\Model\Commodity::query()->where("owner", $uid)->where("status", 1)->count();
            $data["commodity_count"] = \App\Model\Commodity::query()->where("owner", $uid)->count();

            $recent = (clone $sellModel)->with(["commodity"])->orderBy("id", "desc")->limit(5)->get();
            $data["recent_sales"] = $recent->map(static function ($row) {
                return [
                    "id" => $row->id,
                    "trade_no" => $row->trade_no,
                    "amount" => $row->amount,
                    "create_time" => $row->create_time,
                    "commodity" => $row->commodity ? [
                        "id" => $row->commodity->id,
                        "name" => $row->commodity->name,
                        "cover" => $row->commodity->cover,
                    ] : null,
                ];
            })->values()->all();

            $series = [];
            $max = 0.0;
            for ($i = 6; $i >= 0; $i--) {
                $amount = (float)(clone $bill)->whereBetween("create_time", [Date::calcDay(-$i), Date::calcDay(-$i + 1)])->sum("amount");
                $max = max($max, $amount);
                $series[] = [
                    "label" => date("m-d", strtotime(Date::calcDay(-$i))),
                    "amount" => sprintf("%.2f", $amount),
                    "value" => $amount,
                ];
            }
            foreach ($series as &$item) {
                $item["pct"] = $max > 0 ? max(3, (int)round($item["value"] / $max * 100)) : 3;
            }
            unset($item);
            $data["week_series"] = $series;
            $data["week_series_max"] = sprintf("%.2f", $max);
        }

        return $this->json(data: $data);
    }

    private function profile(\App\Model\User $user): array
    {
        $level = $user->businessLevel;
        $group = $user->group;
        return [
            "id" => $user->id,
            "username" => $user->username,
            "nicename" => (string)$user->nicename,
            "avatar" => (string)$user->avatar,
            "email" => (string)$user->email,
            "phone" => (string)$user->phone,
            "qq" => (string)$user->qq,
            "alipay" => (string)$user->alipay,
            "wechat" => (string)$user->wechat,
            "wallet_address" => (string)$user->wallet_address,
            "settlement" => (int)$user->settlement,
            "balance" => (string)$user->balance,
            "coin" => (string)$user->coin,
            "recharge" => (string)$user->recharge,
            "create_time" => (string)$user->create_time,
            "login_time" => (string)$user->login_time,
            "last_login_time" => (string)$user->last_login_time,
            "login_ip" => (string)$user->login_ip,
            "last_login_ip" => (string)$user->last_login_ip,
            "app_key" => (string)$user->app_key,
            "total_coin" => (string)$user->total_coin,
            "business_level" => $level ? [
                "id" => (int)$level->id,
                "name" => (string)$level->name,
                "supplier" => (int)$level->supplier,
            ] : null,
            "group" => $group ? [
                "name" => (string)$group->name,
                "icon" => (string)($group->icon ?? ""),
            ] : null,
        ];
    }

    private function userFromCookie(): ?\App\Model\User
    {
        if (!array_key_exists(UserConst::SESSION, $_COOKIE)) {
            return null;
        }
        $userToken = base64_decode((string)$_COOKIE[UserConst::SESSION]);
        if (!$userToken) {
            return null;
        }
        $head = JWT::getHead($userToken);
        if (!isset($head["uid"])) {
            return null;
        }
        $user = \App\Model\User::query()->find($head["uid"]);
        if (!$user) {
            return null;
        }
        try {
            $jwt = \Firebase\JWT\JWT::decode($userToken, new Key($user->password, "HS256"));
        } catch (\Exception $e) {
            return null;
        }
        if ($jwt->expire <= time() || $user->login_time != $jwt->loginTime || $user->status != 1) {
            return null;
        }
        return $user;
    }
}
