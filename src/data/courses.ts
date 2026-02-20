import type { Course } from '../types/Course';

export const courses: Course[] = [
    {
        id: 1,
        title: "Λειτουργικά Συστήματα",
        semester: 6,
        flow: "Υπολογιστές",
        flow_code: "Y",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Εισαγωγή στα λειτουργικά συστήματα. Διεργασίες, νήματα, χρονοδρομολόγηση, συγχρονισμός, αδιέξοδα. Διαχείριση μνήμης, εικονική μνήμη. Συστήματα αρχείων, είσοδος/έξοδος."
    },
    {
        id: 2,
        title: "Ηλεκτρομαγνητικά Πεδία Α",
        semester: 4,
        flow: "Κορμός",
        flow_code: "K",
        ects: 5,
        type: 'compulsory',
        description: "Στατικός ηλεκτρισμός, Νόμος Coulomb, Ηλεκτρικό πεδίο, Δυναμικό, Εξίσωση Poisson και Laplace. Διηλεκτρικά υλικά. Σταθερό ηλεκτρικό ρεύμα. Στατικό μαγνητικό πεδίο, Νόμος Biot-Savart, Νόμος Ampere."
    },
    {
        id: 3,
        title: "Σήματα και Συστήματα",
        semester: 3,
        flow: "Κορμός",
        flow_code: "K",
        ects: 6,
        type: 'compulsory',
        description: "Συνεχή και διακριτά σήματα. Γραμμικά Χρονικά Αμετάβλητα (ΓΧΑ) συστήματα. Συνέλιξη. Σειρές Fourier, Μετασχηματισμός Fourier, Μετασχηματισμός Laplace, Μετασχηματισμός Ζ."
    },
    {
        id: 4,
        title: "Δίκτυα Υπολογιστών",
        semester: 7,
        flow: "Υπολογιστές",
        flow_code: "Y",
        ects: 7,
        type: 'compulsory', // Often compulsory for flow Y
        is_flow_compulsory: true,
        description: "Εισαγωγή στα δίκτυα υπολογιστών. Μοντέλο OSI και TCP/IP. Επίπεδο Εφαρμογής (HTTP, DNS). Επίπεδο Μεταφοράς (TCP, UDP). Επίπεδο Δικτύου (IP, δρομολόγηση). Επίπεδο Ζεύξης Δεδομένων."
    },
    {
        id: 5,
        title: "Ηλεκτρονική Ι",
        semester: 5,
        flow: "Ηλεκτρονική",
        flow_code: "H",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Φυσική ημιαγωγών. Δίοδοι επαφής pn. Κυκλώματα με διόδους. Διπολικά τρανζίστορ επαφής (BJT) και τρανζίστορ επίδρασης πεδίου (FET). Ενισχυτές μικρών σημάτων."
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
        description: "Παραγωγή, μεταφορά και διανομή ηλεκτρικής ενέργειας. Μοντέλα γραμμών μεταφοράς. Ροή φορτίου. Έλεγχος τάσης και συχνότητας. Οικονομική λειτουργία συστημάτων ηλεκτρικής ενέργειας."
    },
    // New courses to help test validation rules
    {
        id: 7,
        title: "Τεχνολογία Λογισμικού",
        semester: 6,
        flow: "Λογισμικό",
        flow_code: "L",
        ects: 6,
        type: 'compulsory',
        is_flow_compulsory: true,
        description: "Διαδικασίες ανάπτυξης λογισμικού, απαιτήσεις, σχεδίαση, υλοποίηση, έλεγχος. Αντικειμενοστραφής ανάλυση και σχεδίαση με UML."
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
        description: "Εισαγωγή στα τηλεπικοινωνιακά συστήματα. Αναλογική και ψηφιακή μετάδοση. Διαμόρφωση πλάτους, συχνότητας, φάσης."
    },
    {
        id: 9,
        title: "Φιλοσοφία της Επιστήμης",
        semester: 8,
        flow: "Ανθρωπιστικά",
        flow_code: "X",
        ects: 3,
        type: 'humanities',
        description: "Επιστημολογία, μεθοδολογία της επιστήμης, ιστορική εξέλιξη των επιστημονικών θεωριών."
    },
    {
        id: 10,
        title: "Ιστορία Τέχνης",
        semester: 8,
        flow: "Ανθρωπιστικά",
        flow_code: "X",
        ects: 3,
        type: 'humanities',
        description: "Επισκόπηση της ιστορίας της τέχνης από την αρχαιότητα έως σήμερα."
    },
    {
        id: 11,
        title: "Ελεύθερο Μάθημα 1",
        semester: 9,
        flow: "Ελεύθερο",
        flow_code: "X",
        ects: 4,
        type: 'free',
        description: "Δοκιμαστικό ελεύθερο μάθημα για έλεγχο κανόνων."
    }
];
