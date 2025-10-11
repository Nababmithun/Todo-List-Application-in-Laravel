<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'priority',      // stored as tinyint(1): 0=low,1=medium,2=high
        'due_date',
        'remind_at',
        'category',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'due_date'     => 'datetime',
        'remind_at'    => 'datetime',
        'completed_at' => 'datetime',
    ];

    /** priority <int> in DB, but expose <string> ("low"|"medium"|"high") to app */
    protected function priority(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                // DB -> App (int -> string)
                $map = [0 => 'low', 1 => 'medium', 2 => 'high'];
                return $map[$value] ?? 'medium';
            },
            set: function ($value) {
                // App -> DB (string/int -> int)
                $toInt = [
                    'low'    => 0,
                    'medium' => 1,
                    'high'   => 2,
                    0 => 0, 1 => 1, 2 => 2, '0' => 0, '1' => 1, '2' => 2,
                ];
                return array_key_exists($value, $toInt) ? $toInt[$value] : 1; // default medium
            }
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }
}
