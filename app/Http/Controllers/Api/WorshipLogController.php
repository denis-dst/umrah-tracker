<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorshipLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorshipLogController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->worshipLogs()->latest('log_datetime');

        if ($request->has('type')) {
            $query->where('activity_type', $request->type);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'activity_type' => 'required|string|max:100',
            'value' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'log_datetime' => 'nullable|date_format:Y-m-d H:i:s',
        ]);

        if (empty($validated['log_datetime'])) {
            $validated['log_datetime'] = now()->format('Y-m-d H:i:s');
        }

        $log = $request->user()->worshipLogs()->create($validated);

        return response()->json($log, 201);
    }

    /**
     * Get summary stats for dashboard
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $stats = $user->worshipLogs()
            ->select('activity_type', DB::raw('SUM(value) as total_value'), DB::raw('COUNT(*) as total_count'))
            ->groupBy('activity_type')
            ->get();

        return response()->json([
            'summary' => $stats,
            'today_count' => $user->worshipLogs()->whereDate('log_datetime', today())->count()
        ]);
    }

    public function destroy(WorshipLog $worshipLog)
    {
        if ($worshipLog->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $worshipLog->delete();

        return response()->json(['message' => 'Log deleted']);
    }
}
