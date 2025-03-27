<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	onMount(() => {
		const isMobile = window.innerWidth < 900;

		const margin = isMobile
			? { top: 50, right: 20, bottom: 50, left: 40 }
			: { top: 50, right: 100, bottom: 50, left: 200 };
		const width =
				document.getElementById('scores-chart-container').getBoundingClientRect().width -
				margin.left -
				margin.right,
			height =
				document.getElementById('scores-chart-container').getBoundingClientRect().height -
				margin.top -
				margin.bottom;

		const svg = d3
			.select('#scores-chart')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const tooltip = d3.select('#tooltip');

		const categories = ['Batting Score', 'Bowling Score', 'Overall Score'];
		const categoryY = d3.scalePoint().domain(categories).range([0, height]).padding(0.5);

		d3.csv('IPL_data.csv').then((data) => {
			data.forEach((d) => {
				d.batting_score = +d.batting_score || 0;
				d.bowling_score = +d.bowling_score || 0;
				d.overall_score = +d.overall_score || 0;
			});

			const teams = Array.from(new Set(data.map((d) => d.Team)));
			const seasons = Array.from(new Set(data.map((d) => d.Season)));

			const teamFilter = d3.select('#teamFilter');
			teams.forEach((team) => {
				teamFilter.append('option').attr('value', team).text(team);
			});

			const yearFilter = d3.select('#yearFilter');
			seasons.forEach((season) => {
				yearFilter.append('option').attr('value', season).text(season);
			});

			const xScale = {
				'Batting Score': d3.scaleLinear().range([0, width]),
				'Bowling Score': d3.scaleLinear().range([0, width]),
				'Overall Score': d3.scaleLinear().range([0, width])
			};

			function updateChart() {
				let filteredData = data;
				const selectedTeam = teamFilter.node().value;
				const selectedYear = yearFilter.node().value;

				if (selectedTeam !== 'all') {
					filteredData = filteredData.filter((d) => d.Team === selectedTeam);
				}
				if (selectedYear !== 'all') {
					filteredData = filteredData.filter((d) => d.Season === selectedYear);
				}

				const formattedData = {
					'Batting Score': [],
					'Bowling Score': [],
					'Overall Score': []
				};
				categories.forEach((category) => {
					let key = category.toLowerCase().replace(' ', '_');
					let topPlayers = filteredData
						.sort((a, b) => b[key] - a[key])
						.slice(0, 5)
						.map((d) => ({
							...d,
							player: d.Player,
							type: category,
							score: d[key]
						}));
					formattedData[category] = topPlayers;
				});

				function getPaddedMinMax(data) {
					const min = d3.min(data, (d) => d.score);
					const max = d3.max(data, (d) => d.score);
					// Get next hundredth number
					const nextHundredth = Math.ceil(max / 100) * 100;
					// Get previous hundredth number
					const prevHundredth = Math.floor(min / 100) * 100;
					// Calculate padding

					return [prevHundredth, nextHundredth];
				}

				const minMaxScores = {
					'Batting Score': getPaddedMinMax(formattedData['Batting Score']),
					'Bowling Score': getPaddedMinMax(formattedData['Bowling Score']),
					'Overall Score': getPaddedMinMax(formattedData['Overall Score'])
				};

				Object.keys(xScale).forEach((scale) => {
					xScale[scale].domain(getPaddedMinMax(formattedData[scale]));
				});

				svg
					.selectAll('.category-line, .range-label-left, .range-label-right, .category-label')
					.remove();

				svg
					.selectAll('.range-label-left')
					.data(categories)
					.enter()
					.append('text')
					.attr('class', 'range-label-left')
					.attr('x', -5)
					.attr('y', (d) => categoryY(d) + 5)
					.text((d) => minMaxScores[d][0])
					.attr('font-size', '12px')
					.attr('fill', 'black')
					.attr('text-anchor', 'end');

				svg
					.selectAll('.range-label-right')
					.data(categories)
					.enter()
					.append('text')
					.attr('class', 'range-label-right')
					.attr('x', width + 20)
					.attr('y', (d) => categoryY(d) + 5)
					.text((d) => minMaxScores[d][1])
					.attr('font-size', '12px')
					.attr('fill', 'black')
					.attr('text-anchor', 'start');

				const labelOffset = {}; // Track offsets per category to prevent overlap

				const labelOffsets = {}; // Track y-offsets per category to prevent overlap

				svg.selectAll('.player-label').remove();
				svg
					.selectAll('.player-number')
					.data(Object.values(formattedData).flat())
					.enter()
					.append('text')
					.attr('class', 'player-number')
					.attr('x', (d) => xScale[d.type](d.score))
					.attr('y', (d) => categoryY(d.type) + 5) // Adjust to align with circle
					.text((d, i) => i + 1) // Assign numbers instead of names
					.attr('font-size', '12px')
					.attr('fill', 'white') // Ensure good contrast against circles
					.attr('text-anchor', 'middle')
					.attr('font-weight', 'bold');

				// Remove old elements before adding new ones
				svg.selectAll('.data-circle, .data-symbol').remove();

				// Append symbols (🏏 for Batting, 🎾 for Bowling, ⚫ for Overall)
				svg
					.selectAll('.data-symbol')
					.data(Object.values(formattedData).flat())
					.enter()
					.append('text')
					.attr('class', 'data-symbol')
					.attr('x', (d) => xScale[d.type](d.score))
					.attr('y', (d) => categoryY(d.type) + 5) // Adjust vertical alignment
					.attr('font-size', '20px') // Emoji size
					.attr('text-anchor', 'middle')
					.text(
						(d) =>
							d.type === 'Batting Score'
								? '🏏'
								: d.type === 'Bowling Score'
								? '🎾'
								: d.type === 'Overall Score'
								? '🏆'
								: '⚫' // Default for Overall Score
					)
					.on('mouseover', (event, d) => {
						tooltip
							.style('display', 'block')
							.html(`${d.player}<br>Score: ${d.score}`)
							.style('left', event.pageX + 5 + 'px')
							.style('top', event.pageY - 30 + 'px')
							.style('opacity', 1);
					})
					.on('mouseout', () => tooltip.style('opacity', 0));

				// REMOVE OLD PLAYER LISTS
				d3.select('#player-lists').remove();

				// CREATE A CONTAINER FOR PLAYER LISTS
				const listContainer = d3
					.select('#scores-chart-container')
					.append('div')
					.attr('id', 'player-lists');

				// LOOP THROUGH EACH CATEGORY AND DISPLAY TOP PLAYERS
				categories.forEach((category) => {
					const categoryData = formattedData[category] || [];

					const list = listContainer.append('div').attr('class', 'player-names');

					list.append('h3').text(category); // CATEGORY TITLE

					categoryData.forEach((d, i) => {
						list
							.append('p')
							.text(`${i + 1}. ${d.player}`)
							.style('font-size', '14px')
							.style('margin', '2px 0')
							.style('max-width', 'fit-content');
					});
				});

				// .style("transform", "rotate(45deg)")
				// .style("transform-origin", d => `${minScores[d.type]}px ${categoryY(d.type)}px`)

				svg
					.selectAll('.category-line')
					.data(categories)
					.enter()
					.append('line')
					.attr('class', 'category-line')
					.attr('x1', 0)
					.attr('x2', width)
					.attr('y1', (d) => categoryY(d))
					.attr('y2', (d) => categoryY(d))
					.attr('stroke', '#ccc')
					.attr('stroke-width', 2);

				svg
					.selectAll('.category-label')
					.data(categories)
					.enter()
					.append('text')
					.attr('class', 'category-label')
					.attr('x', -margin.left + (isMobile ? 20 : 50))
					.attr('y', (d) => categoryY(d) + (isMobile ? 25 : 5))
					.text((d) => d)
					.attr('font-size', '14px')
					.attr('fill', 'black');
			}

			teamFilter.on('change', updateChart);
			yearFilter.on('change', updateChart);

			svg.selectAll('.tick-mark').remove();
			Object.keys(xScale).forEach((scale) => {
				const tickValues = xScale[scale].ticks(5);
				svg
					.selectAll(`.tick-mark-${scale}`)
					.data(tickValues)
					.enter()
					.append('line')
					.attr('class', 'tick-mark')
					.attr('x1', (d) => xScale[scale](d))
					.attr('x2', (d) => xScale[scale](d))
					.attr('y1', (d) => categoryY(scale) - 5)
					.attr('y2', (d) => categoryY(scale) + 5)
					.attr('stroke', 'black');
			});

			updateChart();
		});
	});
