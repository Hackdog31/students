import { Form, Head } from '@inertiajs/react';
import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Student = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    program: string;
    gender: string;
    birthday: string;
    year_level: number;
    age: number | null;
};

type StudentsPageProps = {
    students: Student[];
};

function formatBirthday(birthday: string) {
    const [year, month, day] = birthday.split('-');

    return `${month}/${day}/${year}`;
}

export default function StudentsIndex({ students }: StudentsPageProps) {
    const [search, setSearch] = useState('');
    const normalizedSearch = search.trim().toLowerCase();
    const filteredStudents = students.filter((student) =>
        [
            student.first_name,
            student.last_name,
            student.email,
            student.program,
        ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );

    return (
        <>
            <Head title="Students" />

            <div className="flex flex-1 flex-col gap-8 p-4 md:p-8">
                <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                            Student platform
                        </p>
                        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                            Students
                        </h1>
                        <p className="mt-2 max-w-xl text-muted-foreground">
                            Keep your student records organized and up to date.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
                        <span className="text-2xl font-semibold">{students.length}</span>
                        <span className="text-muted-foreground">total students</span>
                    </div>
                </header>

                <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <section className="min-w-0 rounded-xl border bg-card shadow-sm">
                        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold">Student directory</h2>
                                <p className="text-sm text-muted-foreground">
                                    {filteredStudents.length} matching records
                                </p>
                            </div>
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search students"
                                    aria-label="Search students"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Student</th>
                                        <th className="px-5 py-3 font-medium">Program</th>
                                        <th className="px-5 py-3 font-medium">Year</th>
                                        <th className="px-5 py-3 font-medium">Birthday</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="transition-colors hover:bg-muted/30">
                                            <td className="px-5 py-4">
                                                <div className="font-medium">
                                                    {student.first_name} {student.last_name}
                                                </div>
                                                <div className="text-muted-foreground">{student.email}</div>
                                            </td>
                                            <td className="px-5 py-4">{student.program}</td>
                                            <td className="px-5 py-4">Year {student.year_level}</td>
                                            <td className="px-5 py-4">
                                                {formatBirthday(student.birthday)}
                                                {student.age !== null && (
                                                    <span className="ml-1 text-muted-foreground">
                                                        ({student.age})
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredStudents.length === 0 && (
                                <p className="p-10 text-center text-sm text-muted-foreground">
                                    No students match your search.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="h-fit rounded-xl border bg-card p-5 shadow-sm">
                        <div className="mb-5 flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <UserPlus className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Add a student</h2>
                                <p className="text-sm text-muted-foreground">
                                    Create a record in the student directory.
                                </p>
                            </div>
                        </div>

                        <Form
                            action="/students-dashboard"
                            method="post"
                            options={{ preserveScroll: true }}
                            className="space-y-4"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name">First name</Label>
                                            <Input id="first_name" name="first_name" required />
                                            <InputError message={errors.first_name} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="last_name">Last name</Label>
                                            <Input id="last_name" name="last_name" required />
                                            <InputError message={errors.last_name} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" required />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                        <div className="grid gap-2">
                                            <Label htmlFor="program">Program</Label>
                                            <Input id="program" name="program" placeholder="BSIT" required />
                                            <InputError message={errors.program} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Input id="gender" name="gender" required />
                                            <InputError message={errors.gender} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                                        <div className="grid gap-2">
                                            <Label htmlFor="birthday">Birthday</Label>
                                            <Input id="birthday" name="birthday" type="date" required />
                                            <InputError message={errors.birthday} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="year_level">Year level</Label>
                                            <Input id="year_level" name="year_level" type="number" min="1" max="4" required />
                                            <InputError message={errors.year_level} />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing ? 'Adding student...' : 'Add student'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>
                </div>
            </div>
        </>
    );
}

StudentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Students',
            href: '/students-dashboard',
        },
    ],
};
