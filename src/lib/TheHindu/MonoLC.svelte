<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	// Data from Python processing

	onMount(() => {
		const isMobile = window.innerWidth < 450;

		const data = [
			{
				Region: 'Hindi Belt',
				values: [
					{ year: 1991, value: 87.52 },
					{ year: 2001, value: 90.85 },
					{ year: 2011, value: 91.48 }
				]
			},
			{
				Region: 'Non-Hindi, South',
				values: [
					{ year: 1991, value: 81.5 },
					{ year: 2001, value: 78.5 },
					{ year: 2011, value: 78.38 }
				]
			},
			{
				Region: 'Non-Hindi, Non-South',
				values: [
					{ year: 1991, value: 79.22 },
					{ year: 2001, value: 68.22 },
					{ year: 2011, value: 66.24 }
				]
			}
		];

		const width = document.getElementById('mono').getBoundingClientRect().width,
			height = document.getElementById('mono').getBoundingClientRect().height,
			margin = { top: 50, right: isMobile ? 120 : 170, bottom: 50, left: 80 };

		const svg = d3.select('svg#mono').attr('width', width).attr('height', height);

		// X scale using discrete years
		const x = d3
			.scalePoint()
			.domain([1991, 2001, 2011])
			.range([margin.left, width - margin.right]);

		const y = d3
			.scaleLinear()
			.domain([60, 95])
			.range([height - margin.bottom, margin.top]);

		const line = d3
			.line()
			.x((d) => x(d.year))
			.y((d) => y(d.value));

		const color = d3.scaleOrdinal(['#1f77b4', '#ff7f0e', '#2ca02c']); // Different colors for each line

		// X-axis
		svg
			.append('g')
			.attr('transform', `translate(0,${height - margin.bottom})`)
			.call(d3.axisBottom(x));

		// Y-axis
		svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y));

		// Y-axis Label
		svg
			.append('text')
			.attr('transform', `rotate(-90)`)
			.attr('x', 0 - height / 2)
			.attr('y', margin.left / 2)
			.attr('dy', '0em')
			.style('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('font-weight', 'bold')
			.text('Share of population that only speaks native language');

		// Draw lines
		svg
			.selectAll('.line')
			.data(data)
			.enter()
			.append('path')
			.attr('class', 'line')
			.attr('d', (d) => line(d.values))
			.attr('stroke', (d, i) => color(i));

		// Region labels (Moved even more inside)
		svg
			.selectAll('.label')
			.data(data)
			.enter()
			.append('text')
			.attr('x', width - margin.right + 15 - (isMobile ? 55 : 0)) // Further inside to avoid cut-off
			.attr('y', (d) => y(d.values[d.values.length - 1].value + (isMobile ? 2 : 0)))
			.attr('dy', '0.35em')
			.style('fill', (d, i) => color(i))
			.style('font-size', '14px')
			.style('font-weight', 'bold')
			.text((d) => d.Region);
	});
</script>

<h2 class="chart-title">
	Change in share of people who only speak their native language in each region
</h2>
<div class="svg-container">
	<svg id="mono" />
</div>

<style>
	.svg-container {
		max-width: 100vw;
		height: auto;
		margin: 0 -25px;
	}

	svg {
		display: block;
		margin: auto;
		width: 100%;
		height: auto;
		aspect-ratio: 920 / 700;

		@media screen and (min-width: 850px) {
			aspect-ratio: 920 / 500;
			width: 920px;
			height: 500px;
		}
	}

	:global(.line) {
		fill: none;
		stroke-width: 2;
	}

	:global(.axis-label) {
		font-size: 14px;
	}

	.chart-title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 20px;
	}
</style>
