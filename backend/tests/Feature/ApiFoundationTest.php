<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiFoundationTest extends TestCase
{
    public function test_api_routes_are_versioned(): void
    {
        $this->getJson('/api/v1/does-not-exist')
            ->assertNotFound()
            ->assertJsonStructure(['message', 'errors', 'status'])
            ->assertJsonPath('status', 404);
    }

    public function test_public_registration_is_unavailable(): void
    {
        $this->postJson('/api/v1/register', [])
            ->assertNotFound();
    }

    public function test_direct_api_error_responses_use_the_standard_shape(): void
    {
        $this->postJson('/api/v1/login', [])
            ->assertUnprocessable()
            ->assertJsonStructure(['message', 'errors', 'status'])
            ->assertJsonPath('status', 422);
    }
}