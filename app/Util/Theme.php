<?php
declare(strict_types=1);

namespace App\Util;

/**
 * Class Theme
 * @package App\Util
 */
class Theme
{

    /**
     * @param string $name
     * @return array|null
     */
    public static function getConfig(string $name): ?array
    {
        try {
            $data = Context::get("theme_" . $name);
            if ($data) {
                return $data;
            }

            $interface = "\\App\\View\\User\\Theme\\{$name}\\Config";
            $submitJsPath = BASE_PATH . "/app/View/User/Theme/{$name}/Submit.js";

            if (!interface_exists($interface)) {
                return null;
            }

            $info = $interface::INFO;
            $info['KEY'] = $name;


            $ref = new \ReflectionClass($interface);
            $submit = $ref->getConstant("SUBMIT");

            if (!$submit) {
                $submit = [];
            }

            //获取配置
            $setting = [];
            $settingPath = BASE_PATH . "/app/View/User/Theme/{$name}/Setting.php";
            Opcache::invalidate($settingPath);

            if (file_exists($settingPath)) {
                $setting = (array)require($settingPath);
                foreach ($submit as $index => $item) {
                    if (isset($setting[$item['name']])) {
                        $submit[$index]['default'] = $setting[$item['name']];
                    }
                }
            }

            if (is_file($submitJsPath)) {
                $submit = file_get_contents($submitJsPath) ?: "";
            }

            $data = ["info" => $info, "theme" => $interface::THEME, "submit" => $submit, "setting" => $setting];
            Context::set("theme_" . $name, $data);
            return $data;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * @return array
     */
    public static function getThemes(): array
    {
        $path = BASE_PATH . '/app/View/User/Theme/';
        $list = scandir($path);
        $dir = [];
        foreach ($list as $item) {
            if ($item != '.' && $item != '..' && is_dir($path . $item)) {
                $dir[] = $item;
            }
        }
        $plug = [];
        foreach ($dir as $value) {
            $platformInfo = self::getConfig($value);
            if (!empty($platformInfo)) {
                $plug[] = $platformInfo;
            }
        }
        return $plug;
    }

    /**
     * 默认模板（Cartoon）实际对照的前台皮肤。
     * 授权校验会把 user_theme 改回 Cartoon，对照项不会被改回。
     */
    public static function resolveStorefrontTheme(?string $theme, ?array $cfg = null): string
    {
        $theme = trim((string)$theme);
        if ($theme === '' || $theme === '0') {
            $theme = 'Cartoon';
        }
        if ($theme !== 'Cartoon') {
            return $theme;
        }

        $alias = '';
        if (is_array($cfg) && array_key_exists('user_theme_alias', $cfg)) {
            $alias = trim((string)$cfg['user_theme_alias']);
        } else {
            try {
                $alias = trim((string)\App\Model\Config::get('user_theme_alias'));
            } catch (\Throwable $e) {
                $alias = '';
            }
        }

        if ($alias === '' || $alias === '0') {
            $alias = 'Tokyo';
        }
        if ($alias === 'Cartoon') {
            return 'Cartoon';
        }
        if (!preg_match('/^[A-Za-z][A-Za-z0-9_]{0,63}$/', $alias)
            || !is_dir(BASE_PATH . '/app/View/User/Theme/' . $alias)
            || !is_file(BASE_PATH . '/app/View/User/Theme/' . $alias . '/Config.php')) {
            return 'Cartoon';
        }
        return $alias;
    }
}