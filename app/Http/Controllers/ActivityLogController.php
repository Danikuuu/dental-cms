<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = ActivityLog::with('user')
            ->when($request->user_id,  fn ($q, $id) => $q->where('user_id', $id))
            ->when($request->action,   fn ($q, $a)  => $q->where('action', 'like', "%$a%"))
            ->when($request->date,     fn ($q, $d)  => $q->whereDate('created_at', $d))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('activity-log/Index', [
            'logs'    => $logs,
            'filters' => $request->only(['user_id', 'action', 'date']),
        ]);
    }
}
