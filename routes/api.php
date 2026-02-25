<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Checklist Routes
    Route::get('/checklists', [\App\Http\Controllers\Api\ChecklistController::class, 'index']);
    Route::post('/checklists', [\App\Http\Controllers\Api\ChecklistController::class, 'store']);
    Route::post('/checklists/seed', [\App\Http\Controllers\Api\ChecklistController::class, 'seedDefaults']);
    Route::patch('/checklists/{checklist}/toggle', [\App\Http\Controllers\Api\ChecklistController::class, 'toggle']);
    Route::delete('/checklists/{checklist}', [\App\Http\Controllers\Api\ChecklistController::class, 'destroy']);

    // Plan Routes
    Route::get('/plans', [\App\Http\Controllers\Api\PlanController::class, 'index']);
    Route::post('/plans', [\App\Http\Controllers\Api\PlanController::class, 'store']);
    Route::post('/plans/template', [\App\Http\Controllers\Api\PlanController::class, 'applyTemplate']);
    Route::put('/plans/{plan}', [\App\Http\Controllers\Api\PlanController::class, 'update']);
    Route::delete('/plans/{plan}', [\App\Http\Controllers\Api\PlanController::class, 'destroy']);

    // Prayer/Resource Routes
    Route::get('/prayers', [\App\Http\Controllers\Api\PrayerController::class, 'index']);
    Route::get('/prayers/{prayer}', [\App\Http\Controllers\Api\PrayerController::class, 'show']);

    // Worship Log Routes
    Route::get('/worship-logs', [\App\Http\Controllers\Api\WorshipLogController::class, 'index']);
    Route::post('/worship-logs', [\App\Http\Controllers\Api\WorshipLogController::class, 'store']);
    Route::get('/worship-logs/stats', [\App\Http\Controllers\Api\WorshipLogController::class, 'stats']);
    Route::delete('/worship-logs/{worshipLog}', [\App\Http\Controllers\Api\WorshipLogController::class, 'destroy']);

    // Reminder Routes
    Route::get('/reminders', [\App\Http\Controllers\Api\ReminderController::class, 'index']);
    Route::post('/reminders', [\App\Http\Controllers\Api\ReminderController::class, 'store']);
    Route::patch('/reminders/{reminder}/toggle', [\App\Http\Controllers\Api\ReminderController::class, 'toggle']);

    // Group / Family Share Routes (Modul 7)
    Route::get('/groups', [\App\Http\Controllers\Api\GroupController::class, 'index']);
    Route::post('/groups', [\App\Http\Controllers\Api\GroupController::class, 'store']);
    Route::post('/groups/join', [\App\Http\Controllers\Api\GroupController::class, 'join']);
    Route::get('/groups/{group}', [\App\Http\Controllers\Api\GroupController::class, 'show']);
    Route::get('/groups/{group}/members', [\App\Http\Controllers\Api\GroupController::class, 'members']);

    // Admin / Agent Routes (Modul 9)
    Route::prefix('admin')->group(function () {
        Route::get('/jamaah', [\App\Http\Controllers\Api\AdminController::class, 'listJamaah']);
        Route::post('/groups/{group}/itinerary', [\App\Http\Controllers\Api\AdminController::class, 'manageItinerary']);
        Route::get('/groups/{group}/stats', [\App\Http\Controllers\Api\AdminController::class, 'groupStats']);
    });
});
