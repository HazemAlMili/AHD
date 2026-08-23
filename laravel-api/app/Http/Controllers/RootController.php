<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class RootController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json(['service' => 'AHD API', 'status' => 'ok']);
    }
}
