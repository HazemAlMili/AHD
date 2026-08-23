<?php

namespace Database\Seeders;

use App\Models\Nationality;
use App\Models\Skill;
use App\Models\SystemSetting;
use App\Models\Worker;
use App\Models\WorkerMedia;
use Illuminate\Database\Seeder;

class LocalParitySeeder extends Seeder
{
    public function run(): void
    {
        $nationality = Nationality::updateOrCreate(['id' => 'nat-parity'], ['name_en' => 'Parity', 'name_ar' => 'اختبار', 'slug' => 'parity', 'is_active' => true, 'sort_order' => 0]);
        $skill = Skill::updateOrCreate(['id' => 'skill-parity'], ['name_en' => 'Cooking', 'name_ar' => 'طبخ', 'slug' => 'cooking', 'is_active' => true, 'sort_order' => 0]);
        $worker = Worker::updateOrCreate(['id' => 'worker-parity'], ['public_code' => 'AHD-4321', 'display_name' => 'عاملة اختبار', 'slug' => 'parity-worker', 'nationality_id' => $nationality->id, 'age' => 29, 'current_city' => 'الرياض', 'years_experience' => 6, 'saudi_experience_years' => 2, 'public_summary_ar' => 'خبرة في شؤون المنزل والطبخ.', 'public_summary_en' => 'Parity worker for disposable verification.', 'languages' => ['العربية', 'English'], 'internal_notes' => 'DISPOSABLE_PARITY_FIXTURE', 'availability_status' => 'AVAILABLE', 'publication_status' => 'PUBLISHED', 'is_featured' => true, 'sort_order' => 0, 'published_at' => now()]);
        $worker->skills()->sync([$skill->id]);
        SystemSetting::updateOrCreate(['id' => 'setting-parity'], ['key' => 'whatsappNumber', 'value' => ['value' => '966500000000']]);
        WorkerMedia::updateOrCreate(['id' => 'media-parity-public'], ['worker_id' => $worker->id, 'url' => 'https://example.test/parity-public.jpg', 'storage_key' => null, 'mime_type' => 'image/jpeg', 'size_bytes' => 1200, 'visibility' => 'PUBLIC', 'is_primary' => true, 'alt_text_ar' => 'صورة اختبار', 'created_at' => now()]);
        WorkerMedia::updateOrCreate(['id' => 'media-parity-internal'], ['worker_id' => $worker->id, 'url' => 'https://example.test/parity-internal.jpg', 'storage_key' => null, 'mime_type' => 'image/jpeg', 'size_bytes' => 1200, 'visibility' => 'INTERNAL', 'is_primary' => false, 'alt_text_ar' => 'خاص', 'created_at' => now()]);
    }
}
