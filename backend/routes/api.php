<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\YandexController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth.api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::prefix('yandex')->group(function () {
        Route::post('/parse-reviews', [YandexController::class, 'parseReviews']);
        Route::get('/reviews', [YandexController::class, 'getReviews']);
    });
});
