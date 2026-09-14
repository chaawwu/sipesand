<?php

return [
    'api_key' => env('KASERAPAY_API_KEY', ''),
    'webhook_secret' => env('KASERAPAY_WEBHOOK_SECRET', ''),
    'base_url' => env('KASERAPAY_BASE_URL', 'https://pay.kasera.id/v1'),
    'timeout' => env('KASERAPAY_TIMEOUT', 30),
];
