<?php
declare(strict_types=1);

namespace App\Controller\User\Api;

use App\Controller\Base\API\User;
use App\Util\RechargeProvider as Provider;

/**
 * 仅供前台 Next 服务端调用：按兑换码前缀或商家 ID 取回充值商家配置(含密钥)。
 * 通过与 Next 共享的 RECHARGE_INTERNAL_KEY 鉴权，未配置时一律拒绝。
 */
class RechargeProvider extends User
{
    public function resolve(): array
    {
        $expected = (string)getenv('RECHARGE_INTERNAL_KEY');
        $given = (string)($_SERVER['HTTP_X_RECHARGE_KEY'] ?? '');
        if (strlen($expected) < 16 || !hash_equals($expected, $given)) {
            http_response_code(403);
            return $this->json(403, '无权访问');
        }

        $body = json_decode((string)file_get_contents('php://input'), true);
        $code = is_array($body) ? trim((string)($body['code'] ?? '')) : '';
        $id = is_array($body) ? trim((string)($body['id'] ?? '')) : '';

        $provider = $code !== '' ? Provider::matchCode($code) : Provider::findById($id);
        if (!$provider) {
            return $this->json(404, '未匹配到充值商家');
        }
        return $this->json(200, 'success', [
            'id' => $provider['id'],
            'driver' => $provider['driver'],
            'api_base' => $provider['api_base'],
            'token' => $provider['token'],
        ]);
    }
}
