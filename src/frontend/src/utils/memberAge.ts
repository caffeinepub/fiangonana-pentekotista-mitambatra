/**
 * Utility to calculate age from a date of birth string.
 * Returns the age as a number or null if the date is invalid/empty/future.
 */
export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth || !dateOfBirth.trim()) {
    return null;
  }

  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return null;
    }

    // Check if date is in the future
    if (birthDate > today) {
      return null;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Format age for display, returning a placeholder for invalid/missing ages.
 */
export function formatAge(dateOfBirth: string): string {
  const age = calculateAge(dateOfBirth);
  return age !== null ? `${age}` : '—';
}
