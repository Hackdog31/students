<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource for the students dashboard.
     */
    public function studentsDashboard(Request $request): Response
    {
        $students = Student::query()
            ->latest()
            ->get();

        return Inertia::render('students/dashboard', [
            'students' => $students,
        ]);
    }

    /**
     * Display a listing of the resource (API).
     */
    public function index()
    {
        return Student::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'birthday' => 'required|date|before:today',
            'email' => 'required|email|max:255|unique:students,email',
            'program' => 'required|string|max:60',
            'gender' => 'required|string|max:60',
            'year_level' => 'required|integer|min:1|max:4',
        ]);

        Student::create([
            'First_name' => $validated['first_name'],
            'Last_name' => $validated['last_name'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'program' => $validated['program'],
            'gender' => $validated['gender'],
            'birthday' => $validated['birthday'],
            'year_level' => $validated['year_level'],
        ]);

        return redirect()->route('students.dashboard')->with('success', 'Student added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $student = Student::findOrFail($id);
        return response()->json($student);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'birthday' => 'required|date|before:today',
            'email' => ['required', 'email', 'max:255', Rule::unique('students', 'email')->ignore($student->id)],
            'program' => 'required|string|max:60',
            'gender' => 'required|string|max:60',
            'year_level' => 'required|integer|min:1|max:4',
        ]);

        $student->update([
            'First_name' => $validated['first_name'],
            'Last_name' => $validated['last_name'],
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'program' => $validated['program'],
            'gender' => $validated['gender'],
            'birthday' => $validated['birthday'],
            'year_level' => $validated['year_level'],
        ]);

        return redirect()->route('students.dashboard')->with('success', 'Student updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->route('students.dashboard')->with('success', 'Student deleted successfully.');
    }
}