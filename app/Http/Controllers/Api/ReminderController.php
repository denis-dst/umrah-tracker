<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->reminders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:50',
            'reminder_time' => 'nullable|date_format:H:i',
            'interval_minutes' => 'nullable|integer',
            'is_enabled' => 'boolean',
        ]);

        $reminder = $request->user()->reminders()->updateOrCreate(
            ['type' => $validated['type']],
            $validated
        );

        return response()->json($reminder);
    }

    public function toggle(Reminder $reminder)
    {
        if ($reminder->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reminder->update(['is_enabled' => !$reminder->is_enabled]);

        return response()->json($reminder);
    }
}
