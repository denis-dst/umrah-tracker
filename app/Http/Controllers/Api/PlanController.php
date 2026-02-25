<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->plans()->orderBy('date')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'activity_name' => 'required|string|max:150',
            'target_value' => 'nullable|integer',
            'unit' => 'nullable|string|max:50',
        ]);

        $plan = $request->user()->plans()->create($validated);

        return response()->json($plan, 201);
    }

    public function update(Request $request, Plan $plan)
    {
        if ($plan->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan->update($request->all());

        return response()->json($plan);
    }

    public function destroy(Plan $plan)
    {
        if ($plan->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Quick setup for standard Umrah packages
     */
    public function applyTemplate(Request $request)
    {
        $request->validate(['template' => 'required|in:standar,khusyuk']);
        $user = $request->user();
        $startDate = $request->date ?? now()->toDateString();

        if ($request->template === 'standar') {
            $activities = [
                ['offset' => 0, 'name' => 'Tiba di Makkah & Umrah Tahap 1', 'target' => 7, 'unit' => 'putaran'],
                ['offset' => 1, 'name' => 'Tawaf Sunnah & Tilawah', 'target' => 1, 'unit' => 'juz'],
                ['offset' => 2, 'name' => 'Ziarah Kota Makkah', 'target' => 1, 'unit' => 'trip'],
            ];
        } else {
            $activities = [
                ['offset' => 0, 'name' => 'Umrah Tahap 1 (Fokus Khusyuk)', 'target' => 7, 'unit' => 'putaran'],
                ['offset' => 1, 'name' => 'Iktikaf & Khatam Quran', 'target' => 3, 'unit' => 'juz'],
                ['offset' => 2, 'name' => 'Tawaf Sunnah & Dhuha', 'target' => 7, 'unit' => 'putaran'],
            ];
        }

        foreach ($activities as $act) {
            Plan::create([
                'user_id' => $user->id,
                'date' => date('Y-m-d', strtotime($startDate . " + {$act['offset']} days")),
                'activity_name' => $act['name'],
                'target_value' => $act['target'],
                'unit' => $act['unit'],
            ]);
        }

        return response()->json(['message' => 'Template applied successfully']);
    }
}
