<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Checklist;
use Illuminate\Http\Request;

class ChecklistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->checklists()->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:50',
            'item_name' => 'required|string|max:150',
        ]);

        $checklist = $request->user()->checklists()->create($validated);

        return response()->json($checklist, 201);
    }

    public function toggle(Checklist $checklist)
    {
        if ($checklist->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $checklist->update(['is_completed' => !$checklist->is_completed]);

        return response()->json($checklist);
    }

    public function destroy(Checklist $checklist)
    {
        if ($checklist->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $checklist->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Seed default items for a new user
     */
    public function seedDefaults(Request $request)
    {
        $user = $request->user();
        
        $defaults = [
            'Dokumen' => [
                'Paspor & fotokopi', 'Visa Umrah', 'Tiket pesawat (PP)', 
                'Booking hotel (Makkah/Medina)', 'Kartu vaksin & sertifikat medis', 'Asuransi perjalanan'
            ],
            'Kesehatan' => [
                'Obat pribadi + resep', 'Masker, sanitizer'
            ],
            'Keuangan & Komunikasi' => [
                'Mata uang (SAR) / kartu internasional', 'Aktivasi Roaming / SIM lokal', 'Salinan kontak darurat'
            ],
            'Pakaian & Perlengkapan' => [
                'Ihram (pria) / pakaian sopan (wanita)', 'Sepatu nyaman, kaos kaki', 'Tas kecil untuk dokumen', 'Powerbank'
            ]
        ];

        foreach ($defaults as $category => $items) {
            foreach ($items as $item) {
                Checklist::firstOrCreate([
                    'user_id' => $user->id,
                    'category' => $category,
                    'item_name' => $item
                ]);
            }
        }

        return response()->json(['message' => 'Default checklists added']);
    }
}
