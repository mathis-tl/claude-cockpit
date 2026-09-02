const PATHS: Record<string, string> = {
  spark: "M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5l3 3M14.5 14.5l3 3M6.5 17.5l3-3M14.5 9.5l3-3",
  refresh:
    "M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66M14 6h4V2M10 18H6v4",
  history: "M12 7v5l3.5 2M4 12a8 8 0 1 1 2.5 5.8M4 12v5h5",
  message: "M4 5h16v11H8l-4 4V5Z",
  map: "M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z M9 4v14M15 6v14",
  edit: "M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z M14 6l4 4",
  blocks: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  bug: "M12 8a4 4 0 0 1 4 4v4a4 4 0 0 1-8 0v-4a4 4 0 0 1 4-4Z M9 8 7 5M15 8l2-3M4 12h4M16 12h4M5 19l3.5-2.5M19 19l-3.5-2.5M10 4h4",
  branch: "M6 4v10a4 4 0 0 0 4 4h4 M6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM18 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 6v10",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3.5 12h17M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z",
  check: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M8 12.5l2.5 2.5L16 9",
  eye: "M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  layers: "m12 3 9 5-9 5-9-5 9-5Z m-9 9 9 5 9-5M3 16l9 5 9-5",
  split: "M4 6h5l4 5 4-5h3 M4 18h5l4-5 M17.5 3.5 21 6l-3.5 2.5M17.5 20.5 21 18l-3.5-2.5",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z M9 12l2 2 4-4.5",
  stack: "m12 3 8 4.5-8 4.5-8-4.5L12 3Z M4 12.5l8 4.5 8-4.5",
  flag: "M6 21V4 M6 4h12l-3 4 3 4H6",
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  const d = PATHS[name] ?? PATHS.spark;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function ClaudeMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x="11.15"
          y="1.5"
          width="1.7"
          height="7"
          rx="0.85"
          fill="currentColor"
          transform={`rotate(${i * 30} 12 12)`}
        />
      ))}
    </svg>
  );
}
