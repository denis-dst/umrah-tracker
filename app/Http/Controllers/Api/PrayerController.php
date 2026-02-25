<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prayer;
use Illuminate\Http\Request;

class PrayerController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->query('category');
        $query = Prayer::query();
        
        if ($category) {
            $query->where('category', $category);
        }

        return response()->json($query->get());
    }

    public function show(Prayer $prayer)
    {
        return response()->json($prayer);
    }
}
