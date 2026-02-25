<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'full_name' => 'sometimes|required|string|max:150',
            'phone' => 'sometimes|required|string|max:20',
            'departure_date' => 'sometimes|nullable|date',
            'return_date' => 'sometimes|nullable|date',
            'group_name' => 'sometimes|nullable|string|max:150',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        $data = $request->only([
            'full_name',
            'phone',
            'departure_date',
            'return_date',
            'group_name',
        ]);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }
}
