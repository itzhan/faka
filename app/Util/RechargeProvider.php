<?php
declare(strict_types=1);

namespace App\Util;

use App\Model\Config;
use Kernel\Exception\JSONException;

/**
 * 自助充值页的上游充值商家。兑换码按前缀匹配商家，整串原样发给该商家。
 * 每种对接类型(driver)的接口互不兼容，由前台 frontend/lib/recharge/drivers 下的代码各自实现。
 */
class RechargeProvider
{
    public const DRIVERS = [
        'beibei' => '贝贝充值',
    ];

    public const CONFIG_KEY = 'recharge_providers';

    private const MAX_ITEMS = 20;
    private const PREFIX_PATTERN = '/^[A-Za-z0-9_-]{1,16}$/';

    /**
     * 完整配置(含密钥)，只在服务端使用。
     * @return list<array{id:string,name:string,driver:string,prefix:string,api_base:string,token:string,enabled:bool}>
     */
    public static function all(): array
    {
        $decoded = json_decode((string)Config::get(self::CONFIG_KEY), true);
        if (!is_array($decoded)) {
            return [];
        }
        $out = [];
        foreach ($decoded as $row) {
            if (is_array($row) && isset(self::DRIVERS[$row['driver'] ?? ''])) {
                $out[] = [
                    'id' => (string)($row['id'] ?? ''),
                    'name' => (string)($row['name'] ?? ''),
                    'driver' => (string)$row['driver'],
                    'prefix' => (string)($row['prefix'] ?? ''),
                    'api_base' => (string)($row['api_base'] ?? ''),
                    'token' => (string)($row['token'] ?? ''),
                    'enabled' => (bool)($row['enabled'] ?? false),
                ];
            }
        }
        return $out;
    }

    /**
     * 管理端展示用：不回传密钥，只标记是否已配置。
     * @return list<array<string,mixed>>
     */
    public static function adminList(): array
    {
        return array_map(static function (array $item): array {
            $item['has_token'] = $item['token'] !== '';
            unset($item['token']);
            return $item;
        }, self::all());
    }

    /**
     * 按前缀匹配已启用的商家(不区分大小写，最长前缀优先)。
     */
    public static function matchCode(string $code): ?array
    {
        $best = null;
        foreach (self::all() as $item) {
            if (!$item['enabled'] || $item['prefix'] === '') {
                continue;
            }
            if (stripos($code, $item['prefix']) === 0
                && ($best === null || strlen($item['prefix']) > strlen($best['prefix']))) {
                $best = $item;
            }
        }
        return $best;
    }

    /**
     * 查询充值进度时按商家 ID 找回配置；已停用的商家仍允许查询进行中的订单。
     */
    public static function findById(string $id): ?array
    {
        foreach (self::all() as $item) {
            if ($id !== '' && $item['id'] === $id) {
                return $item;
            }
        }
        return null;
    }

    /**
     * @return list<array{id:string,name:string,driver:string,prefix:string,api_base:string,token:string,enabled:bool}>
     * @throws JSONException
     */
    public static function normalizeSave(mixed $input): array
    {
        if (!is_array($input)) {
            throw new JSONException('充值商家列表格式不正确');
        }
        if (count($input) > self::MAX_ITEMS) {
            throw new JSONException('最多保存 ' . self::MAX_ITEMS . ' 个充值商家');
        }
        $stored = [];
        foreach (self::all() as $item) {
            $stored[$item['id']] = $item;
        }

        $out = [];
        $usedIds = [];
        $usedPrefixes = [];
        foreach ($input as $row) {
            if (!is_array($row)) {
                throw new JSONException('充值商家条目格式不正确');
            }
            $driver = trim((string)($row['driver'] ?? ''));
            if (!isset(self::DRIVERS[$driver])) {
                throw new JSONException('对接类型不正确');
            }
            $name = trim((string)($row['name'] ?? ''));
            if ($name === '') {
                $name = self::DRIVERS[$driver];
            }
            if (preg_match('/[\x00-\x1f\x7f]/', $name) || mb_strlen($name) > 32) {
                throw new JSONException('商家名称不能超过 32 个字符，且不能包含控制字符');
            }

            $prefix = trim((string)($row['prefix'] ?? ''));
            if (!preg_match(self::PREFIX_PATTERN, $prefix)) {
                throw new JSONException("「{$name}」的前缀只能是 1-16 位字母、数字、- 或 _");
            }
            $prefixKey = strtolower($prefix);
            if (isset($usedPrefixes[$prefixKey])) {
                throw new JSONException("前缀「{$prefix}」重复了，每个商家的前缀必须不同");
            }
            $usedPrefixes[$prefixKey] = true;

            $apiBase = rtrim(trim((string)($row['api_base'] ?? '')), '/');
            if (filter_var($apiBase, FILTER_VALIDATE_URL) === false
                || !in_array(strtolower((string)parse_url($apiBase, PHP_URL_SCHEME)), ['http', 'https'], true)
                || parse_url($apiBase, PHP_URL_USER) !== null
                || strlen($apiBase) > 512) {
                throw new JSONException("「{$name}」的接口地址需要是 HTTP/HTTPS 地址");
            }

            $id = preg_replace('/[^A-Za-z0-9]/', '', (string)($row['id'] ?? '')) ?? '';
            $id = substr($id, 0, 16);
            while ($id === '' || isset($usedIds[$id])) {
                $id = bin2hex(random_bytes(4));
            }
            $usedIds[$id] = true;

            // 密钥留空表示沿用已保存的值
            $token = trim((string)($row['token'] ?? ''));
            if ($token === '') {
                $token = $stored[$id]['token'] ?? '';
            } elseif (preg_match('/[\x00-\x20\x7f]/', $token) || strlen($token) > 1024) {
                throw new JSONException("「{$name}」的密钥格式不正确");
            }
            if ($token === '') {
                throw new JSONException("请填写「{$name}」的密钥");
            }

            $out[] = [
                'id' => $id,
                'name' => $name,
                'driver' => $driver,
                'prefix' => $prefix,
                'api_base' => $apiBase,
                'token' => $token,
                'enabled' => filter_var($row['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ];
        }
        return $out;
    }
}
