export interface Course {
    id: number;
    title: string;
    semester: number;
    flow: string;
    ects: number;
    description: string;

    // New fields for validation
    type: 'compulsory' | 'elective' | 'humanities' | 'free' | 'project' | 'thesis';
    flow_code: string; // e.g. "Y", "L", "H", "D", "T", "S", "Z", "E", "O", "I", "K" (Kormos), "X" (None)
}
