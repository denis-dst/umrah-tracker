<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>Umrah Tracker</title>
    <meta name="description" content="Aplikasi pemandu dan pelacak ibadah Umrah mandiri">
    
    <!-- PWA Basic Tags -->
    <meta name="theme-color" content="#1a1a2e">
    <link rel="icon" href="/favicon.ico">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
