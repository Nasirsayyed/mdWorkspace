const COLOR_MAP: Record<string, string> = {
  indigo: '#4f46e5',
  blue: '#2563eb',
  teal: '#0d9488',
  green: '#16a34a',
  amber: '#d97706',
  rose: '#e11d48',
  violet: '#7c3aed',
  slate: '#475569',
}

export const FOLDER_COLORS = Object.keys(COLOR_MAP)
export const FOLDER_ICONS = ['📁', '📘', '🏗', '📦', '🔌', '📱', '🗂', '⭐', '🚀', '🧩']

export function folderColorValue(color: string | null | undefined): string {
  return (color && COLOR_MAP[color]) || '#64748b'
}
