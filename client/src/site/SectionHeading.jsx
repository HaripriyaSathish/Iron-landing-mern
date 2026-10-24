// Gold tagline, serif heading and the ── ◆ ── ornament used by most sections
export default function SectionHeading({ tagline, heading, sub, light = false }) {
  return (
    <div className={`s-heading ${light ? 's-heading--light' : ''} ${sub ? 's-heading--sub' : ''}`} data-reveal="up">
      {tagline && <span className="eyebrow">{tagline}</span>}
      <h2>{heading}</h2>
      <span className="ornament" aria-hidden="true">
        <i />
        <b />
        <i />
      </span>
      {sub && <p>{sub}</p>}
    </div>
  )
}
