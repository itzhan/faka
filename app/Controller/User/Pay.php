<?php
declare(strict_types=1);

namespace App\Controller\User;


use App\Controller\Base\View\User;
use App\Interceptor\Waf;
use App\Model\Order;
use App\Model\OrderOption;
use Kernel\Annotation\Interceptor;
use Kernel\Exception\JSONException;
use Kernel\Exception\ViewException;
use Kernel\Util\View;
use App\Util\PayConfig;

#[Interceptor(Waf::class)]
class Pay extends User
{
    /**
     * @return string
     * @throws JSONException
     * @throws ViewException
     * @throws \SmartyException
     */
    public function order(): string
    {
        if (!isset($_GET['_PARAMETER'][0]) || !isset($_GET['_PARAMETER'][1])) {
            return '订单不存在';
        }

        $tradeNo = trim((string)$_GET['_PARAMETER'][0]);
        $type = (int)$_GET['_PARAMETER'][1];
        //获取订单信息
        $order = Order::with(['pay'])->where("trade_no", $tradeNo)->first();
        if (!$order) {
            return '订单不存在';
        }

        if (!$order->pay) {
            return '支付方式不存在';
        }

        $data = OrderOption::get($order->id) ?? [];
        $returnUrl = (string)($data['returnUrl'] ?? '/');
        $payUrl = trim((string)$order->pay_url);
        $tradeNo = trim((string)$order->trade_no);
        $amount = (string)$order->amount;
        $createTime = (string)$order->create_time;

        if ($type == 2) {
            if ($data === []) {
                throw new JSONException("参数错误");
            }
            return $this->render("正在下单，请稍后..", "Submit.html", [
                "url" => $payUrl,
                "data" => $data
            ]);
        }

        //路径安全在 renderTemplate 里把关：code 是站长可填的值，不能直接拼进文件路径
        $html = PayConfig::renderTemplate((string)$order->pay->handle, (string)$order->pay->code);

        if ($html === null) {
            throw new JSONException("视图不存在");
        }

        $vars = [
            'amount' => $amount,
            'tradeNo' => $tradeNo,
            'payUrl' => $payUrl,
            'createTime' => $createTime,
            'returnUrl' => $returnUrl,
            'tradeNoJs' => json_encode($tradeNo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'payUrlJs' => json_encode($payUrl, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'returnUrlJs' => json_encode($returnUrl, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'order' => [
                'amount' => $amount,
                'trade_no' => $tradeNo,
                'pay_url' => $payUrl,
                'create_date' => $createTime,
                'create_time' => $createTime,
            ],
            'option' => ['returnUrl' => $returnUrl],
        ];

        // 收银台不要走主题钩子，否则会把 404 页嵌进支付二维码页
        return View::render($html, $vars, BASE_PATH . '/app/Pay/', false);
    }
}