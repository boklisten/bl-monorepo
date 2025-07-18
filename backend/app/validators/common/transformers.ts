export function cleanUserInput(dirtyText: string) {
  const withCoalescedSpaces = dirtyText.replaceAll(/\s+/gu, " ").trim();
  const separators = withCoalescedSpaces.match(/[ -]/g);
  const caseCorrectedWordParts = withCoalescedSpaces
    .split(/[ -]/g)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase());
  return caseCorrectedWordParts
    .map((part, index) => part + (separators?.[index] ?? ""))
    .join("");
}
