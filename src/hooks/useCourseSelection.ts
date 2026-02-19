import { useState, useEffect } from 'react';
import type { Direction } from '../utils/ruleEngine';

const COURSE_STORAGE_KEY = 'selectedCourses';
const DIRECTION_STORAGE_KEY = 'selectedDirection';

export const useCourseSelection = () => {
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
    const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);

    // Initialize state from local storage on mount
    useEffect(() => {
        const storedCourses = localStorage.getItem(COURSE_STORAGE_KEY);
        if (storedCourses) {
            try {
                setSelectedCourseIds(JSON.parse(storedCourses));
            } catch (e) {
                console.error("Failed to parse stored courses", e);
            }
        }

        const storedDirection = localStorage.getItem(DIRECTION_STORAGE_KEY);
        if (storedDirection) {
            setSelectedDirection(storedDirection as Direction);
        }
    }, []);

    const toggleCourse = (courseId: number) => {
        setSelectedCourseIds(prev => {
            const newSelection = prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId];

            localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(newSelection));
            return newSelection;
        });
    };

    const setDirection = (direction: Direction | null) => {
        setSelectedDirection(direction);
        if (direction) {
            localStorage.setItem(DIRECTION_STORAGE_KEY, direction);
        } else {
            localStorage.removeItem(DIRECTION_STORAGE_KEY);
        }
    };

    const clearSelection = () => {
        setSelectedCourseIds([]);
        setSelectedDirection(null);
        localStorage.removeItem(COURSE_STORAGE_KEY);
        localStorage.removeItem(DIRECTION_STORAGE_KEY);
    };

    return {
        selectedCourseIds,
        toggleCourse,
        selectedDirection,
        setDirection,
        clearSelection
    };
};
