const ageToYearOfBirth = (age: number): number => {
    const currentYear = new Date().getFullYear();
    return currentYear - age;
};

const yearOfBirthToAge = (yearOfBirth: number): number => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentDate = new Date().getDate();
    
    let age = currentYear - yearOfBirth;
    if (currentMonth < 6) {
        age -= 1;
    }
    
    return Math.max(0, age); // Ensure age is not negative
};

// Validate year of birth
const isValidYearOfBirth = (yearOfBirth: number): boolean => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 120; // Maximum reasonable age
    const maxYear = currentYear - 10;  // Minimum age (10 years old)
    
    return yearOfBirth >= minYear && yearOfBirth <= maxYear;
};


export { ageToYearOfBirth, yearOfBirthToAge, isValidYearOfBirth };