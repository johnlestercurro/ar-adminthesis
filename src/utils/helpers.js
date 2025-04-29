export const getAvatarText = (name) => {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase()
}
