<script>
	import Footer from '../lib/Footer.svelte';
	import Header from '../lib/Header.svelte';
</script>

<Header />

<body>
	<div class="center-content">
		<h1>Hi! I'm Areena 👋🏻</h1>
		<p>
			I'm a data journalist, <a href="https://www.instagram.com/feelin_gredient/"
				>occassional food blogger,</a
			> and house plant enthusiast!
		</p>
		<p>
			I'm new to the world of data-powered storytelling, and slowly paving my path at <a
				href="https://www.knoxnews.com/staff/8034861001/areena-arora/"
				target="_blank"
				rel="noreferrer"
			>
				Knox News.</a
			>
		</p>
		<p>
			I'm also ✨NEW✨ to coding, and learning Svelte. This website is where I hope to showcase my
			best front-end work.
		</p>
	</div>

	<Footer />
</body>

<style>
	.center-content {
		margin: 0px;
		padding: 50px 350px;
	}

	h1 {
		font-family: sans-serif;
		font-size: 60px;
		color: seagreen;
	}

	p {
		font-size: 20px;
	}
</style>
