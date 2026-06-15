<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'yandex_id',
        'url',
        'name',
        'phone',
        'rating',
        'rating_count', // <-- Added here
        'review_count',
        'last_parsed_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'float',
            'rating_count' => 'integer', // <-- Added here
            'review_count' => 'integer',
            'last_parsed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'org_id', 'yandex_id');
    }
}
