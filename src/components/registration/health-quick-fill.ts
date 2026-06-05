/** Canonical quick-fill values for health registration fields. */
export const HEALTH_NONE_KNOWN = "None known";
export const HEALTH_NONE = "None";

export function toggleHealthQuickFill(
  current: string | undefined,
  fillValue: string,
  onChange: (value: string) => void,
) {
  if (current?.trim() === fillValue) {
    onChange("");
  } else {
    onChange(fillValue);
  }
}
