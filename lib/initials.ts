/** Initials from a name, e.g. "David Parker" → "DP", "Cher" → "C". The favicon and the terminal's pedestal art share them. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return (
    words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0]
  ).toUpperCase();
}