</script>

<div id="scores-chart-container">
	<h3>Top five IPL players by batting, bowling and overall score</h3>
	<svg id="scores-chart" />
	<div class="filters">
		<label for="teamFilter">Select Team:</label>
		<select id="teamFilter">
			<option value="all">All</option>
		</select>
		<label for="yearFilter">Select Year:</label>
		<select id="yearFilter">
			<option value="all">All</option>
		</select>
	</div>
	<div class="tooltip" id="tooltip" />
</div>

<style>
	#scores-chart-container {
		position: relative;
		margin-bottom: 100px;
		margin-left: auto;
		margin-right: auto;

		@media screen and (min-width: 850px) {
			width: 100%;
			max-width: 800px;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}

	#scores-chart {
		aspect-ratio: 800 / 400;

		@media screen and (max-width: 850px) {
			margin: 0 -25px;
			width: 100vw;
		}
	}

	:global(#player-lists) {
		background: white;
		padding: 10px;
		border: 1px solid black;

		@media screen and (min-width: 850px) {
			position: absolute;
			right: -150px;
			top: 50px;
		}
		@media screen and (max-width: 850px) {
			display: flex;
			margin-top: 40px;
		}
	}

	:global(#teamFilter) {
		@media screen and (max-width: 850px) {
			width: 100%;
			max-width: 200px;
		}
	}

	:global(.player-names) {
		margin-bottom: 15px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		@media screen and (max-width: 850px) {
			/* flex-direction: row; */
		}
	}

	.filters {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}

	.filters label,
	.filters select {
		margin: 0 10px;
	}

	.tooltip {
		position: absolute;
		text-align: center;
		padding: 5px;
		font-size: 12px;
		background: lightgray;
		border: 1px solid #ddd;
		border-radius: 5px;
		pointer-events: none;
		opacity: 0;
	}

	:global(h3) {
		margin: 0;
	}
</style>
