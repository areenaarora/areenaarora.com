<h1>Observations. Thoughts</h1>
<div class="main-article">
	<img src="/newspaper.jpg" class="hero-image" alt="A man dances." />
	<div class="lead-story">
		<h2>lorem ipsum</h2>
		<p>
			Duis blandit urna felis, quis venenatis ipsum lacinia non. Nullam ac leo risus. Nam fermentum
			mi felis, non mollis ligula euismod ac. Quisque in erat neque. Phasellus dapibus justo eget
			lectus auctor facilisis. Proin felis nibh, scelerisque eu purus at, efficitur ultricies
			lectus. Vestibulum accumsan sagittis lacus, ac tristique sem tincidunt molestie.
		</p>
	</div>
</div>
<div class="article-box">
	<div>
		<h3>story one</h3>
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam euismod vulputate dolor ac porta.
		</p>
	</div>
	<div>
		<h3>story two</h3>
		<p>
			Duis ullamcorper id lacus eget laoreet. Fusce consectetur odio non justo feugiat pellentesque.
		</p>
	</div>
	<div>
		<h3>story three</h3>
		<p>In nec imperdiet lorem. In convallis sit amet purus et vestibulum.</p>
	</div>
</div>

<style>
	h1 {
		font-size: 40px;
		text-align: center;
		padding-bottom: 30px;
		/* Use for page title */
	}

	h2 {
		font-size: 40px;
		text-transform: capitalize;
		/* use for featured story heading */
	}

	h3 {
		font-size: 30px;
		text-transform: capitalize;
		/* use for smaller block headings */
	}

	.article-box {
		display: flex;
		margin: 0 auto;
		max-width: 800px;
		gap: 40px;
		padding-top: 30px;
	}

	.main-article {
		max-width: 1500px;
		max-height: 800px;
		display: flex;
	}

	.lead-story {
		padding: 30px;
	}

	.hero-image {
		margin: 0 auto;
		max-height: 400px;
		align-items: left;
	}

	body {
		font-family: 'Karla', sans-serif;
		font-weight: lighter;
	}
</style>
