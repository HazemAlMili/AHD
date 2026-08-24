<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) return;

        $email = trim((string) env('AHD_ADMIN_EMAIL', ''));
        $password = (string) env('AHD_ADMIN_PASSWORD', '');
        if ($email === '' || $password === '') return;

        $admin = AdminUser::firstOrNew(['email' => $email]);
        $admin->id ??= Str::uuid()->toString();
        $admin->display_name = (string) env('AHD_ADMIN_NAME', 'AHD Admin');
        $admin->role = 'SUPER_ADMIN';
        $admin->is_active = true;
        $admin->password_hash = Hash::make($password);
        $admin->save();

        // Local/test bootstrap owns the local admin set: a changed email must not leave a stale login behind.
        AdminUser::query()->where('id', '!=', $admin->id)->delete();
    }
}
