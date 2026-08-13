import type { AssignmentSubmissionMethod } from '../../../stores/assignment.store';

export interface AssignmentFormValues {
  url?: string;
  fileSelected?: boolean;
  fileName?: string;
  textResponse?: string;
}

export interface AssignmentValidationErrors {
  url?: string;
  file?: string;
  text?: string;
}

/**
 * Validates if a given URL is a safe http or https URL.
 * Rejects unsafe schemes like javascript:, data:, file:, etc.
 */
export function isSafeHttpUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('file:')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Validates assignment submission inputs based on enabled submission methods.
 */
export function validateAssignmentSubmission(
  methods: AssignmentSubmissionMethod[],
  values: AssignmentFormValues
): AssignmentValidationErrors {
  const errors: AssignmentValidationErrors = {};

  if (methods.includes('url')) {
    if (!values.url || !values.url.trim()) {
      errors.url = 'Submission URL is required.';
    } else if (!isSafeHttpUrl(values.url)) {
      errors.url = 'Enter a valid URL starting with http:// or https://';
    }
  }

  if (methods.includes('file')) {
    if (!values.fileSelected && !values.fileName) {
      errors.file = 'Please select a project file to upload.';
    }
  }

  if (methods.includes('text')) {
    if (!values.textResponse || !values.textResponse.trim()) {
      errors.text = 'Please enter your written response.';
    }
  }

  return errors;
}

/**
 * Auto-scrolls into view to focus the first invalid input element on validation failure.
 */
export function scrollToFirstAssignmentError(errors: AssignmentValidationErrors): void {
  const firstErrorKey = Object.keys(errors)[0];
  if (!firstErrorKey) return;

  const targetId = `assignment-${firstErrorKey}`;
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus();
  }
}
