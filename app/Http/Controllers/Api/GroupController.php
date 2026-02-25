<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\GroupMember;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        // Groups I own or am a member of
        $user = $request->user();
        $owned = $user->ownedGroups()->withCount('members')->get();
        $joined = $user->groups()->withCount('members')->get();
        
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
            'owner_id' => auth()->id(),
            'group_name' => $request->group_name,
            'invite_code' => strtoupper(Str::random(6)),
        ]);

        // Add owner as a member (co-leader by default maybe?)
        GroupMember::create([
            'group_id' => $group->id,
            'user_id' => auth()->id(),
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
        if (GroupMember::where('group_id', $group->id)->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Already a member'], 400);
        }

        $member = GroupMember::create([
            'group_id' => $group->id,
            'user_id' => auth()->id(),
            'member_role' => 'member',
        ]);

        return response()->json(['message' => 'Joined group successfully', 'group' => $group]);
    }

    public function show(Group $group)
    {
        // Check if user is member
        if (!GroupMember::where('group_id', $group->id)->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($group->load(['itineraries', 'owner']));
    }

    public function members(Group $group)
    {
        // Check if user is member
        if (!GroupMember::where('group_id', $group->id)->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $members = $group->members()->with(['user' => function($q) {
            $q->withCount(['checklists', 'worshipLogs']);
        }])->get();

        return response()->json($members);
    }
}
