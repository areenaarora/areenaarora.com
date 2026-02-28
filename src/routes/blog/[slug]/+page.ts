import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

type PostMeta = {
	slug: string;
	title: string;
	date?: string;
	description?: string;
};

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

function estimateReadTimeMinutes(markdown: string) {
	const plain = markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[[^\]]+\]\([^)]*\)/g, ' ')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/[>*_~`#-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	const words = plain ? plain.split(' ').length : 0;
	return Math.max(1, Math.ceil(words / 220));
}

const files = import.meta.glob('/src/posts/*.md', { eager: true, as: 'raw' }) as Record<string, string>;

export const load: PageLoad = ({ params }) => {
	const entries = Object.entries(files).map(([filepath, raw]) => {
		const slug = filepath.split('/').pop()!.replace(/\.md$/, '');
		const { data, content } = parseFrontmatter(raw);
		return {
			slug,
			meta: {
				title: data.title ?? slug,
				date: data.date ?? '',
				description: data.description ?? ''
			},
			content,
			relatedRaw: data.related ?? ''
		};
	});

	const post = entries.find((p) => p.slug === params.slug);
	if (!post) throw error(404, `Post ${params.slug} not found`);

	const allPostMeta: PostMeta[] = entries
		.map((p) => ({ slug: p.slug, title: p.meta.title, date: p.meta.date, description: p.meta.description }))
		.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

	const explicitRelated = post.relatedRaw
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);

	let related: PostMeta[] = [];
	if (explicitRelated.length) {
		related = explicitRelated
			.map((slug) => allPostMeta.find((p) => p.slug === slug))
			.filter(Boolean) as PostMeta[];
	}

	if (!related.length) {
		related = allPostMeta.filter((p) => p.slug !== post.slug).slice(0, 4);
	}

	return {
		slug: post.slug,
		meta: post.meta,
		content: post.content,
		readTimeMinutes: estimateReadTimeMinutes(post.content),
		related: related.slice(0, 4)
	};
};
