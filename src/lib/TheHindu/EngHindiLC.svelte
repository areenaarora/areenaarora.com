<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	// Data from Python processing

	onMount(() => {
		const width = 350,
			height = 250;
		const margin = { top: 40, right: 40, bottom: 60, left: 80 }; // Adjusted left margin for y-axis label

		const data = [
			{
				region: 'Non-Hindi South',
				values: [
					{ year: 1991, english: 15, hindi: 5 },
					{ year: 2001, english: 16, hindi: 6 },
					{ year: 2011, english: 15.5, hindi: 7 }
				]
			},
			{
				region: 'Non-Hindi, Non-South',
				values: [
					{ year: 1991, english: 13.5, hindi: 7 },
					{ year: 2001, english: 18.2, hindi: 9 },
					{ year: 2011, english: 16.8, hindi: 11 }
				]
			},
			{
				region: 'Hindi Belt',
				values: [
					{ year: 1991, english: 11.5, hindi: 80 },
					{ year: 2001, english: 8, hindi: 82 },
					{ year: 2011, english: 7, hindi: 85 }
				]
			}
		];

		const chartContainer = d3.select('#chart-container');

		data.forEach((regionData) => {
			const svg = chartContainer
				.append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
				.append('g')
				.attr('transform', `translate(${margin.left},${margin.top})`);

			const x = d3.scaleLinear().domain([1991, 2011]).range([0, width]);

			const y = d3.scaleLinear().domain([0, 80]).range([height, 0]);

			svg
				.append('g')
				.attr('transform', `translate(0,${height})`)
				.call(d3.axisBottom(x).tickValues([1991, 2001, 2011]).tickFormat(d3.format('d')));

			svg.append('g').call(d3.axisLeft(y));

			svg
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('y', -margin.left + 15)
				.attr('x', -height / 2)
				.attr('dy', '1em')
				.style('text-anchor', 'middle')
				.style('font-size', '12px')
				.text('Share of population that speaks English and Hindi');

			const line = d3
				.line()
				.x((d) => x(d.year))
				.y((d) => y(d.english));

			svg
				.append('path')
				.datum(regionData.values)
				.attr('fill', 'none')
				.attr('stroke', '#1f77b4')
				.attr('stroke-width', 2)
				.attr('d', line);

			const line2 = d3
				.line()
				.x((d) => x(d.year))
				.y((d) => y(d.hindi));

			svg
				.append('path')
				.datum(regionData.values)
				.attr('fill', 'none')
				.attr('stroke', '#ff7f0e')
				.attr('stroke-width', 2)
				.attr('d', line2);

			svg
				.append('text')
				.attr('x', width / 2)
				.attr('y', -20)
				.attr('text-anchor', 'middle')
				.style('font-size', '14px')
				.text(regionData.region);

			regionData.values.forEach((d) => {
				if (d.year === 1991 || d.year === 2011) {
					['english', 'hindi'].forEach((lang) => {
						svg
							.append('circle')
							.attr('cx', x(d.year))
							.attr('cy', y(d[lang]))
							.attr('r', 4)
							.attr('fill', lang === 'english' ? '#1f77b4' : '#ff7f0e');

						svg
							.append('text')
							.attr('x', x(d.year) + 10)
							.attr('y', y(d[lang]) - 5)
							.attr('font-size', '12px')
							.attr('fill', 'black')
							.text(`${d[lang]}%`);
					});
				}
			});
		});
	});
</script>

<div class="title">Change in English and Hindi Speakers by Region (1991-2011)</div>
<div id="chart-container"></div>
<div class="legend">
	<div>
		<div class="legend-box" style="background-color: #1f77b4;"></div>
		English
	</div>
	<div>
		<div class="legend-box" style="background-color: #ff7f0e;"></div>
		Hindi
	</div>
</div>

<style>
	/* body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		margin: 0;
		background-color: #f9f9f9;
	} */

	#chart-container {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin-top: 20px;
	}

	.title {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.legend {
		display: flex;
		gap: 10px;
		margin-top: 10px;
		font-size: 14px;
	}

	.legend div {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.legend-box {
		width: 15px;
		height: 15px;
	}
</style>
