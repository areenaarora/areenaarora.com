<div class="header">
	<a href="/" class="Home">Home</a>
	<div class="header-right">
		<a href="/about">About</a>
		<a href="/journalism">Journalism</a>
		<a href="/projects">Personal Projects</a>
		<a href="/experiments">Experiments</a>
	</div>
</div>

<style>
	.header {
		overflow: hidden;
		padding: 20px 10px;
	}

	.header a {
		float: left;
		color: #02594c;
		text-align: center;
		padding: 16px;
		font-size: 20px;
		line-height: 25px;
		border-radius: 400px;
	}

	.header a.Home {
		font-size: 22px;
		font-weight: bold;
	}

	.header a:hover {
		background-color: #ffd700;
		color: black;
		font-weight: bolder;
	}

	.header-right {
		float: right;
	}

	@media screen and (max-width: 500px) {
		.header a {
			float: none;
			display: block;
			text-align: left;
		}

		.header-right {
			float: none;
		}
	}
</style>
