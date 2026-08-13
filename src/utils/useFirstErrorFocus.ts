export type FieldErrorMap = Record<string, string | undefined>;

export interface FirstErrorOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  focus?: boolean;
}

/**
 * Focuses and smooth-scrolls into view the first invalid form field element on validation failure.
 * Automatically expands collapsed parent <details> or accordion elements if necessary.
 */
export function focusFirstError(
  errors: FieldErrorMap,
  fieldOrder?: string[],
  options: FirstErrorOptions = { behavior: 'smooth', block: 'center', focus: true }
): void {
  const errorKeys = Object.keys(errors).filter((k) => !!errors[k]);
  if (errorKeys.length === 0) return;

  const targetKey = fieldOrder
    ? fieldOrder.find((k) => !!errors[k]) || errorKeys[0]
    : errorKeys[0];

  const elementId = `field-${targetKey}`;
  const element =
    document.getElementById(elementId) ||
    document.getElementById(`assignment-${targetKey}`) ||
    document.querySelector(`[name="${targetKey}"]`);

  if (element) {
    // If inside a closed <details> or accordion container, expand it first
    const detailsParent = element.closest('details');
    if (detailsParent && !detailsParent.open) {
      detailsParent.open = true;
    }

    element.scrollIntoView({
      behavior: options.behavior || 'smooth',
      block: options.block || 'center',
    });

    if (options.focus !== false && 'focus' in element && typeof (element as HTMLElement).focus === 'function') {
      (element as HTMLElement).focus({ preventScroll: true });
    }
  }
}
