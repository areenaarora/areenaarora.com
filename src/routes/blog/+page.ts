import type { PageLoad } from './$types';
import { getAllPosts } from '$lib/posts';

export const load: PageLoad = async () => {
  const posts = await getAllPosts();
  return { posts };
};
