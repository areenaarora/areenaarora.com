// src/routes/blog/+page.ts
import type { PageLoad } from "./$types";

// Same minimal front-matter parser as in [slug]/+page.ts
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
  return { data, content: raw.slice(m[0].length) };
}

// Mirror the slug page glob
const files = import.meta.glob("/src/posts/*.md", { eager: true, as: "raw" }) as Record<
  string,
  string
>;

export const load: PageLoad = async () => {
  const posts = Object.entries(files).map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    const { data } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      description: data.description ?? ""
    };
  });

  // Newest first (YYYY-MM-DD sorts lexicographically)
  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return { posts };
};