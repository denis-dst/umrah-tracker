<?php

// Trik Paksa /tmp Vercel
if (isset($_ENV['VERCEL'])) {
    $storage = '/tmp/storage';
    // Jika Vercel baru saja bangun dari tidur (sleep state), folder mungkin hilang. Buat ulang.
    $dirs = [
        $storage . '/app/public',
        $storage . '/framework/cache/data',
        $storage . '/framework/sessions',
        $storage . '/framework/testing',
        $storage . '/framework/views',
        $storage . '/logs',
        '/tmp/bootstrap/cache'
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
    }

    // Paksa Laravel Menggunakan /tmp untuk cache bootstrap-nya (SANGAT PENTING!)
    putenv('APP_CONFIG_CACHE=/tmp/bootstrap/cache/config.php');
    putenv('APP_SERVICES_CACHE=/tmp/bootstrap/cache/services.php');
    putenv('APP_PACKAGES_CACHE=/tmp/bootstrap/cache/packages.php');
    putenv('APP_ROUTES_CACHE=/tmp/bootstrap/cache/routes.php');
    putenv('APP_EVENTS_CACHE=/tmp/bootstrap/cache/events.php');
}

// Lanjutkan memuat aplikasi
require __DIR__ . '/../public/index.php';
