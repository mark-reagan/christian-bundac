<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NormalizeApiErrors
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (($request->is('api/*') || $request->expectsJson())
            && $response instanceof JsonResponse
            && $response->getStatusCode() >= 400) {
            $payload = $response->getData(true);

            if (is_array($payload)) {
                $payload['message'] = $payload['message'] ?? 'An error occurred.';
                $payload['errors'] = $payload['errors'] ?? [];
                $payload['status'] = $payload['status'] ?? $response->getStatusCode();

                return response()->json($payload, $response->getStatusCode(), $response->headers->all());
            }
        }

        return $response;
    }
}