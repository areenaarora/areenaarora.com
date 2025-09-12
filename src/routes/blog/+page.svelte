<script lang="ts">
	export let data: {
		posts: { slug: string; title: string; date: string }[];
	};
</script>

<div class="pane">
	<h3>Recent posts</h3>
	<ul class="posts">
		{#each data.posts as p}
			<li>
				<time>{p.date}</time>
				<a href={`/blog/${p.slug}`}>{p.title}</a>
			</li>
		{/each}
	</ul>
</div>
