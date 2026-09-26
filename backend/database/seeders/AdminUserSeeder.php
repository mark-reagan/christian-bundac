<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $isProduction = app()->environment('production');

        $users = [
            [
                'email' => $isProduction ? env('ADMIN_EMAIL') : env('ADMIN_EMAIL', 'admin@school.edu'),
                'password' => $isProduction ? env('ADMIN_PASSWORD') : env('ADMIN_PASSWORD', 'password123'),
                'name' => 'System Administrator',
                'role' => 'admin',
            ],
            [
                'email' => $isProduction ? env('STAFF_EMAIL') : env('STAFF_EMAIL', 'staff@school.edu'),
                'password' => $isProduction ? env('STAFF_PASSWORD') : env('STAFF_PASSWORD', 'password123'),
                'name' => 'Inventory Staff',
                'role' => 'staff',
            ],
        ];

        foreach ($users as $user) {
            if (blank($user['email']) || blank($user['password'])) {
                continue;
            }

            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'role' => $user['role'],
                    'is_active' => true,
                ]
            );
        }
    }
}
