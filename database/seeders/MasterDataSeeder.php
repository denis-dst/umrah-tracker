<?php

namespace Database\Seeders;

use App\Models\Prayer;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Contoh Data Doa (Resource)
        $prayers = [
            [
                'category' => 'Umrah',
                'title' => 'Niat Ihram',
                'text_arabic' => 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
                'text_translation' => 'Aku datang memenuhi panggilan-Mu ya Allah untuk berumrah.',
            ],
            [
                'category' => 'Umrah',
                'title' => 'Talbiyah',
                'text_arabic' => 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ',
                'text_translation' => 'Aku datang memenuhi panggilan-Mu ya Allah, aku datang memenuhi panggilan-Mu...',
            ],
            [
                'category' => 'Tawaf',
                'title' => 'Doa Antara Rukun Yamani & Hajar Aswad',
                'text_arabic' => 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                'text_translation' => 'Wahai Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat...',
            ],
        ];

        foreach ($prayers as $prayer) {
            Prayer::create($prayer);
        }
    }
}
