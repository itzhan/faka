const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const BOLD = /\*\*([^*]+)\*\*/g;

export default function TutorialRich({ text }: { text: string }) {
  const parts: { t: "text" | "a" | "b"; v: string; href?: string }[] = [];
  const src = text.replace(BOLD, "⟨b⟩$1⟨/b⟩").replace(LINK, "⟨a|$2⟩$1⟨/a⟩");
  const tokens = src.split(/(⟨b⟩.*?⟨\/b⟩|⟨a\|.*?⟩.*?⟨\/a⟩)/);
  for (const token of tokens) {
    if (!token) continue;
    const b = token.match(/^⟨b⟩(.*?)⟨\/b⟩$/);
    if (b) {
      parts.push({ t: "b", v: b[1] });
      continue;
    }
    const a = token.match(/^⟨a\|(.*?)⟩(.*?)⟨\/a⟩$/);
    if (a) {
      parts.push({ t: "a", v: a[2], href: a[1] });
      continue;
    }
    parts.push({ t: "text", v: token });
  }
  return (
    <>
      {parts.map((p, i) =>
        p.t === "b" ? (
          <strong key={i} className="font-semibold text-ink">
            {p.v}
          </strong>
        ) : p.t === "a" ? (
          <a
            key={i}
            href={p.href}
            className="font-medium text-accent underline-offset-2 hover:underline"
            target={p.href?.startsWith("http") ? "_blank" : undefined}
            rel={p.href?.startsWith("http") ? "noreferrer" : undefined}
          >
            {p.v}
          </a>
        ) : (
          <span key={i}>{p.v}</span>
        )
      )}
    </>
  );
}
