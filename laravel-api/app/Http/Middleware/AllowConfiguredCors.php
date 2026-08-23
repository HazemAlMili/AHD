<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowConfiguredCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->headers->get('Origin');
        $allowed = array_values(array_filter(array_map('trim', explode(',', (string) env('AHD_ALLOWED_ORIGINS', '')))));
        $headers = ['Vary' => 'Origin'];
        if ($origin && in_array($origin, $allowed, true)) {
            $headers['Access-Control-Allow-Origin'] = $origin;
            $headers['Access-Control-Allow-Credentials'] = 'true';
            $headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Request-Id';
            $headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS';
        }
        if ($request->isMethod('OPTIONS')) return response()->noContent(204, $headers);
        return $next($request)->withHeaders($headers);
    }
}
