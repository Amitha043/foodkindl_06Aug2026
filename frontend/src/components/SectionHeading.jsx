export default function SectionHeading({ eyebrow, title, accent, description }) {
  return (
    <div className="section-heading">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>
        {title} {accent && <span>{accent}</span>}
      </h2>
      {description && <p>{description}</p>}
    </div>
  );
}
