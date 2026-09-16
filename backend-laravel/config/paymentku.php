<?php

return [
    'api_key' => env('PAYMENTKU_API_KEY', ''),
    'webhook_secret' => env('PAYMENTKU_WEBHOOK_SECRET', ''),
    'base_url' => rtrim(env('PAYMENTKU_BASE_URL', 'https://paymenku.com/api/v1'), '/'),
    'timeout' => (int) env('PAYMENTKU_TIMEOUT', 30),
];
