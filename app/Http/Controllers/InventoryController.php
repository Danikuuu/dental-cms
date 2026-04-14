<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $items = InventoryItem::with('category')
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->search,      fn ($q, $s)  => $q->where('name', 'like', "%$s%")->orWhere('sku', 'like', "%$s%"))
            ->when($request->low_stock,   fn ($q)      => $q->whereRaw('current_stock <= reorder_level'))
            ->where('is_active', true)
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        $categories = InventoryCategory::orderBy('name')->get();

        $stats = [
            'total_items'   => InventoryItem::where('is_active', true)->count(),
            'low_stock'     => InventoryItem::where('is_active', true)->whereRaw('current_stock <= reorder_level')->count(),
            'critical'      => InventoryItem::where('is_active', true)->whereRaw('current_stock <= minimum_stock')->count(),
            'total_value'   => (float) InventoryItem::where('is_active', true)->selectRaw('SUM(current_stock * unit_cost) as val')->value('val'),
        ];

        return Inertia::render('inventory/Index', [
            'items'      => $items,
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['category_id', 'search', 'low_stock']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:150',
            'category_id'      => 'nullable|exists:inventory_categories,id',
            'sku'              => 'nullable|string|max:50|unique:inventory_items,sku',
            'unit'             => 'required|string|max:30',
            'minimum_stock'    => 'required|numeric|min:0',
            'reorder_level'    => 'required|numeric|min:0',
            'unit_cost'        => 'required|numeric|min:0',
            'unit_price'       => 'nullable|numeric|min:0',
            'supplier'         => 'nullable|string|max:150',
            'supplier_contact' => 'nullable|string|max:100',
            'expiry_date'      => 'nullable|date',
            'storage_location' => 'nullable|string|max:100',
            'notes'            => 'nullable|string',
        ]);

        $item = InventoryItem::create($validated);
        ActivityLog::record('create_inventory', "Created inventory item: {$item->name}", InventoryItem::class, $item->id);

        return back()->with('success', 'Item added to inventory.');
    }

    public function update(Request $request, InventoryItem $item)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:150',
            'category_id'      => 'nullable|exists:inventory_categories,id',
            'unit'             => 'required|string|max:30',
            'minimum_stock'    => 'required|numeric|min:0',
            'reorder_level'    => 'required|numeric|min:0',
            'unit_cost'        => 'required|numeric|min:0',
            'unit_price'       => 'nullable|numeric|min:0',
            'supplier'         => 'nullable|string|max:150',
            'supplier_contact' => 'nullable|string|max:100',
            'expiry_date'      => 'nullable|date',
            'storage_location' => 'nullable|string|max:100',
            'notes'            => 'nullable|string',
            'is_active'        => 'boolean',
        ]);

        $item->update($validated);
        return back()->with('success', 'Item updated.');
    }

    public function transaction(Request $request, InventoryItem $item)
    {
        $validated = $request->validate([
            'type'      => 'required|in:stock_in,stock_out,adjustment,expired,returned',
            'quantity'  => 'required|numeric|min:0.01',
            'unit_cost' => 'nullable|numeric|min:0',
            'reference' => 'nullable|string|max:100',
            'notes'     => 'nullable|string',
        ]);

        $txn = $item->adjustStock(
            $validated['type'],
            $validated['quantity'],
            $validated['unit_cost'] ?? null,
            $validated['notes'] ?? null,
            $validated['reference'] ?? null,
            Auth::id()
        );

        ActivityLog::record(
            'inventory_transaction',
            "{$validated['type']} {$validated['quantity']} {$item->unit} of {$item->name}. Stock: {$txn->stock_before} → {$txn->stock_after}",
            InventoryItem::class,
            $item->id
        );

        return back()->with('success', 'Stock updated.');
    }

    public function transactions(InventoryItem $item): Response
    {
        return Inertia::render('inventory/Transactions', [
            'item'         => $item->load('category'),
            'transactions' => $item->transactions()->with('performedBy')
                ->orderByDesc('transaction_date')
                ->orderByDesc('id')
                ->paginate(30),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100|unique:inventory_categories,name',
            'description' => 'nullable|string',
        ]);

        InventoryCategory::create($validated);
        return back()->with('success', 'Category added.');
    }
}
