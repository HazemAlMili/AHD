<?php

namespace App\Http\Controllers;

use App\Models\AdminSession;
use App\Models\AdminUser;
use App\Models\AuditLog;
use App\Models\ContentBlock;
use App\Models\Nationality;
use App\Models\Skill;
use App\Models\SystemSetting;
use App\Models\Worker;
use App\Models\WorkerMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ApiController extends Controller
{
    public function healthz(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function readyz(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            return response()->json(['status' => 'ready', 'checks' => ['database' => 'ok']]);
        } catch (\Throwable) {
            return response()->json(['status' => 'not_ready', 'checks' => ['database' => 'failed']], 503);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $input = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string', 'max:200']]);
        $admin = AdminUser::where('email', $input['email'])->where('is_active', true)->first();
        if (!$admin || !Hash::check($input['password'], $admin->password_hash)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }
        $token = Str::random(64);
        AdminSession::create(['token_hash' => hash('sha256', $token), 'admin_user_id' => $admin->id, 'expires_at' => now()->addHours(8), 'created_at' => now()]);
        $cookie = cookie('ahd_admin_session', $token, 480, '/', null, app()->environment('production'), true, false, 'lax');
        return response()->json(['data' => $this->adminDto($admin)])->withCookie($cookie);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($token = $request->cookie('ahd_admin_session')) {
            AdminSession::where('token_hash', hash('sha256', $token))->delete();
        }
        return response()->json(null, 204)->withCookie(cookie()->forget('ahd_admin_session'));
    }

    public function session(Request $request): JsonResponse
    {
        $admin = $request->attributes->get('admin');
        return response()->json(['data' => $this->adminDto($admin)]);
    }

    public function resolveAdmin(Request $request): ?AdminUser
    {
        $token = $request->cookie('ahd_admin_session');
        if (!$token) return null;
        $session = AdminSession::with('adminUser')->where('token_hash', hash('sha256', $token))->where('expires_at', '>', now())->first();
        return $session?->adminUser?->is_active ? $session->adminUser : null;
    }

    public function requireRole(Request $request, array $roles): void
    {
        $admin = $request->attributes->get('admin');
        abort_unless($admin && in_array($admin->role, $roles, true), 403, 'Insufficient role');
    }

    public function workers(Request $request): JsonResponse
    {
        $query = Worker::with(['nationality', 'skills', 'media'])->where('publication_status', 'PUBLISHED')->whereHas('nationality', fn ($q) => $q->where('is_active', true));
        if ($search = trim((string) $request->query('q', $request->query('search', '')))) {
            $query->where(function ($q) use ($search) { $q->where('display_name', 'like', "%{$search}%")->orWhere('public_code', 'like', "%{$search}%")->orWhere('current_city', 'like', "%{$search}%"); });
        }
        if ($nationality = $request->query('nationality')) $query->whereHas('nationality', fn ($q) => $q->where('slug', $nationality));
        if ($availability = $request->query('availability')) $query->where('availability_status', $availability);
        if ($skill = $request->query('skill')) $query->whereHas('skills', fn ($q) => $q->where('skills.id', $skill)->orWhere('skills.slug', $skill));
        return response()->json(['data' => $query->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('display_name')->get()->map(fn (Worker $worker) => $this->publicWorkerDto($worker))->values()]);
    }

    public function worker(string $slug): JsonResponse
    {
        $worker = Worker::with(['nationality', 'skills', 'media'])->where('slug', $slug)->where('publication_status', 'PUBLISHED')->whereHas('nationality', fn ($q) => $q->where('is_active', true))->first();
        abort_unless($worker, 404, 'Worker not found');
        return response()->json(['data' => $this->publicWorkerDto($worker)]);
    }

    public function publicNationalities(): JsonResponse { return response()->json(['data' => Nationality::where('is_active', true)->orderBy('sort_order')->orderBy('name_en')->get()->map(fn (Nationality $item) => $this->taxonomyDto($item))->values()]); }
    public function publicSkills(): JsonResponse { return response()->json(['data' => Skill::where('is_active', true)->orderBy('sort_order')->orderBy('name_en')->get()->map(fn (Skill $item) => $this->taxonomyDto($item))->values()]); }

    public function publicContent(string $key): JsonResponse
    {
        $block = ContentBlock::where('key', $key)->where('is_active', true)->first();
        abort_unless($block, 404, 'Content not found');
        return response()->json(['data' => $this->contentDto($block)]);
    }

    public function publicSettings(): JsonResponse
    {
        $settings = SystemSetting::query()->whereIn('key', ['whatsappNumber', 'phoneNumber'])->get()->mapWithKeys(fn (SystemSetting $setting) => [$setting->key => $setting->value['value'] ?? $setting->value])->all();
        return response()->json(['data' => $settings]);
    }

    public function adminWorkers(): JsonResponse { return response()->json(['data' => Worker::with(['nationality', 'skills', 'media'])->orderByDesc('is_featured')->orderBy('sort_order')->get()->map(fn (Worker $worker) => $this->adminWorkerDto($worker))->values()]); }

    public function createWorker(Request $request): JsonResponse
    {
        $input = $this->workerInput($request);
        $worker = DB::transaction(function () use ($input) {
            $input = $this->resolveNationality($input);
            $skills = $input['skill_ids'] ?? [];
            unset($input['skill_ids']);
            $worker = Worker::create(array_merge($input, ['id' => Str::uuid()->toString()]));
            $worker->skills()->sync($skills);
            return $worker->load(['nationality', 'skills', 'media']);
        });
        $this->audit($request, 'worker.created', 'Worker', $worker->id, null, $worker->toArray());
        return response()->json(['data' => $this->adminWorkerDto($worker)], 201);
    }

    public function updateWorker(Request $request, string $id): JsonResponse
    {
        $worker = Worker::find($id); abort_unless($worker, 404, 'Worker not found');
        $before = $worker->toArray();
        $input = $this->workerInput($request, true);
        $input = $this->resolveNationality($input);
        $skills = array_key_exists('skill_ids', $input) ? $input['skill_ids'] : null;
        unset($input['skill_ids']);
        DB::transaction(function () use ($worker, $input, $skills) { $worker->update($input); if ($skills !== null) $worker->skills()->sync($skills); });
        $worker->refresh()->load(['nationality', 'skills', 'media']);
        $this->audit($request, 'worker.updated', 'Worker', $worker->id, $before, $worker->toArray());
        return response()->json(['data' => $this->adminWorkerDto($worker)]);
    }

    public function publish(Request $request, string $id): JsonResponse { return $this->statusMutation($request, $id, 'PUBLISHED', 'worker.published'); }
    public function unpublish(Request $request, string $id): JsonResponse { return $this->statusMutation($request, $id, 'DRAFT', 'worker.unpublished'); }
    public function archive(Request $request, string $id): JsonResponse { return $this->statusMutation($request, $id, 'ARCHIVED', 'worker.archived'); }

    public function availability(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'in:AVAILABLE,ON_HOLD,RESERVED,TRANSFER_IN_PROGRESS,TRANSFERRED,UNAVAILABLE']]);
        $worker = Worker::find($id); abort_unless($worker, 404, 'Worker not found');
        $before = $worker->toArray(); $worker->update(['availability_status' => $request->string('status')->toString()]);
        $this->audit($request, 'worker.availability_changed', 'Worker', $id, $before, $worker->toArray());
        return response()->json(['data' => $this->adminWorkerDto($worker->fresh()->load(['nationality', 'skills', 'media']))]);
    }

    public function nationalities(): JsonResponse { return response()->json(['data' => Nationality::orderBy('sort_order')->orderBy('name_en')->get()->map(fn (Nationality $item) => $this->taxonomyDto($item))->values()]); }
    public function skills(): JsonResponse { return response()->json(['data' => Skill::orderBy('sort_order')->orderBy('name_en')->get()->map(fn (Skill $item) => $this->taxonomyDto($item))->values()]); }

    public function saveNationality(Request $request, ?string $id = null): JsonResponse { return $this->saveTaxonomy($request, Nationality::class, $id, 'nationality'); }
    public function saveSkill(Request $request, ?string $id = null): JsonResponse { return $this->saveTaxonomy($request, Skill::class, $id, 'skill'); }

    public function adminContent(string $key): JsonResponse { $block = ContentBlock::where('key', $key)->first(); abort_unless($block, 404, 'Content not found'); return response()->json(['data' => $this->contentDto($block)]); }
    public function saveContent(Request $request, string $key): JsonResponse { $request->merge(['content_en' => $request->input('content_en', $request->input('contentEn')), 'content_ar' => $request->input('content_ar', $request->input('contentAr')), 'is_active' => $request->input('is_active', $request->input('isActive'))]); $input = $request->validate(['content_en' => ['nullable'], 'content_ar' => ['nullable'], 'is_active' => ['boolean']]); $block = ContentBlock::where('key', $key)->first(); if (!$block) $block = new ContentBlock(['id' => Str::uuid()->toString(), 'key' => $key]); $block->fill($input); $block->save(); $this->audit($request, 'content.updated', 'ContentBlock', $key, null, $block->toArray()); return response()->json(['data' => $this->contentDto($block)]); }
    public function adminSetting(string $key): JsonResponse { $setting = SystemSetting::where('key', $key)->first(); abort_unless($setting, 404, 'Setting not found'); return response()->json(['data' => ['key' => $setting->key, 'value' => $setting->value['value'] ?? $setting->value]]); }

    public function saveSetting(Request $request, string $key): JsonResponse
    {
        $input = $request->validate(['value' => ['required', 'string', 'max:200']]);
        $value = $key === 'whatsappNumber' ? preg_replace('/[^0-9]/', '', $input['value']) : $input['value'];
        if ($key === 'whatsappNumber' && !preg_match('/^\d{8,15}$/', $value)) abort(422, 'Invalid WhatsApp number');
        $setting = SystemSetting::updateOrCreate(['key' => $key], ['id' => Str::uuid()->toString(), 'value' => ['value' => $value]]);
        $this->audit($request, 'setting.updated', 'SystemSetting', $key, null, ['key' => $key]);
        return response()->json(['data' => ['key' => $setting->key, 'value' => $setting->value['value'] ?? $setting->value]]);
    }

    public function presign(Request $request, string $id): JsonResponse
    {
        abort_unless(Worker::whereKey($id)->exists(), 404, 'Worker not found');
        $limits = ['image/jpeg' => 8_000_000, 'image/png' => 8_000_000, 'image/webp' => 8_000_000, 'video/mp4' => 50_000_000];
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            abort_unless($file && $file->isValid(), 422, 'Invalid media upload');
            $contentType = (string) $file->getMimeType();
            abort_unless(array_key_exists($contentType, $limits), 422, 'Unsupported media type');
            abort_if($file->getSize() > $limits[$contentType], 413, 'Media file is too large');
            $name = Str::uuid()->toString() . '.' . ($file->extension() ?: 'bin');
            $path = $file->storeAs("workers/{$id}", $name, 'public');
            return response()->json(['data' => ['publicUrl' => Storage::disk('public')->url($path), 'storageKey' => $path]], 201);
        }
        $input = $request->validate(['contentType' => ['required', 'in:image/jpeg,image/png,image/webp,video/mp4'], 'size' => ['required', 'integer', 'min:1']]);
        abort_if($input['size'] > $limits[$input['contentType']], 413, 'Media file is too large');
        $key = "workers/{$id}/" . Str::uuid()->toString();
        if (config('filesystems.disks.s3.bucket')) {
            $url = Storage::disk('s3')->temporaryUploadUrl($key, now()->addMinutes(15), ['headers' => ['Content-Type' => $input['contentType']]]);
            return response()->json(['data' => ['upload' => ['url' => $url, 'fields' => []], 'publicUrl' => Storage::disk('s3')->url($key), 'maxBytes' => $limits[$input['contentType']]]]);
        }
        $uploadUrl = $request->getPathInfo();
        return response()->json(['data' => ['upload' => ['url' => $uploadUrl, 'fields' => []], 'publicUrl' => Storage::disk('public')->url($key), 'maxBytes' => $limits[$input['contentType']]]]);
    }

    public function saveMedia(Request $request, string $id, ?string $mediaId = null): JsonResponse
    {
        $input = $request->validate(['url' => ['required', 'string', 'max:2000'], 'storage_key' => ['nullable', 'string', 'max:500'], 'mime_type' => ['nullable', 'string', 'max:100'], 'size_bytes' => ['nullable', 'integer'], 'visibility' => ['nullable', 'in:PUBLIC,INTERNAL,SENSITIVE'], 'is_primary' => ['boolean'], 'alt_text_ar' => ['nullable', 'string', 'max:300']]);
        $localPath = app()->environment('local') && str_starts_with($input['url'], '/storage/');
        if (!$localPath && !str_starts_with($input['url'], 'https://')) abort(422, 'Media URLs must use HTTPS');
        abort_unless(Worker::whereKey($id)->exists(), 404, 'Worker not found');
        $media = $mediaId ? WorkerMedia::where('worker_id', $id)->whereKey($mediaId)->first() : new WorkerMedia(['id' => Str::uuid()->toString(), 'worker_id' => $id, 'created_at' => now()]);
        abort_unless($media, 404, 'Media not found');
        $media->fill(array_merge($input, ['worker_id' => $id])); $media->save();
        $this->audit($request, 'worker.media_saved', 'WorkerMedia', $media->id, null, $media->toArray());
        return response()->json(['data' => $media], $mediaId ? 200 : 201);
    }

    public function deleteMedia(Request $request, string $id, string $mediaId): JsonResponse
    {
        $media = WorkerMedia::where('worker_id', $id)->whereKey($mediaId)->first(); abort_unless($media, 404, 'Media not found'); $media->delete();
        $this->audit($request, 'worker.media_deleted', 'WorkerMedia', $mediaId, null, null); return response()->json(null, 204);
    }

    private function workerInput(Request $request, bool $partial = false): array
    {
        $aliases = ['publicCode' => 'public_code', 'displayName' => 'display_name', 'nationalityId' => 'nationality_id', 'nationalityName' => 'nationality_name', 'currentCity' => 'current_city', 'yearsExperience' => 'years_experience', 'saudiExperienceYears' => 'saudi_experience_years', 'publicSummaryEn' => 'public_summary_en', 'publicSummaryAr' => 'public_summary_ar', 'internalNotes' => 'internal_notes', 'availabilityStatus' => 'availability_status', 'publicationStatus' => 'publication_status', 'isFeatured' => 'is_featured', 'sortOrder' => 'sort_order', 'skillIds' => 'skill_ids'];
        foreach ($aliases as $camel => $snake) if ($request->has($camel) && !$request->has($snake)) $request->merge([$snake => $request->input($camel)]);
        $publicCodeRule = Rule::unique('workers', 'public_code');
        if ($partial && is_string($routeId = $request->route('id'))) $publicCodeRule->ignore($routeId);
        $rules = ['public_code' => ['nullable', 'regex:/^AHD-[0-9]{4,}$/i', $publicCodeRule], 'display_name' => [$partial ? 'sometimes' : 'required', 'string', 'max:120'], 'slug' => ['nullable', 'string', 'max:160'], 'nationality_id' => [$partial ? 'sometimes' : 'required_without:nationality_name', 'nullable', 'exists:nationalities,id'], 'nationality_name' => [$partial ? 'sometimes' : 'required_without:nationality_id', 'nullable', 'string', 'max:120'], 'age' => ['nullable', 'integer', 'min:18', 'max:100'], 'current_city' => ['nullable', 'string', 'max:120'], 'years_experience' => ['nullable', 'integer', 'min:0', 'max:80'], 'saudi_experience_years' => ['nullable', 'integer', 'min:0', 'max:80'], 'public_summary_en' => ['nullable', 'string', 'max:3000'], 'public_summary_ar' => ['nullable', 'string', 'max:3000'], 'languages' => ['nullable', 'array', 'max:10'], 'languages.*' => ['string', 'max:80'], 'internal_notes' => ['nullable', 'string', 'max:5000'], 'availability_status' => ['nullable', 'in:AVAILABLE,ON_HOLD,RESERVED,TRANSFER_IN_PROGRESS,TRANSFERRED,UNAVAILABLE'], 'publication_status' => ['nullable', 'in:DRAFT,PUBLISHED,ARCHIVED'], 'is_featured' => ['boolean'], 'sort_order' => ['integer', 'min:0', 'max:100000'], 'skill_ids' => ['nullable', 'array', 'max:50'], 'skill_ids.*' => ['exists:skills,id']];
        $input = $request->validate($rules);
        if (!$partial) { $input['public_code'] ??= 'AHD-' . random_int(1000, 9999); $input['slug'] ??= Str::slug($input['display_name']) . '-' . Str::lower(Str::random(6)); $input['languages'] ??= []; }
        return $input;
    }

    private function resolveNationality(array $input): array
    {
        if (!array_key_exists('nationality_name', $input)) return $input;

        $name = trim((string) $input['nationality_name']);
        unset($input['nationality_name']);
        if ($name === '') return $input;

        $nationality = Nationality::query()
            ->where('name_ar', $name)
            ->orWhere('name_en', $name)
            ->first();

        if (!$nationality) {
            $baseSlug = Str::slug($name) ?: 'nationality';
            $slug = $baseSlug;
            $suffix = 2;
            while (Nationality::where('slug', $slug)->exists()) $slug = $baseSlug . '-' . $suffix++;
            $nationality = Nationality::create([
                'id' => Str::uuid()->toString(),
                'name_ar' => $name,
                'name_en' => $name,
                'slug' => $slug,
                'is_active' => true,
                'sort_order' => 0,
            ]);
        }

        $input['nationality_id'] = $nationality->id;
        return $input;
    }

    private function statusMutation(Request $request, string $id, string $status, string $action): JsonResponse
    {
        $worker = Worker::find($id); abort_unless($worker, 404, 'Worker not found'); $before = $worker->toArray();
        $worker->update(['publication_status' => $status, 'published_at' => $status === 'PUBLISHED' ? now() : $worker->published_at, 'archived_at' => $status === 'ARCHIVED' ? now() : null]);
        $this->audit($request, $action, 'Worker', $id, $before, $worker->toArray()); return response()->json(['data' => $this->adminWorkerDto($worker->fresh()->load(['nationality', 'skills', 'media']))]);
    }

    private function saveTaxonomy(Request $request, string $modelClass, ?string $id, string $kind): JsonResponse
    {
        $request->merge(['name_en' => $request->input('name_en', $request->input('nameEn')), 'name_ar' => $request->input('name_ar', $request->input('nameAr')), 'is_active' => $request->input('is_active', $request->input('isActive')), 'sort_order' => $request->input('sort_order', $request->input('sortOrder'))]); $input = $request->validate(['name_en' => ['required', 'string', 'max:120'], 'name_ar' => ['required', 'string', 'max:120'], 'slug' => ['nullable', 'string', 'max:140'], 'is_active' => ['boolean'], 'sort_order' => ['nullable', 'integer', 'min:0', 'max:100000']]);
        $model = $id ? $modelClass::find($id) : new $modelClass(['id' => Str::uuid()->toString()]); abort_if($id && !$model, 404, ucfirst($kind) . ' not found'); $model->fill(array_merge($input, ['slug' => $input['slug'] ?? Str::slug($input['name_en']), 'sort_order' => $input['sort_order'] ?? 0])); $model->save();
        $this->audit($request, "{$kind}." . ($id ? 'updated' : 'created'), ucfirst($kind), $model->id, null, $model->toArray()); return response()->json(['data' => $this->taxonomyDto($model)], $id ? 200 : 201);
    }

    private function publicWorkerDto(Worker $worker): array
    {
        return ['publicCode' => $worker->public_code, 'displayName' => $worker->display_name, 'slug' => $worker->slug, 'nationality' => ['slug' => $worker->nationality->slug, 'nameAr' => $worker->nationality->name_ar, 'nameEn' => $worker->nationality->name_en], 'age' => $worker->age, 'city' => $worker->current_city, 'yearsExperience' => $worker->years_experience, 'saudiExperienceYears' => $worker->saudi_experience_years, 'summary' => $worker->public_summary_ar ?: ($worker->public_summary_en ?: ''), 'languages' => $worker->languages ?? [], 'skills' => $worker->skills->map(fn (Skill $skill) => $skill->name_ar ?: $skill->name_en)->values()->all(), 'availabilityStatus' => $worker->availability_status, 'isFeatured' => $worker->is_featured, 'media' => $worker->media->where('visibility', 'PUBLIC')->map(fn (WorkerMedia $media) => ['url' => $media->url, 'altTextAr' => $media->alt_text_ar, 'isPrimary' => $media->is_primary])->values()->all()];
    }

    private function adminWorkerDto(Worker $worker): array
    {
        return ['id' => $worker->id, 'public_code' => $worker->public_code, 'display_name' => $worker->display_name, 'slug' => $worker->slug, 'nationality_id' => $worker->nationality_id, 'nationality_name_ar' => $worker->nationality?->name_ar, 'age' => $worker->age, 'current_city' => $worker->current_city, 'years_experience' => $worker->years_experience, 'saudi_experience_years' => $worker->saudi_experience_years, 'public_summary_ar' => $worker->public_summary_ar, 'public_summary_en' => $worker->public_summary_en, 'languages' => $worker->languages ?? [], 'availability_status' => $worker->availability_status, 'publication_status' => $worker->publication_status, 'is_featured' => $worker->is_featured, 'sort_order' => $worker->sort_order, 'skill_ids' => $worker->skills->pluck('id')->values()->all(), 'media' => $worker->media->map(fn (WorkerMedia $media) => ['id' => $media->id, 'url' => $media->url, 'altTextAr' => $media->alt_text_ar, 'visibility' => $media->visibility, 'isPrimary' => $media->is_primary])->values()->all()];
    }

    private function taxonomyDto(Nationality|Skill $item): array
    {
        return ['id' => $item->id, 'nameAr' => $item->name_ar, 'nameEn' => $item->name_en, 'slug' => $item->slug, 'isActive' => (bool) $item->is_active, 'sortOrder' => (int) $item->sort_order];
    }

    private function contentDto(ContentBlock $block): array
    {
        return ['key' => $block->key, 'contentAr' => $block->content_ar, 'contentEn' => $block->content_en, 'isActive' => (bool) $block->is_active];
    }

    private function adminDto(AdminUser $admin): array { return ['id' => $admin->id, 'email' => $admin->email, 'displayName' => $admin->display_name, 'role' => $admin->role]; }

    private function audit(Request $request, string $action, string $type, ?string $id, ?array $before, ?array $after): void
    {
        $admin = $request->attributes->get('admin'); AuditLog::create(['id' => Str::uuid()->toString(), 'actor_admin_id' => $admin?->id, 'action' => $action, 'entity_type' => $type, 'entity_id' => $id, 'before_json' => $before, 'after_json' => $after, 'request_id' => $request->header('X-Request-Id'), 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'created_at' => now()]);
    }
}
