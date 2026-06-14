import { ICON_PATHS } from "@/lib/icons";

/**
 * Monochrome line icon. Color comes from the surrounding text color
 * (`currentColor`) — e.g. `<Icon name="heart" className="text-brand" />`.
 * Set `solid` to fill the glyph (used for the filled "pinned" heart).
 */
export function Icon({
  name,
  size = 22,
  strokeWidth = 1.8,
  solid = false,
  className = "",
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  solid?: boolean;
  className?: string;
}) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.spark;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? "currentColor" : "none"}
      stroke={solid ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
