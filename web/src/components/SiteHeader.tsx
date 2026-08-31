import { Link } from "react-router";

type SiteHeaderProps = {
  kicker?: string;
};

export function SiteHeader({
  kicker = "Concurrency from first principles",
}: SiteHeaderProps) {
  return (
    <header className="mb-10">
      <Link
        to="/"
        className="font-mono text-[11px] tracking-[0.16em] text-mute uppercase no-underline hover:text-paper"
      >
        {kicker}
      </Link>
    </header>
  );
}
