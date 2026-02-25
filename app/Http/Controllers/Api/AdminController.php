<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Itinerary;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (auth()->user()->role !== 'admin') {
                return response()->json(['message' => 'Admin access required'], 403);
            }
            return $next($request);
        });
    }

    public function listJamaah()
    {
        return response()->json(User::where('role', 'jamaah')->get());
    }

    public function manageItinerary(Request $request, Group $group)
    {
        $request->validate([
            'itineraries' => 'required|array',
            'itineraries.*.day_number' => 'required|integer',
            'itineraries.*.activity_title' => 'required|string|max:200',
            'itineraries.*.date' => 'nullable|date',
        ]);

        // Clear existing or update? Let's refresh for now for simplicity of "upload"
        $group->itineraries()->delete();

        foreach ($request->itineraries as $item) {
            $group->itineraries()->create($item);
        }

        return response()->json(['message' => 'Itinerary updated', 'itineraries' => $group->itineraries]);
    }

    public function groupStats(Group $group)
    {
        $stats = $group->members()->with(['user.checklists', 'user.worshipLogs'])->get()->map(function($member) {
            $user = $member->user;
            return [
                'user_id' => $user->id,
                'full_name' => $user->full_name,
                'checklist_completion' => $user->checklists->count() > 0 ? ($user->checklists->where('is_completed', true)->count() / $user->checklists->count()) * 100 : 0,
                'worship_count' => $user->worshipLogs->count(),
            ];
        });

        return response()->json($stats);
    }
}
