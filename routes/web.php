<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/migrate-db', function () {
    try {
        Artisan::call('migrate:fresh', ['--force' => true]);
        return response()->json(['status' => 'success', 'output' => Artisan::output()]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
    }
});

Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*');
