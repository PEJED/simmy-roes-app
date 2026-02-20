import type { Course } from '../types/Course';

export const courses: Course[] = [
    // --- Semester 6 ---
    {
        id: 1,
        title: "Λειτουργικά Συστήματα",
        semester: 6,
        flow: "Υπολογιστές",
        flow_code: "Y",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Εισαγωγή στα λειτουργικά συστήματα."
    },
    {
        id: 6,
        title: "Συστήματα Ηλεκτρικής Ενέργειας Ι",
        semester: 6,
        flow: "Ενέργεια",
        flow_code: "E",
        ects: 7,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Παραγωγή, μεταφορά και διανομή."
    },
    {
        id: 7,
        title: "Τεχνολογία Λογισμικού",
        semester: 6,
        flow: "Λογισμικό",
        flow_code: "L",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Διαδικασίες ανάπτυξης λογισμικού."
    },
    {
        id: 8,
        title: "Τηλεπικοινωνιακά Συστήματα",
        semester: 6,
        flow: "Τηλεπικοινωνίες",
        flow_code: "T",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Εισαγωγή στα τηλεπικοινωνιακά συστήματα."
    },
    // --- Semester 7 ---
    {
        id: 4,
        title: "Δίκτυα Υπολογιστών",
        semester: 7,
        flow: "Υπολογιστές",
        flow_code: "Y",
        ects: 7,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Εισαγωγή στα δίκτυα υπολογιστών."
    },
    {
        id: 12,
        title: "Ψηφιακή Επεξεργασία Σήματος",
        semester: 7,
        flow: "Σήματα",
        flow_code: "Z",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Δειγματοληψία, μετασχηματισμοί Z και Fourier."
    },
    {
        id: 13,
        title: "Εισαγωγή στη Βιοϊατρική Τεχνολογία",
        semester: 7,
        flow: "Ιατρική",
        flow_code: "I",
        ects: 5,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Αρχές βιοϊατρικής τεχνολογίας."
    },
    // --- Semester 8 ---
    {
        id: 9,
        title: "Φιλοσοφία της Επιστήμης",
        semester: 8,
        flow: "Ανθρωπιστικά",
        flow_code: "X",
        ects: 3,
        type: 'humanities',
        description: "Επιστημολογία."
    },
    {
        id: 10,
        title: "Ιστορία Τέχνης",
        semester: 8,
        flow: "Ανθρωπιστικά",
        flow_code: "X",
        ects: 3,
        type: 'humanities',
        description: "Επισκόπηση της ιστορίας της τέχνης."
    },
    // --- Semester 9 ---
    {
        id: 11,
        title: "Ειδικά Θέματα Μαθηματικών",
        semester: 9,
        flow: "Μαθηματικά",
        flow_code: "M",
        ects: 4,
        type: 'free',
        description: "Προχωρημένα μαθηματικά."
    },
    {
        id: 14,
        title: "Κβαντομηχανική",
        semester: 9,
        flow: "Φυσική",
        flow_code: "F",
        ects: 4,
        type: 'free',
        description: "Αρχές κβαντομηχανικής."
    },
    {
        id: 15,
        title: "Διοίκηση Επιχειρήσεων",
        semester: 9,
        flow: "Οικονομία",
        flow_code: "O",
        ects: 4,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Αρχές διοίκησης."
    }
];
