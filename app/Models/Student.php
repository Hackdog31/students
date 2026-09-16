<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'First_name',
        'Last_name',
        'first_name',
        'last_name',
        'email',
        'program',
        'gender',
        'birthday',
        'year_level',
    ];

    protected $casts = [
        'birthday' => 'date',
    ];

    protected $appends = [
        'first_name',
        'last_name',
        'age',
    ];

    public function getFirstNameAttribute(): ?string
    {
        return $this->attributes['First_name'] ?? $this->attributes['first_name'] ?? null;
    }

    public function setFirstNameAttribute(?string $value): void
    {
        if (array_key_exists('First_name', $this->attributes) || ! array_key_exists('first_name', $this->attributes)) {
            $this->attributes['First_name'] = $value;
        } else {
            $this->attributes['first_name'] = $value;
        }
    }

    public function getLastNameAttribute(): ?string
    {
        return $this->attributes['Last_name'] ?? $this->attributes['last_name'] ?? null;
    }

    public function setLastNameAttribute(?string $value): void
    {
        if (array_key_exists('Last_name', $this->attributes) || ! array_key_exists('last_name', $this->attributes)) {
            $this->attributes['Last_name'] = $value;
        } else {
            $this->attributes['last_name'] = $value;
        }
    }

    public function getAgeAttribute(): ?int
    {
        if (! $this->birthday) {
            return null;
        }

        return $this->birthday instanceof Carbon
            ? $this->birthday->age
            : Carbon::parse($this->birthday)->age;
    }
}
