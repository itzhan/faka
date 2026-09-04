<?php
declare(strict_types=1);

namespace App\Controller\User;

use App\Controller\Base\View\User;
use App\Interceptor\UserSession;
use App\Interceptor\Waf;
use Kernel\Annotation\Interceptor;
use Kernel\Exception\JSONException;

#[Interceptor([Waf::class])]
class Personal extends User
{
    /**
     * 购买记录
     * @return string
     * @throws \Kernel\Exception\ViewException
     * @throws \ReflectionException
     */
    public function purchaseRecord(): string
    {
        $tradeNo = trim((string)($_GET['tradeNo'] ?? ''));
        $url = \App\Util\Client::getStorefrontUrl() . '/me/orders';
        if ($tradeNo !== '') {
            $url .= '?tradeNo=' . urlencode($tradeNo);
        }
        header('Location: ' . $url, true, 302);
        exit;
    }

    /**
     * 下载宝贝信息
     * @throws \Kernel\Exception\JSONException
     */
    #[Interceptor([UserSession::class])]
    public function secretDownload(): string
    {
        $id = (int)$_GET['id'];

        $order = \App\Model\Order::query()->where("owner", $this->getUser()->id)->find($id);

        if (!$order) {
            throw new JSONException("订单不存在");
        }
        header('Content-Type:application/octet-stream');
        header('Content-Transfer-Encoding:binary');
        header('Content-Disposition:attachment; filename=宝贝信息-' . $order->trade_no . '.txt');
        return (string)$order->secret;
    }
}