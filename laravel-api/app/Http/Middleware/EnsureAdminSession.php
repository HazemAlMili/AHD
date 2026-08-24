<?php

namespace App\Http\Middleware;

use App\Http\Controllers\ApiController;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $admin = app(ApiController::class)->resolveAdmin($request);
        if (!$admin) return response()->json(['message' => 'انتهت جلسة الإدارة. يرجى تسجيل الدخول من جديد.'], 401);
        $request->attributes->set('admin', $admin);
        return $next($request);
    }
}
