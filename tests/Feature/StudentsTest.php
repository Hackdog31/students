<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_the_students_platform(): void
    {
        $response = $this->get(route('students.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_the_students_platform(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->get(route('students.dashboard'));

        $response->assertOk();
    }

    public function test_authenticated_users_can_add_a_student(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->post(route('students.store'), [
            'first_name' => 'Maya',
            'last_name' => 'Santos',
            'email' => 'maya@example.com',
            'program' => 'BSIT',
            'gender' => 'Female',
            'birthday' => '2007-05-12',
            'year_level' => 2,
        ]);

        $response->assertRedirect(route('students.dashboard'));
        $this->assertDatabaseHas('students', [
            'first_name' => 'Maya',
            'last_name' => 'Santos',
            'email' => 'maya@example.com',
        ]);
    }

    public function test_invalid_student_data_is_rejected(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->from(route('students.dashboard'))
            ->post(route('students.store'), [
                'first_name' => '',
                'email' => 'not-an-email',
            ]);

        $response->assertRedirect(route('students.dashboard'));
        $response->assertSessionHasErrors([
            'first_name',
            'last_name',
            'birthday',
            'program',
            'gender',
            'year_level',
        ]);
        $this->assertDatabaseCount('students', 0);
    }
}
