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
        'project_id',     // ✅
        'title',
        'description',
        'priority',       // tinyint: 0=low,1=medium,2=high
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

    // String<->Int mapping for priority
    protected function priority(): Attribute
    {
        return Attribute::make(
            get: fn ($v) => [0=>'low',1=>'medium',2=>'high'][$v] ?? 'medium',
            set: fn ($v) => ['low'=>0,'medium'=>1,'high'=>2,0=>0,1=>1,2=>2,'0'=>0,'1'=>1,'2'=>2][$v] ?? 1
        );
    }

    public function user()      { return $this->belongsTo(User::class); }
    public function project()   { return $this->belongsTo(Project::class); }
    public function subtasks()  { return $this->hasMany(Subtask::class); }
}
