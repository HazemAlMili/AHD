<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_users', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('email', 190)->unique();
            $table->text('password_hash');
            $table->string('display_name', 120);
            $table->enum('role', ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'CONTENT_MANAGER', 'ANALYST'])->default('ADMIN');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('admin_sessions', function (Blueprint $table) {
            $table->string('token_hash', 128)->primary();
            $table->string('admin_user_id', 80);
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('admin_user_id')->references('id')->on('admin_users')->cascadeOnDelete();
            $table->index('admin_user_id', 'admin_sessions_admin_idx');
        });

        Schema::create('nationalities', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('name_en', 120);
            $table->string('name_ar', 120);
            $table->string('slug', 140)->unique();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('name_en', 120);
            $table->string('name_ar', 120);
            $table->string('slug', 140)->unique();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('workers', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('public_code', 40)->unique();
            $table->string('display_name', 120);
            $table->string('slug', 160)->unique();
            $table->string('nationality_id', 80);
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('current_city', 120)->nullable();
            $table->unsignedTinyInteger('years_experience')->nullable();
            $table->unsignedTinyInteger('saudi_experience_years')->nullable();
            $table->text('public_summary_en')->nullable();
            $table->text('public_summary_ar')->nullable();
            $table->json('languages');
            $table->text('internal_notes')->nullable();
            $table->enum('availability_status', ['AVAILABLE', 'ON_HOLD', 'RESERVED', 'TRANSFER_IN_PROGRESS', 'TRANSFERRED', 'UNAVAILABLE'])->default('AVAILABLE');
            $table->enum('publication_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])->default('DRAFT');
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->foreign('nationality_id')->references('id')->on('nationalities');
            $table->index(['publication_status', 'availability_status', 'is_featured', 'sort_order'], 'workers_public_filter_idx');
            $table->index('nationality_id', 'workers_nationality_idx');
        });

        Schema::create('worker_skills', function (Blueprint $table) {
            $table->string('worker_id', 80);
            $table->string('skill_id', 80);
            $table->timestamp('created_at')->useCurrent();
            $table->primary(['worker_id', 'skill_id']);
            $table->foreign('worker_id')->references('id')->on('workers')->cascadeOnDelete();
            $table->foreign('skill_id')->references('id')->on('skills')->cascadeOnDelete();
            $table->index(['skill_id', 'worker_id'], 'worker_skills_skill_idx');
        });

        Schema::create('worker_media', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('worker_id', 80);
            $table->text('url');
            $table->string('storage_key', 500)->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedInteger('size_bytes')->nullable();
            $table->enum('visibility', ['PUBLIC', 'INTERNAL', 'SENSITIVE'])->default('PUBLIC');
            $table->boolean('is_primary')->default(false);
            $table->string('alt_text_ar', 300)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('worker_id')->references('id')->on('workers')->cascadeOnDelete();
            $table->index(['worker_id', 'is_primary'], 'worker_media_worker_idx');
        });

        Schema::create('content_blocks', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('key', 160)->unique();
            $table->json('content_en')->nullable();
            $table->json('content_ar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('key', 160)->unique();
            $table->json('value');
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->string('id', 80)->primary();
            $table->string('actor_admin_id', 80)->nullable();
            $table->string('action', 160);
            $table->string('entity_type', 120);
            $table->string('entity_id', 80)->nullable();
            $table->json('before_json')->nullable();
            $table->json('after_json')->nullable();
            $table->string('request_id', 120)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('actor_admin_id')->references('id')->on('admin_users')->nullOnDelete();
            $table->index(['actor_admin_id', 'created_at'], 'audit_logs_actor_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('content_blocks');
        Schema::dropIfExists('worker_media');
        Schema::dropIfExists('worker_skills');
        Schema::dropIfExists('workers');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('nationalities');
        Schema::dropIfExists('admin_sessions');
        Schema::dropIfExists('admin_users');
    }
};
