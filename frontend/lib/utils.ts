// Simple class name joiner used to avoid adding additional dependencies.
// Filters out falsy values and joins the rest with spaces.
export function cn(
  ...classes: Array<string | number | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ")
}
