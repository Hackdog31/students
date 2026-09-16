<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_students_dashboard(): void
    {
        $response = $this->get(route('students.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_students_dashboard(): void
    {
        $user = User::factory()->create();
        $student = Student::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@example.com',
            'program' => 'BSIT',
            'gender' => 'Female',
            'birthday' => '2003-04-12',
            'year_level' => 3,
        ]);

        $response = $this->actingAs($user)->get(route('students.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('students/dashboard')
            ->has('students', 1)
            ->where('students.0.email', 'jane.smith@example.com')
        );
    }

    public function test_authenticated_user_can_create_student(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('students.store'), [
            'first_name' => 'Mark',
            'last_name' => 'Taylor',
            'email' => 'mark.taylor@example.com',
            'program' => 'BSCS',
            'gender' => 'Male',
            'birthday' => '2004-01-15',
            'year_level' => 2,
        ]);

        $response->assertRedirect(route('students.dashboard'));
        $this->assertDatabaseHas('students', [
            'email' => 'mark.taylor@example.com',
            'program' => 'BSCS',
        ]);
    }

    public function test_student_creation_requires_valid_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('students.store'), [
            'first_name' => '',
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors(['first_name', 'last_name', 'email', 'birthday', 'program', 'gender', 'year_level']);
    }

    public function test_authenticated_user_can_update_student(): void
    {
        $user = User::factory()->create();
        $student = Student::create([
            'first_name' => 'Alice',
            'last_name' => 'Wonder',
            'email' => 'alice@example.com',
            'program' => 'BSIT',
            'gender' => 'Female',
            'birthday' => '2002-09-01',
            'year_level' => 1,
        ]);

        $response = $this->actingAs($user)->put(route('students.update', $student), [
            'first_name' => 'Alice',
            'last_name' => 'Updated',
            'email' => 'alice@example.com',
            'program' => 'BSCS',
            'gender' => 'Female',
            'birthday' => '2002-09-01',
            'year_level' => 2,
        ]);

        $response->assertRedirect(route('students.dashboard'));
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'email' => 'alice@example.com',
            'program' => 'BSCS',
            'year_level' => 2,
        ]);
    }

    public function test_authenticated_user_can_delete_student(): void
    {
        $user = User::factory()->create();
        $student = Student::create([
            'first_name' => 'Bob',
            'last_name' => 'Marley',
            'email' => 'bob@example.com',
            'program' => 'BSIT',
            'gender' => 'Male',
            'birthday' => '2000-02-06',
            'year_level' => 4,
        ]);

        $response = $this->actingAs($user)->delete(route('students.destroy', $student));

        $response->assertRedirect(route('students.dashboard'));
        $this->assertDatabaseMissing('students', [
            'id' => $student->id,
        ]);
    }
}

