export const toTitleCase = (s: string): string =>
  s.trim().replace(/\b\w/g, (c) => c.toUpperCase())

export const toSentenceCase = (s: string): string => {
  const t = s.trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}
