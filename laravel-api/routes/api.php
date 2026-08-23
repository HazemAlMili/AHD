<?php

use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Route;

$api = ApiController::class;

Route::get('/healthz', [$api, 'healthz']);
Route::get('/readyz', [$api, 'readyz']);

Route::prefix('v1')->middleware('cors')->group(function () use ($api) {
    Route::get('/workers', [$api, 'workers']);
    Route::get('/workers/{slug}', [$api, 'worker']);
    Route::get('/content/{key}', [$api, 'publicContent']);
    Route::get('/nationalities', [$api, 'publicNationalities']);
    Route::get('/skills', [$api, 'publicSkills']);
    Route::get('/public-settings', [$api, 'publicSettings']);

    Route::prefix('admin')->group(function () use ($api) {
        Route::post('/auth/login', [$api, 'login']);
        Route::post('/auth/logout', [$api, 'logout']);
        Route::get('/auth/session', [$api, 'session'])->middleware('admin.session');

        Route::middleware('admin.session')->group(function () use ($api) {
            Route::get('/workers', [$api, 'adminWorkers']);
            Route::get('/nationalities', [$api, 'nationalities']);
            Route::get('/skills', [$api, 'skills']);
            Route::get('/content/{key}', [$api, 'adminContent']);
            Route::get('/settings/{key}', [$api, 'adminSetting']);

            Route::middleware('role:SUPER_ADMIN,ADMIN,OPERATIONS')->group(function () use ($api) {
                Route::post('/workers', [$api, 'createWorker']);
                Route::patch('/workers/{id}', [$api, 'updateWorker']);
                Route::post('/workers/{id}/publish', [$api, 'publish']);
                Route::post('/workers/{id}/unpublish', [$api, 'unpublish']);
                Route::patch('/workers/{id}/availability', [$api, 'availability']);
                Route::post('/workers/{id}/media/upload', [$api, 'presign']);
                Route::post('/workers/{id}/media', [$api, 'saveMedia']);
                Route::patch('/workers/{id}/media/{mediaId}', [$api, 'saveMedia']);
                Route::delete('/workers/{id}/media/{mediaId}', [$api, 'deleteMedia']);
            });

            Route::middleware('role:SUPER_ADMIN,ADMIN')->post('/workers/{id}/archive', [$api, 'archive']);
            Route::middleware('role:SUPER_ADMIN,ADMIN,CONTENT_MANAGER')->group(function () use ($api) {
                Route::post('/nationalities', [$api, 'saveNationality']);
                Route::patch('/nationalities/{id}', [$api, 'saveNationality']);
                Route::post('/skills', [$api, 'saveSkill']);
                Route::patch('/skills/{id}', [$api, 'saveSkill']);
                Route::patch('/content/{key}', [$api, 'saveContent']);
                Route::patch('/settings/{key}', [$api, 'saveSetting']);
            });
        });
    });
});
