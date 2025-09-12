// src/lib/posts.ts

export type PostListItem = {
  slug: string;
  title: string;
  date: string;
};

/** Very small front-matter parser for `--- ... ---` blocks */
function parseFrontmatter(raw: string): Record<string, string> {
  const m = /^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*/.exec(raw);
  if (!m) return {};
  const yaml = m[1];

  const data: Record<string, string> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const mm = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/.exec(line);
    if (!mm) continue;
    let v = mm[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    data[mm[1]] = v;
  }
  return data;
}

export function getAllPosts(): PostListItem[] {
  // Load markdown files in /src/posts as raw text
  const files = import.meta.glob("/src/posts/*.md", { eager: true, as: "raw" });


  console.log("Matched markdown files:", Object.keys(files));

  const posts: PostListItem[] = Object.entries(files).map(([filepath, raw]) => {
    const slug = filepath.split("/").pop()!.replace(/\.md$/, "");
    const data = parseFrontmatter(raw || "");
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
    };
  });

  posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return posts;
}