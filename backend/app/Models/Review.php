<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'org_id',
        'org_name',
        'url',
        'user_name',
        'rating',
        'text',
        'date_published',
        'external_review_id',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'date_published' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id', 'yandex_id');
    }
}
