import { Head, useForm } from '@inertiajs/react';
import {
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    Search,
    Users,
    BookOpen,
    Calendar,
    Filter,
    X,
    AlertTriangle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Student, StudentFormData } from '@/types';

const PROGRAM_OPTIONS = ['BSIT', 'BSCS', 'BSIS', 'BSBA', 'BSEd', 'BSEc', 'Other'];
const YEAR_OPTIONS = [
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const initialFormData: StudentFormData = {
    first_name: '',
    last_name: '',
    email: '',
    program: 'BSIT',
    gender: 'Male',
    birthday: '',
    year_level: 1,
};

interface StudentsDashboardProps {
    students: Student[];
}

export default function StudentsDashboard({ students = [] }: StudentsDashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedGender, setSelectedGender] = useState<string>('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

    const {
        data: formData,
        setData: setFormData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<StudentFormData>(initialFormData);

    const { delete: destroyStudent, processing: isDeleting } = useForm({});

    // Filtered students
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const firstName = student.first_name || student.First_name || '';
            const lastName = student.last_name || student.Last_name || '';
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            const email = (student.email || '').toLowerCase();
            const program = (student.program || '').toLowerCase();
            const query = searchQuery.toLowerCase().trim();

            const matchesSearch =
                !query ||
                fullName.includes(query) ||
                email.includes(query) ||
                program.includes(query);

            const matchesProgram =
                selectedProgram === 'all' ||
                student.program?.toLowerCase() === selectedProgram.toLowerCase();

            const matchesYear =
                selectedYear === 'all' ||
                String(student.year_level) === selectedYear;

            const matchesGender =
                selectedGender === 'all' ||
                student.gender?.toLowerCase() === selectedGender.toLowerCase();

            return matchesSearch && matchesProgram && matchesYear && matchesGender;
        });
    }, [students, searchQuery, selectedProgram, selectedYear, selectedGender]);

    // Statistics
    const stats = useMemo(() => {
        const total = students.length;
        const programCounts: Record<string, number> = {};
        let totalAge = 0;
        let ageCount = 0;

        students.forEach((s) => {
            const prog = s.program || 'Unassigned';
            programCounts[prog] = (programCounts[prog] || 0) + 1;
            if (s.age) {
                totalAge += s.age;
                ageCount++;
            }
        });

        const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1) : 'N/A';
        const topProgram = Object.entries(programCounts).sort(
            (a, b) => b[1] - a[1]
        )[0]?.[0] || 'None';

        return { total, topProgram, avgAge };
    }, [students]);

    const handleOpenCreate = () => {
        reset();
        clearErrors();
        setEditingStudent(null);
        setFormData(initialFormData);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (student: Student) => {
        clearErrors();
        setEditingStudent(student);
        setFormData({
            first_name: student.first_name || student.First_name || '',
            last_name: student.last_name || student.Last_name || '',
            email: student.email || '',
            program: student.program || 'BSIT',
            gender: student.gender || 'Male',
            birthday: student.birthday ? student.birthday.substring(0, 10) : '',
            year_level: student.year_level ? Number(student.year_level) : 1,
        });
        setIsFormOpen(true);
    };

    const handleOpenDelete = (student: Student) => {
        setDeletingStudent(student);
        setIsDeleteOpen(true);
    };

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStudent) {
            put(`/students/${editingStudent.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                    toast.success('Student updated successfully!');
                },
                onError: () => {
                    toast.error('Failed to update student. Please check the fields.');
                },
            });
        } else {
            post('/students', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                    toast.success('Student created successfully!');
                },
                onError: () => {
                    toast.error('Failed to create student. Please check the fields.');
                },
            });
        }
    };

    const handleConfirmDelete = () => {
        if (!deletingStudent) return;
        destroyStudent(`/students/${deletingStudent.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                setDeletingStudent(null);
                toast.success('Student deleted successfully!');
            },
            onError: () => {
                toast.error('Failed to delete student.');
            },
        });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedProgram('all');
        setSelectedYear('all');
        setSelectedGender('all');
    };

    const getInitials = (first?: string, last?: string) => {
        const f = first?.[0] || '';
        const l = last?.[0] || '';
        return (f + l).toUpperCase() || 'ST';
    };

    const getProgramBadgeVariant = (program: string) => {
        switch (program.toUpperCase()) {
            case 'BSIT':
                return 'default';
            case 'BSCS':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <>
            <Head title="Students Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="size-7 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Students Management
                            </h1>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage student records, enrollment details, and academic levels.
                        </p>
                    </div>
                    <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-auto">
                        <Plus className="size-4" />
                        <span>Add Student</span>
                    </Button>
                </div>

                {/* KPI Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Active enrolled students
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Top Program</CardTitle>
                            <BookOpen className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.topProgram}</div>
                            <p className="text-xs text-muted-foreground">
                                Highest student enrollment
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
                            <Calendar className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgAge} yrs</div>
                            <p className="text-xs text-muted-foreground">
                                Calculated across student records
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search Toolbar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search bar */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, email, or program..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Filter className="size-3.5" />
                                    <span>Filter:</span>
                                </div>

                                {/* Program Filter */}
                                <Select
                                    value={selectedProgram}
                                    onValueChange={setSelectedProgram}
                                >
                                    <SelectTrigger className="w-[130px] h-9 text-xs">
                                        <SelectValue placeholder="Program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Programs</SelectItem>
                                        {PROGRAM_OPTIONS.map((prog) => (
                                            <SelectItem key={prog} value={prog}>
                                                {prog}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Year Level Filter */}
                                <Select
                                    value={selectedYear}
                                    onValueChange={setSelectedYear}
                                >
                                    <SelectTrigger className="w-[125px] h-9 text-xs">
                                        <SelectValue placeholder="Year Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {YEAR_OPTIONS.map((yr) => (
                                            <SelectItem key={yr.value} value={String(yr.value)}>
                                                {yr.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Gender Filter */}
                                <Select
                                    value={selectedGender}
                                    onValueChange={setSelectedGender}
                                >
                                    <SelectTrigger className="w-[115px] h-9 text-xs">
                                        <SelectValue placeholder="Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Genders</SelectItem>
                                        {GENDER_OPTIONS.map((g) => (
                                            <SelectItem key={g} value={g}>
                                                {g}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(searchQuery ||
                                    selectedProgram !== 'all' ||
                                    selectedYear !== 'all' ||
                                    selectedGender !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="mr-1 size-3.5" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3.5 font-medium">Student</th>
                                    <th className="px-6 py-3.5 font-medium">Program</th>
                                    <th className="px-6 py-3.5 font-medium">Year Level</th>
                                    <th className="px-6 py-3.5 font-medium">Gender</th>
                                    <th className="px-6 py-3.5 font-medium">Birthday / Age</th>
                                    <th className="px-6 py-3.5 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => {
                                        const firstName =
                                            student.first_name || student.First_name || '';
                                        const lastName =
                                            student.last_name || student.Last_name || '';
                                        const fullName = `${firstName} ${lastName}`;

                                        return (
                                            <tr
                                                key={student.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                {/* Student Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-9 border">
                                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                                {getInitials(firstName, lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-foreground">
                                                                {fullName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Program */}
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        variant={getProgramBadgeVariant(student.program)}
                                                    >
                                                        {student.program}
                                                    </Badge>
                                                </td>

                                                {/* Year Level */}
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-muted-foreground">
                                                        Year {student.year_level}
                                                    </span>
                                                </td>

                                                {/* Gender */}
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {student.gender}
                                                </td>

                                                {/* Birthday / Age */}
                                                <td className="px-6 py-4">
                                                    <div className="text-foreground">
                                                        {student.birthday
                                                            ? new Date(student.birthday).toLocaleDateString(
                                                                  undefined,
                                                                  {
                                                                      year: 'numeric',
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                  }
                                                              )
                                                            : '—'}
                                                    </div>
                                                    {student.age && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {student.age} years old
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(student)}
                                                            className="size-8 p-0"
                                                            title="Edit Student"
                                                        >
                                                            <Pencil className="size-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDelete(student)}
                                                            className="size-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 className="size-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="rounded-full bg-muted p-3">
                                                    <Users className="size-6 text-muted-foreground" />
                                                </div>
                                                <div className="text-base font-semibold">
                                                    No students found
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {students.length === 0
                                                        ? 'Get started by creating your first student record.'
                                                        : 'No students match the selected filter criteria.'}
                                                </p>
                                                {students.length === 0 ? (
                                                    <Button
                                                        onClick={handleOpenCreate}
                                                        size="sm"
                                                        className="mt-2"
                                                    >
                                                        <Plus className="mr-1.5 size-4" />
                                                        Add First Student
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={resetFilters}
                                                        className="mt-2"
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Create / Edit Student Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingStudent ? 'Edit Student Details' : 'Add New Student'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingStudent
                                ? 'Update the student information and click save to apply changes.'
                                : 'Enter the student information to register them in the system.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitForm} className="space-y-4 py-2">
                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData('first_name', e.target.value)}
                                    placeholder="e.g. John"
                                    required
                                />
                                <InputError message={errors.first_name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData('last_name', e.target.value)}
                                    placeholder="e.g. Doe"
                                    required
                                />
                                <InputError message={errors.last_name} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData('email', e.target.value)}
                                placeholder="john.doe@example.com"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Program & Year Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="program">Program / Course</Label>
                                <Select
                                    value={formData.program}
                                    onValueChange={(val) => setFormData('program', val)}
                                >
                                    <SelectTrigger id="program" className="w-full">
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROGRAM_OPTIONS.map((prog) => (
                                            <SelectItem key={prog} value={prog}>
                                                {prog}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.program} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="year_level">Year Level</Label>
                                <Select
                                    value={String(formData.year_level)}
                                    onValueChange={(val) => setFormData('year_level', Number(val))}
                                >
                                    <SelectTrigger id="year_level" className="w-full">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {YEAR_OPTIONS.map((yr) => (
                                            <SelectItem key={yr.value} value={String(yr.value)}>
                                                {yr.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.year_level} />
                            </div>
                        </div>

                        {/* Gender & Birthday */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(val) => setFormData('gender', val)}
                                >
                                    <SelectTrigger id="gender" className="w-full">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GENDER_OPTIONS.map((g) => (
                                            <SelectItem key={g} value={g}>
                                                {g}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.gender} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="birthday">Birthday</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={formData.birthday}
                                    onChange={(e) => setFormData('birthday', e.target.value)}
                                    required
                                />
                                <InputError message={errors.birthday} />
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-2">
                                {processing && <Spinner className="size-4" />}
                                <span>{editingStudent ? 'Save Changes' : 'Create Student'}</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <AlertTriangle className="size-6" />
                        </div>
                        <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-foreground">
                                {deletingStudent?.first_name || deletingStudent?.First_name}{' '}
                                {deletingStudent?.last_name || deletingStudent?.Last_name}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-center gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting && <Spinner className="size-4" />}
                            <span>Delete Student</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

StudentsDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Students',
            href: '/students-dashboard',
        },
    ] as BreadcrumbItem[],
};

