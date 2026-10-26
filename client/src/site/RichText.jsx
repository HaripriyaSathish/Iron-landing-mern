// Admin texts can highlight words by wrapping them in **double stars** → bold maroon on the website
export default function RichText({ text }) {
  const parts = String(text ?? '').split(/\*\*(.+?)\*\*/g)
  // split() with a capture group: odd positions are the highlighted words
  return parts.map((part, i) => (i % 2 ? <strong key={i} className="hl">{part}</strong> : part))
}
