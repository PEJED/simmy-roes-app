import { validateSelection } from './ruleEngine';
import type { Course } from '../types/Course';
import { describe, it, expect } from 'vitest';

const mockCourse = (id: number, flow: string, sem: number, isComp: boolean, type: 'compulsory' | 'elective' | 'humanities' | 'free' = 'compulsory'): Course => ({
    id,
    title: `Course ${id}`,
    semester: sem,
    flow: flow === 'G' ? 'General' : flow,
    flow_code: flow,
    ects: 4,
    type,
    is_flow_compulsory: isComp,
    description: '',
    lecture_hours: 0,
    lab_hours: 0,
    professors: ''
});

describe('ruleEngine validation', () => {
    it('validates a correct Full Flow (Y)', () => {
        const selected = [
            mockCourse(1, 'Y', 6, true),
            mockCourse(2, 'Y', 6, true),
            mockCourse(3, 'Y', 7, true),
            mockCourse(4, 'Y', 7, true), // 4 Compulsory (meets count)
            mockCourse(3213, 'Y', 8, false), // Meets "Option" requirement for Y
            mockCourse(6, 'Y', 8, false),
            mockCourse(7, 'Y', 9, false), // 7 Total

            // 6th sem rule helpers (Need 2 other basic flows with comp courses)
            mockCourse(101, 'L', 6, true),
            mockCourse(201, 'H', 6, true),
        ];

        const warnings = validateSelection(selected, 'Informatics', { 'Y': 'full', 'L': 'none', 'H': 'none' });

        const yWarnings = warnings.filter(w => w.includes('Ροή Y'));
        expect(yWarnings).toHaveLength(0);
    });

    it('warns on Invalid Full Flow (Y) - Not enough total', () => {
        const selected = [
            mockCourse(1, 'Y', 6, true),
            mockCourse(2, 'Y', 6, true),
            mockCourse(3, 'Y', 7, true),
            mockCourse(4, 'Y', 7, true),
            mockCourse(3213, 'Y', 8, false), // Option
            mockCourse(6, 'Y', 8, false),
            // Only 6 Total
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'Y': 'full' });
        expect(warnings.some(w => w.includes('Ροή Y') && w.includes('τουλάχιστον 7'))).toBe(true);
    });

    it('warns on Invalid Full Flow (Y) - Not enough compulsory', () => {
        const selected = [
            mockCourse(1, 'Y', 6, true),
            mockCourse(2, 'Y', 6, true),
            mockCourse(3, 'Y', 7, true),
            // Only 3 Compulsory
            mockCourse(3213, 'Y', 8, false), // Option
            mockCourse(6, 'Y', 8, false),
            mockCourse(7, 'Y', 9, false),
            mockCourse(8, 'Y', 9, false), // 7 Total
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'Y': 'full' });
        expect(warnings.some(w => w.includes('Ροή Y') && w.includes('τουλάχιστον 4'))).toBe(true);
    });

    it('warns on Missing Option for Y', () => {
        const selected = [
            mockCourse(1, 'Y', 6, true),
            mockCourse(2, 'Y', 6, true),
            mockCourse(3, 'Y', 7, true),
            mockCourse(4, 'Y', 7, true),
            mockCourse(5, 'Y', 8, false), // Missing 3213 or 3362
            mockCourse(6, 'Y', 8, false),
            mockCourse(7, 'Y', 9, false),
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'Y': 'full' });
        expect(warnings.some(w => w.includes('ομάδας επιλογής'))).toBe(true);
    });

    it('validates a correct Half Flow (L)', () => {
        const selected = [
            mockCourse(11, 'L', 6, true),
            mockCourse(12, 'L', 7, true),
            mockCourse(13, 'L', 8, true), // 3 Compulsory
            mockCourse(14, 'L', 9, false), // 4 Total
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'L': 'half' });
        const lWarnings = warnings.filter(w => w.includes('Ροή L'));
        expect(lWarnings).toHaveLength(0);
    });

    it('warns on Invalid Half Flow (L) - Not enough total', () => {
        const selected = [
            mockCourse(11, 'L', 6, true),
            mockCourse(12, 'L', 7, true),
            mockCourse(13, 'L', 8, true),
            // 3 Total
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'L': 'half' });
        expect(warnings.some(w => w.includes('Ροή L') && w.includes('τουλάχιστον 4'))).toBe(true);
    });

    it('warns on Invalid Half Flow (L) - Not enough compulsory', () => {
        const selected = [
            mockCourse(11, 'L', 6, true),
            mockCourse(12, 'L', 7, true),
            // 2 Compulsory
            mockCourse(14, 'L', 9, false),
            mockCourse(15, 'L', 9, false), // 4 Total
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'L': 'half' });
        expect(warnings.some(w => w.includes('Ροή L') && w.includes('τουλάχιστον 3'))).toBe(true);
    });

    it('warns if Special Flow (I) is Half', () => {
        const selected = [
            mockCourse(21, 'I', 6, true),
            mockCourse(22, 'I', 7, true),
            mockCourse(23, 'I', 8, true),
            mockCourse(24, 'I', 9, false),
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'I': 'half' });
        expect(warnings.some(w => w.includes('μόνο ως Ολόκληρες'))).toBe(true);
    });

    it('enforces 6th Semester Rule', () => {
        const selected = [
            mockCourse(1, 'Y', 6, true),
            mockCourse(101, 'L', 6, true),
            // Missing 3rd flow
        ];
        const warnings = validateSelection(selected, 'Informatics', { 'Y': 'half', 'L': 'half' });
        expect(warnings.some(w => w.includes('Κανόνας 6ου Εξαμήνου'))).toBe(true);

        const selectedValid = [
            mockCourse(1, 'Y', 6, true),
            mockCourse(101, 'L', 6, true),
            mockCourse(201, 'H', 6, true),
        ];
        const warningsValid = validateSelection(selectedValid, 'Informatics', { 'Y': 'half', 'L': 'half', 'H': 'half' });
        expect(warningsValid.some(w => w.includes('Κανόνας 6ου Εξαμήνου'))).toBe(false);
    });

    it('enforces Max 5 Free Electives', () => {
        // 6 Free courses (M)
        const selected = [
            mockCourse(301, 'M', 7, false, 'free'),
            mockCourse(302, 'M', 7, false, 'free'),
            mockCourse(303, 'M', 8, false, 'free'),
            mockCourse(304, 'M', 8, false, 'free'),
            mockCourse(305, 'M', 9, false, 'free'),
            mockCourse(306, 'M', 9, false, 'free'),
        ];
        const warnings = validateSelection(selected, 'Informatics', {});
        expect(warnings.some(w => w.includes('ελεύθερα μαθήματα (Μέγιστο: 5)'))).toBe(true);
    });

    it('enforces Max 1 Humanities', () => {
        const selected = [
            mockCourse(401, 'K', 8, false, 'humanities'),
            mockCourse(402, 'K', 8, false, 'humanities'),
        ];
        const warnings = validateSelection(selected, 'Informatics', {});
        expect(warnings.some(w => w.includes('ανθρωπιστικά μαθήματα'))).toBe(true);
    });

    it('enforces Max 1 Non-Flow', () => {
        const selected = [
            mockCourse(501, 'G', 8, false, 'elective'),
            mockCourse(502, 'G', 8, false, 'elective'),
        ];
        const warnings = validateSelection(selected, 'Informatics', {});
        expect(warnings.some(w => w.includes('εκτός ροών'))).toBe(true);
    });
});
