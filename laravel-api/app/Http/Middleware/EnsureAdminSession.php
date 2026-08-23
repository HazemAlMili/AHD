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
        if (!$admin) return response()->json(['message' => 'Admin authentication required'], 401);
        $request->attributes->set('admin', $admin);
        return $next($request);
    }
}
