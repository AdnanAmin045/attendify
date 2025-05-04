// types/student.ts
export type Student = {
    id: number;
    full_name: string;
    regno: string;
    section?: string;
    phone: string;
    email: string;
  };
  
  export type Course = {
    id: number;
    courseid: string;
    courseName: string;
    students: Student[];
  };
  
  export type Department = {
    department: string;
    courses: Course[];
  };