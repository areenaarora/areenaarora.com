// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

// Minimal front-matter parser (no Node deps)
function parseFrontmatter(raw: string) {
  const m = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*/.exec(raw);
  if (!m) return { data: {}, content: raw };

  const yaml = m[1];
  const data: Record<string, string> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const mm = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/.exec(line);
    if (!mm) continue;
    let v = mm[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[mm[1]] = v;
  }
  const content = raw.slice(m[0].length);
  return { data, content };
}

// IMPORTANT: mirror the working list glob
const files = import.meta.glob("/src/posts/*.md", { eager: true, as: "raw" }) as Record<
  string,
  string
>;

export const load: PageLoad = ({ params }) => {
  // Find /src/posts/<slug>.md
  const match = Object.entries(files).find(([p]) => p.endsWith(`${params.slug}.md`));
  if (!match) throw error(404, `Post ${params.slug} not found`);

  const { data, content } = parseFrontmatter(match[1]);

  return {
    slug: params.slug,
    meta: {
      title: data.title ?? params.slug,
      date: data.date ?? "",
      description: data.description ?? ""
    },
    content
  };
};