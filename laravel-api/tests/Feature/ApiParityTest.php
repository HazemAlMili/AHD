<?php

namespace Tests\Feature;

use App\Models\AdminSession;
use App\Models\ContentBlock;
use App\Models\AdminUser;
use App\Models\Nationality;
use App\Models\Skill;
use App\Models\SystemSetting;
use App\Models\Worker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApiParityTest extends TestCase
{
    use RefreshDatabase;

    private AdminUser $admin;
    private Nationality $nationality;
    private Skill $skill;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = AdminUser::create(['id' => 'admin-test', 'email' => 'admin@test.local', 'password_hash' => Hash::make('local-test-password'), 'display_name' => 'Test Admin', 'role' => 'SUPER_ADMIN', 'is_active' => true]);
        $this->nationality = Nationality::create(['id' => 'nat-test', 'name_en' => 'Test', 'name_ar' => 'اختبار', 'slug' => 'test', 'is_active' => true, 'sort_order' => 0]);
        $this->skill = Skill::create(['id' => 'skill-test', 'name_en' => 'Cooking', 'name_ar' => 'طبخ', 'slug' => 'cooking', 'is_active' => true, 'sort_order' => 0]);
    }

    public function test_health_readiness_and_public_taxonomy_work(): void
    {
        $this->getJson('/api/healthz')->assertOk()->assertJsonPath('status', 'ok');
        $this->getJson('/api/readyz')->assertOk()->assertJsonPath('checks.database', 'ok');
        $this->getJson('/api/v1/nationalities')->assertOk()->assertJsonPath('data.0.nameAr', 'اختبار');
        $this->getJson('/api/v1/skills')->assertOk()->assertJsonPath('data.0.nameEn', 'Cooking');
    }

    public function test_admin_login_session_and_worker_lifecycle_work(): void
    {
        $this->postJson('/api/v1/admin/workers', [])->assertUnauthorized();
        $login = $this->postJson('/api/v1/admin/auth/login', ['email' => 'admin@test.local', 'password' => 'local-test-password'])->assertOk();
        $token = $login->getCookie('ahd_admin_session', false)->getValue();
        $this->assertNotEmpty($token);
        $this->assertSame(hash('sha256', $token), AdminSession::latest('created_at')->value('token_hash'));
        $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->getJson('/api/v1/admin/auth/session')->assertOk();

        $worker = $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->postJson('/api/v1/admin/workers', [
            'public_code' => 'AHD-4321', 'display_name' => 'عاملة اختبار', 'slug' => 'test-worker', 'nationality_id' => $this->nationality->id,
            'public_summary_ar' => 'ملخص عام', 'internal_notes' => 'ملاحظة داخلية', 'skill_ids' => [$this->skill->id],
        ])->assertCreated()->json('data');

        $this->assertSame('AHD-4321', $worker['public_code']);
        $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->postJson('/api/v1/admin/workers/' . $worker['id'] . '/publish')->assertOk();
        $public = $this->getJson('/api/v1/workers')->assertOk()->json('data.0');
        $this->assertSame('AHD-4321', $public['publicCode']);
        $this->assertSame('اختبار', $public['nationality']['nameAr']);
        $this->assertSame(['طبخ'], $public['skills']);
        $this->assertArrayNotHasKey('internalNotes', $public);
        $this->assertArrayNotHasKey('id', $public);
    }

    public function test_settings_content_media_validation_and_ownership_work(): void
    {
        $login = $this->postJson('/api/v1/admin/auth/login', ['email' => 'admin@test.local', 'password' => 'local-test-password'])->assertOk();
        $token = $login->getCookie('ahd_admin_session', false)->getValue();
        $worker = Worker::create(['id' => 'media-worker', 'public_code' => 'AHD-7777', 'display_name' => 'Media Worker', 'slug' => 'media-worker', 'nationality_id' => $this->nationality->id, 'languages' => [], 'publication_status' => 'DRAFT', 'availability_status' => 'AVAILABLE']);
        $other = Worker::create(['id' => 'other-worker', 'public_code' => 'AHD-7778', 'display_name' => 'Other Worker', 'slug' => 'other-worker', 'nationality_id' => $this->nationality->id, 'languages' => [], 'publication_status' => 'DRAFT', 'availability_status' => 'AVAILABLE']);
        $request = fn (string $method, string $uri, array $body = []) => $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->json($method, $uri, $body);

        $request('PATCH', '/api/v1/admin/settings/whatsappNumber', ['value' => '966500000000'])->assertOk()->assertJsonPath('data.value', '966500000000');
        $this->getJson('/api/v1/public-settings')->assertOk()->assertJsonPath('data.whatsappNumber', '966500000000');
        $request('PATCH', '/api/v1/admin/content/homepage', ['contentAr' => ['heroTitle' => 'عنوان اختبار'], 'isActive' => true])->assertOk()->assertJsonPath('data.contentAr.heroTitle', 'عنوان اختبار');
        $this->getJson('/api/v1/content/homepage')->assertOk()->assertJsonPath('data.contentAr.heroTitle', 'عنوان اختبار');

        $request('POST', "/api/v1/admin/workers/{$worker->id}/media", ['url' => 'http://unsafe.test/file.jpg'])->assertStatus(422);
        $media = $request('POST', "/api/v1/admin/workers/{$worker->id}/media", ['url' => 'https://example.test/file.jpg', 'visibility' => 'PUBLIC'])->assertCreated()->json('data');
        $request('DELETE', "/api/v1/admin/workers/{$other->id}/media/{$media['id']}" )->assertNotFound();
        $request('DELETE', "/api/v1/admin/workers/{$worker->id}/media/{$media['id']}" )->assertNoContent();
        Storage::fake('public');
        $upload = $request('POST', "/api/v1/admin/workers/{$worker->id}/media/upload", ['file' => UploadedFile::fake()->image('parity.jpg', 40, 40)]);
        $upload->assertCreated()->assertJsonStructure(['data' => ['publicUrl', 'storageKey']]);
        Storage::disk('public')->assertExists($upload->json('data.storageKey'));
        $this->assertDatabaseMissing('worker_media', ['id' => $media['id']]);
        $this->assertDatabaseHas('audit_logs', ['entity_type' => 'WorkerMedia']);
    }

    public function test_public_worker_is_not_visible_before_publish(): void
    {
        Worker::create(['id' => 'draft-worker', 'public_code' => 'AHD-9999', 'display_name' => 'Draft', 'slug' => 'draft', 'nationality_id' => $this->nationality->id, 'languages' => [], 'publication_status' => 'DRAFT', 'availability_status' => 'AVAILABLE']);
        $this->getJson('/api/v1/workers')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/workers/draft')->assertNotFound();
    }

    public function test_public_filters_only_match_active_skills_and_hide_inactive_skill_labels(): void
    {
        $worker = Worker::create(['id' => 'inactive-skill-worker', 'public_code' => 'AHD-9900', 'display_name' => 'Inactive Skill Worker', 'slug' => 'inactive-skill-worker', 'nationality_id' => $this->nationality->id, 'languages' => [], 'publication_status' => 'PUBLISHED', 'availability_status' => 'AVAILABLE']);
        $worker->skills()->attach($this->skill->id);

        $this->getJson('/api/v1/workers')->assertOk()->assertJsonPath('data.0.skills', ['طبخ']);
        $this->getJson('/api/v1/workers?skill=cooking')->assertOk()->assertJsonCount(1, 'data');

        $this->skill->update(['is_active' => false]);
        $this->getJson('/api/v1/skills')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/workers?skill=cooking')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/workers')->assertOk()->assertJsonPath('data.0.skills', []);

        $this->skill->update(['is_active' => true]);
        $this->getJson('/api/v1/skills')->assertOk()->assertJsonPath('data.0.slug', 'cooking');
        $this->getJson('/api/v1/workers?skill=cooking')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_admin_taxonomy_defaults_sort_order_and_local_presign_is_relative(): void
    {
        $login = $this->postJson('/api/v1/admin/auth/login', ['email' => 'admin@test.local', 'password' => 'local-test-password'])->assertOk();
        $token = $login->getCookie('ahd_admin_session', false)->getValue();
        $request = fn (string $method, string $uri, array $body = []) => $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->json($method, $uri, $body);

        $request('POST', '/api/v1/admin/nationalities', ['nameAr' => 'فلبينية اختبار', 'nameEn' => 'QA Filipino', 'isActive' => true])
            ->assertCreated()->assertJsonPath('data.sortOrder', 0);
        $request('POST', '/api/v1/admin/skills', ['nameAr' => 'رعاية أطفال اختبار', 'nameEn' => 'QA Childcare', 'isActive' => true])
            ->assertCreated()->assertJsonPath('data.sortOrder', 0);

        Worker::create(['id' => 'presign-worker', 'public_code' => 'AHD-5555', 'display_name' => 'Presign Worker', 'slug' => 'presign-worker', 'nationality_id' => $this->nationality->id, 'languages' => [], 'publication_status' => 'DRAFT', 'availability_status' => 'AVAILABLE']);
        $request('POST', '/api/v1/admin/workers/presign-worker/media/upload', ['contentType' => 'image/png', 'size' => 68])
            ->assertOk()->assertJsonPath('data.upload.url', '/api/v1/admin/workers/presign-worker/media/upload');
    }

    public function test_duplicate_public_code_returns_validation_error_without_partial_worker(): void
    {
        $login = $this->postJson('/api/v1/admin/auth/login', ['email' => 'admin@test.local', 'password' => 'local-test-password'])->assertOk();
        $token = $login->getCookie('ahd_admin_session', false)->getValue();
        Worker::create(['id' => 'existing-worker', 'public_code' => 'AHD-8888', 'display_name' => 'Existing', 'slug' => 'existing-worker', 'nationality_id' => $this->nationality->id, 'languages' => [], 'publication_status' => 'DRAFT', 'availability_status' => 'AVAILABLE']);
        $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->postJson('/api/v1/admin/workers', [
            'publicCode' => 'AHD-8888', 'displayName' => 'Duplicate', 'nationalityId' => $this->nationality->id, 'skillIds' => [], 'languages' => [], 'sortOrder' => 0,
        ])->assertStatus(422)->assertJsonPath('errors.public_code.0', 'The public code has already been taken.');
        $this->assertDatabaseCount('workers', 1);
    }

    public function test_worker_relation_ids_validate_without_partial_worker_write(): void
    {
        $login = $this->postJson('/api/v1/admin/auth/login', ['email' => 'admin@test.local', 'password' => 'local-test-password'])->assertOk();
        $token = $login->getCookie('ahd_admin_session', false)->getValue();
        $request = fn (array $body) => $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->postJson('/api/v1/admin/workers', $body);
        $base = ['displayName' => 'Invalid Relation Worker', 'skillIds' => [], 'languages' => [], 'sortOrder' => 0];

        $request($base + ['publicCode' => 'AHD-6201', 'nationalityId' => 'missing-nationality'])
            ->assertStatus(422)->assertJsonStructure(['errors' => ['nationality_id']]);
        $this->assertDatabaseMissing('workers', ['public_code' => 'AHD-6201']);

        $request(array_merge($base, ['publicCode' => 'AHD-6202', 'nationalityId' => $this->nationality->id, 'skillIds' => ['missing-skill']]))
            ->assertStatus(422)->assertJsonStructure(['errors' => ['skill_ids.0']]);
        $this->assertDatabaseMissing('workers', ['public_code' => 'AHD-6202']);
    }

    public function test_typed_nationality_creates_and_reuses_taxonomy(): void
    {
        $login = $this->postJson('/api/v1/admin/auth/login', ['email' => 'admin@test.local', 'password' => 'local-test-password'])->assertOk();
        $token = $login->getCookie('ahd_admin_session', false)->getValue();
        $request = fn (array $body) => $this->withCredentials()->withUnencryptedCookie('ahd_admin_session', $token)->postJson('/api/v1/admin/workers', $body);
        $base = ['displayName' => 'Typed Nationality Worker', 'skillIds' => [], 'languages' => [], 'sortOrder' => 0];

        $first = $request($base + ['publicCode' => 'AHD-6101', 'nationalityName' => 'نيبالية اختبار'])->assertCreated()->json('data');
        $second = $request($base + ['publicCode' => 'AHD-6102', 'displayName' => 'Typed Nationality Worker Two', 'nationalityName' => 'نيبالية اختبار'])->assertCreated()->json('data');

        $this->assertSame($first['nationality_id'], $second['nationality_id']);
        $this->assertDatabaseCount('nationalities', 2);
        $this->assertDatabaseHas('nationalities', ['name_ar' => 'نيبالية اختبار', 'name_en' => 'نيبالية اختبار', 'is_active' => 1]);
        $request($base + ['publicCode' => 'AHD-6103'])->assertStatus(422)->assertJsonStructure(['errors' => ['nationality_name']]);
    }


}
