<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),

            'program' => [
                'BSIT',
                'BSCS',
                'BSIT'
            ][fake()->numberBetween(0, 2)],

            'gender' => [
                'Male',
                'Female'
            ][fake()->numberBetween(0, 1)],

            'birthday' => fake()
                ->dateTimeBetween('-25 years', '-17 years')
                ->format('Y-m-d'),

            'year_level' => fake()->numberBetween(1, 4),
        ];
    }
}