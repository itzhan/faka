<?php
declare(strict_types=1);

namespace App\Util;

use App\Model\Config;
use Kernel\Exception\JSONException;

class Community
{
    public const TYPES = [
        'telegram_notice' => '电报通知群',
        'telegram_chat' => '电报交流群',
        'qq_notice' => 'QQ 通知群',
    ];

    private const MAX_ITEMS = 30;
    private const IMAGE_PATTERN = '#^/assets/cache/general/image/[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|gif|bmp)$#i';

    /**
     * @return list<array{id:string,type:string,name:string,url:string,image:string}>
     */
    public static function decode(?string $raw): array
    {
        if ($raw === null || $raw === '') {
            return [];
        }
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            return [];
        }
        $out = [];
        foreach ($decoded as $row) {
            if (!is_array($row)) {
                continue;
            }
            $item = self::sanitizeItem($row, false);
            if ($item !== null) {
                $out[] = $item;
            }
            if (count($out) >= self::MAX_ITEMS) {
                break;
            }
        }
        return $out;
    }

    /**
     * @return list<array{id:string,type:string,name:string,url:string,image:string}>
     */
    public static function publicList(): array
    {
        $list = [];
        foreach (self::decode(Config::get('community_groups')) as $item) {
            if ($item['url'] !== '' || $item['image'] !== '') {
                $list[] = $item;
            }
        }
        return $list;
    }

    /**
     * @param mixed $input
     * @return list<array{id:string,type:string,name:string,url:string,image:string}>
     * @throws JSONException
     */
    public static function normalizeSave(mixed $input): array
    {
        if (!is_array($input)) {
            throw new JSONException('社群列表格式不正确');
        }
        if (count($input) > self::MAX_ITEMS) {
            throw new JSONException('最多保存 ' . self::MAX_ITEMS . ' 个社群');
        }
        $out = [];
        $usedIds = [];
        foreach ($input as $row) {
            if (!is_array($row)) {
                throw new JSONException('社群条目格式不正确');
            }
            $item = self::sanitizeItem($row, true);
            if ($item === null) {
                throw new JSONException('社群类型不正确');
            }
            if ($item['url'] === '' && $item['image'] === '') {
                throw new JSONException('每个社群至少填写邀请链接或上传图片');
            }
            while ($item['id'] === '' || isset($usedIds[$item['id']])) {
                $item['id'] = bin2hex(random_bytes(4));
            }
            $usedIds[$item['id']] = true;
            $out[] = $item;
        }
        return $out;
    }

    /**
     * @param array<mixed> $row
     * @return array{id:string,type:string,name:string,url:string,image:string}|null
     */
    private static function sanitizeItem(array $row, bool $strict): ?array
    {
        $type = trim((string)($row['type'] ?? ''));
        if (!isset(self::TYPES[$type])) {
            return null;
        }
        $name = trim((string)($row['name'] ?? ''));
        if ($name === '') {
            $name = self::TYPES[$type];
        }
        if (str_contains($name, "\0") || preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', $name)) {
            if ($strict) {
                throw new JSONException('社群名称包含不允许的字符');
            }
            $name = self::TYPES[$type];
        }
        if (mb_strlen($name) > 32) {
            $name = mb_substr($name, 0, 32);
        }
        $id = preg_replace('/[^A-Za-z0-9_-]/', '', (string)($row['id'] ?? '')) ?? '';
        if (strlen($id) > 32) {
            $id = substr($id, 0, 32);
        }
        return [
            'id' => $id,
            'type' => $type,
            'name' => $name,
            'url' => self::sanitizeUrl((string)($row['url'] ?? ''), $strict),
            'image' => self::sanitizeImage((string)($row['image'] ?? ''), $strict),
        ];
    }

    private static function sanitizeUrl(string $value, bool $strict): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }
        if (preg_match('/[\x00-\x20\x7f\\\\]/', $value)
            || filter_var($value, FILTER_VALIDATE_URL) === false
            || !in_array(strtolower((string)parse_url($value, PHP_URL_SCHEME)), ['http', 'https'], true)
            || parse_url($value, PHP_URL_HOST) === null
            || parse_url($value, PHP_URL_USER) !== null
            || parse_url($value, PHP_URL_PASS) !== null) {
            if ($strict) {
                throw new JSONException('社群链接仅支持不含账号密码的 HTTP/HTTPS 地址');
            }
            return '';
        }
        if (mb_strlen($value) > 2048) {
            if ($strict) {
                throw new JSONException('社群链接超出允许长度');
            }
            return '';
        }
        return $value;
    }

    private static function sanitizeImage(string $value, bool $strict): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }
        if (!preg_match(self::IMAGE_PATTERN, $value)) {
            if ($strict) {
                throw new JSONException('社群图片路径不正确，请重新上传');
            }
            return '';
        }
        return $value;
    }
}
