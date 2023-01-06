<footer>
	<a href="https://github.com/areenaarora" target="_blank" rel="noreferrer">Github</a>
	<a href="https://twitter.com/AreenaArora" target="_blank" rel="noreferrer">Twitter</a>
	<p>areena [dot] arora [at] columbia [dot] edu</p>
</footer>

<style>
	footer {
		display: flex;
		align-items: center;
		padding: 80px 10px 20px 10px;
		position: sticky;
		top: 100vh;
		justify-content: center;
	}

	footer a {
		color: #02594c;
		text-align: center;
		padding: 12px;
		font-size: 18px;
		line-height: 25px;
		border-radius: 4px;
	}

	footer p {
		font-size: 18px;
	}

	footer a:hover {
		background-color: gold;
		color: black;
		font-weight: bolder;
	}

	@media screen and (max-width: 500px) {
		footer a {
			float: none;
			display: block;
			text-align: left;
		}
	}
</style>
