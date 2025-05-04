
export interface Teacher {
    employeeId: string;
    full_name: string;
    department: string;
    email: string;
    password: string;
}

export interface Course {
    courseId: string;
    courseName: string;
    department: string;
    semester: number;
    creditHours:  number;
    assignedTeacher: string;
    teacherDepartment: string;
  };

  // get the Teacher for courses
  export interface Teacher_for_courses {
    id: number;
    department: string;
    full_name:string;
}

export interface userInfo{
  full_name:string;
  email:string;
  department:string;
}
