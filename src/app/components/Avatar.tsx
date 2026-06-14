type AvatarProps = {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-24 w-24 text-3xl",
};

export default function Avatar({ name, image, size = "md" }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-slate-900 to-slate-500 font-semibold text-white shadow-lg ring-1 ring-white/60`}
      aria-label={name ?? "Usuario"}
    >
      {image ? (
        <img
          src={image}
          alt={name ?? "Avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
