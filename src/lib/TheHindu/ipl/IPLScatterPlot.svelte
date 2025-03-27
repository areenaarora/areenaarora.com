<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	onMount(() => {
		const isMobile = window.innerWidth < 900;
		const margin = isMobile
			? { top: 20, right: 30, bottom: 50, left: 35 }
			: { top: 20, right: 30, bottom: 50, left: 60 };
		const width =
				document.getElementById('scatter-chart-container').getBoundingClientRect().width -
				margin.left -
				margin.right,
			height =
				document.getElementById('scatter-chart-container').getBoundingClientRect().height -
				margin.top -
				margin.bottom;

		const svg = d3
			.select('#scatter-chart-container')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

		const xScale = d3.scaleLinear().range([0, width]);
		const yScale = d3.scaleLinear().range([height, 0]);
		svg.append('g').attr('class', 'x-axis');
		const yAxis = d3.axisLeft(yScale);

		svg.append('g').attr('class', 'y-axis');

		svg
			.append('text')
			.attr('class', 'x-label')
			.attr('x', width / 2)
			.attr('y', height + 40)
			.attr('text-anchor', 'middle')
			.text('Salary (INR)');

		svg
			.append('text')
			.attr('class', 'y-label')
			.attr('x', -height / 2)
			.attr('y', -40)
			.attr('text-anchor', 'middle')
			.attr('transform', 'rotate(-90)')
			.text('Overall Performance Score');

		svg.append('text').attr('class', 'avg-performance-label');
		svg.append('text').attr('class', 'avg-salary-label');

		d3.csv('merged_sal.csv')
			.then((data) => {
				data = data.filter((d) => +d['Salary'] > 0);
				data.forEach((d) => {
					d.salary = +d['Salary'];
					d.overall_score = +d['Overall score'];
					d.season = +d['Season'];
					d.team = d['Team'];
					d.name = d['Name'];
				});

				const seasons = [...new Set(data.map((d) => d.season))].sort();
				d3.select('#season-filter')
					.on('change', updateChart)
					.selectAll('option')
					.data(seasons)
					.enter()
					.append('option')
					.attr('value', (d) => d)
					.text((d) => d);

				d3.select('#season-filter').property('value', seasons[0]);

				function updateChart() {
					const selectedSeason = +d3.select('#season-filter').node().value;
					const filteredData = data.filter(
						(d) => d.season === selectedSeason && !isNaN(d.overall_score)
					);
					if (filteredData.length === 0) return;

					xScale.domain([0, d3.max(filteredData, (d) => d.salary)]).nice();
					yScale.domain(d3.extent(filteredData, (d) => d.overall_score)).nice();

					const avgSalary = d3.mean(filteredData, (d) => d.salary);
					const avgPerformance = d3.mean(filteredData, (d) => d.overall_score);

					const quadrant1 = filteredData.filter(
						(d) => d.salary > avgSalary && d.overall_score < avgPerformance
					).length;
					const quadrant3 = filteredData.filter(
						(d) => d.salary < avgSalary && d.overall_score > avgPerformance
					).length;

					document.getElementById(
						'summary'
					).innerText = `In ${selectedSeason}, ${quadrant1} players performed below average but were paid above average. ${quadrant3} players performed above average and were paid below average.`;

					svg.select('.y-axis').transition().call(yAxis);
					svg.selectAll('.x-axis-line').remove(); // Remove existing x-axis line to prevent duplication

					svg
						.append('line')
						.attr('class', 'x-axis-line')
						.attr('x1', 0)
						.attr('x2', width)
						.attr('y1', yScale(0))
						.attr('y2', yScale(0))
						.attr('stroke', 'black')
						.attr('stroke-width', 1);

					svg
						.select('.x-axis')
						.attr('transform', `translate(0,${yScale(0)})`)
						.transition()
						.call(
							d3
								.axisBottom(xScale)
								.ticks(isMobile ? 4 : 10)
								.tickFormat((d) => {
									if (d === 0) {
										return '';
									}

									return d.toLocaleString('en-IN');
								})
						);

					svg.selectAll('.avg-line, .avg-salary-line, .dot').remove();

					svg
						.append('line')
						.attr('class', 'avg-line')
						.attr('x1', 0)
						.attr('x2', width)
						.attr('y1', yScale(avgPerformance))
						.attr('y2', yScale(avgPerformance))
						.attr('stroke', 'red')
						.attr('stroke-width', 2)
						.attr('stroke-dasharray', '5 5');

					svg
						.append('line')
						.attr('class', 'avg-salary-line')
						.attr('x1', xScale(avgSalary))
						.attr('x2', xScale(avgSalary))
						.attr('y1', 0)
						.attr('y2', height)
						.attr('stroke', 'blue')
						.attr('stroke-width', 2)
						.attr('stroke-dasharray', '5 5');

					svg
						.select('.avg-performance-label')
						.attr('x', width - 100)
						.attr('y', yScale(avgPerformance) - 5)
						.attr('fill', 'red')
						.text('Avg Performance');

					svg
						.select('.avg-salary-label')
						.attr('x', xScale(avgSalary) + 5)
						.attr('y', 5)
						.attr('fill', 'blue')
						.text('Avg Salary');

					svg
						.selectAll('.dot')
						.data(filteredData, (d) => d.Name)
						.enter()
						.append('circle')
						.attr('class', 'dot')
						.attr('r', 5)
						.attr('fill', 'steelblue')
						.attr('opacity', 0.7)
						.attr('cx', (d) => xScale(d.salary))
						.attr('cy', (d) => yScale(d.overall_score))
						.on('mouseover', (event, d) => {
							tooltip
								.style('display', 'block')
								.html(
									`<strong>${d.name || 'Unknown'}</strong><br>Salary: ₹${Intl.NumberFormat(
										'en-IN'
									).format(d.salary)}<br>Performance: ${d.overall_score}<br>Team: ${d.team}`
								);
						})
						.on('mousemove', (event) => {
							tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px');
						})
						.on('mouseout', () => tooltip.style('display', 'none'));
				}
				updateChart();
			})
			.catch((error) => console.error('Error loading CSV file:', error));
	});
</script>

<div class="container">
	<h3>Players' salaries vs their performance</h3>
	<p>A look at how many players performed above or below average and how well they were paid.</p>
	<label for="season-filter">Select Season:</label>
	<select id="season-filter" />
	<div id="scatter-chart-container" />
	<p id="summary" />
</div>

<style>
	.container {
		margin: 0 auto;

		@media screen and (min-width: 850px) {
			width: 80vw;
			max-width: 900px;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}

	#scatter-chart-container {
		margin: 0 -15px;
		width: 95vw;
		height: auto;
		aspect-ratio: 800 / 500;

		@media screen and (min-width: 850px) {
			width: 100%;
		}
	}

	#summary {
		padding-top: 40px;
	}

	:global(.tooltip) {
		position: absolute;
		background: lightgray;
		padding: 5px;
		border-radius: 5px;
		display: none;
	}
</style>
