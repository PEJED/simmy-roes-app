export interface Course {
    id: number;
    title: string;
    semester: number;
    flow: string;
    ects: number;
    description: string;

    // Additional course details
    lecture_hours?: number;
    lab_hours?: number;

    // New fields for validation
    type: 'compulsory' | 'elective' | 'humanities' | 'free' | 'project' | 'thesis';
    flow_code: string; // e.g. "Y", "L", "H", "D", "T", "S", "Z", "E", "O", "I", "K" (Kormos), "X" (None)

    // Flag to indicate if it's compulsory *specifically for that flow*
    is_flow_compulsory?: boolean;
}
