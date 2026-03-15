<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupMember;
use App\Models\EmergencyAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        // Groups I own or am a member of
        $user = $request->user();
        $owned = $user->ownedGroups()->with(['owner:id,full_name,phone'])->withCount('members')->get();
        $joined = $user->groups()->with(['owner:id,full_name,phone'])->withCount('members')->get();
        
        return response()->json([
            'owned' => $owned,
            'joined' => $joined
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'group_name' => 'required|string|max:150',
        ]);

        $group = Group::create([
            'owner_id' => $request->user()->id,
            'group_name' => $request->group_name,
            'invite_code' => strtoupper(Str::random(6)),
        ]);

        // Add owner as a member (co-leader by default maybe?)
        GroupMember::create([
            'group_id' => $group->id,
            'user_id' => $request->user()->id,
            'member_role' => 'leader',
        ]);

        return response()->json($group, 201);
    }

    public function join(Request $request)
    {
        $request->validate([
            'invite_code' => 'required|string|exists:groups,invite_code',
        ]);

        $group = Group::where('invite_code', strtoupper($request->invite_code))->firstOrFail();

        // Check if already a member
        if (GroupMember::where('group_id', $group->id)->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Already a member'], 400);
        }

        $member = GroupMember::create([
            'group_id' => $group->id,
            'user_id' => $request->user()->id,
            'member_role' => 'member',
        ]);

        return response()->json(['message' => 'Joined group successfully', 'group' => $group]);
    }

    public function show(Request $request, Group $group)
    {
        // Check if user is member
        if (!GroupMember::where('group_id', $group->id)->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($group->load(['itineraries', 'owner']));
    }

    public function members(Request $request, Group $group)
    {
        // Check if user is member
        if (!GroupMember::where('group_id', $group->id)->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $members = GroupMember::where('group_id', $group->id)
            ->with(['user' => function($q) {
                // Ambil data lokasi terakhir dan ringkasan ibadah
                $q->select('id', 'full_name', 'email', 'avatar', 'last_latitude', 'last_longitude', 'last_location_update')
                  ->withCount(['checklists', 'checklists as completed_checklists_count' => function($query) {
                      $query->where('is_completed', true);
                  }])
                  ->with(['worshipLogs' => function($query) {
                      $query->select('user_id', 'activity_type', \Illuminate\Support\Facades\DB::raw('SUM(value) as total_value'))
                            ->groupBy('user_id', 'activity_type');
                  }]);
            }])->get();

        return response()->json($members);
    }

    public function updateHotels(Request $request, Group $group)
    {
        // Only owner can update hotels
        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'hotel_makkah' => 'nullable|string|max:150',
            'hotel_madinah' => 'nullable|string|max:150',
        ]);

        $group->update($request->only(['hotel_makkah', 'hotel_madinah']));

        return response()->json(['message' => 'Hotel info updated', 'group' => $group]);
    }

    public function sendSOS(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // Fetch worship summary for today
        $worshipSummary = $user->worshipLogs()
            ->whereDate('log_datetime', today())
            ->select('activity_type', \Illuminate\Support\Facades\DB::raw('SUM(value) as total_value'))
            ->groupBy('activity_type')
            ->get();

        $alert = EmergencyAlert::create([
            'user_id' => $user->id,
            'group_id' => $request->group_id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'worship_summary' => $worshipSummary,
            'is_resolved' => false,
        ]);

        return response()->json([
            'message' => 'SOS sent to Group Leader',
            'alert' => $alert
        ]);
    }

    public function getAlerts(Request $request, Group $group)
    {
        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $alerts = EmergencyAlert::where('group_id', $group->id)
            ->where('is_resolved', false)
            ->with('user:id,full_name,phone,avatar')
            ->latest()
            ->get();

        return response()->json($alerts);
    }

    public function resolveAlert(Request $request, EmergencyAlert $alert)
    {
        if ($alert->group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $alert->update(['is_resolved' => true]);
        return response()->json(['message' => 'Alert resolved']);
    }
}
