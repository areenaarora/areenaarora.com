<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	onMount(() => {
		d3.csv('merged_sal.csv').then((data) => {
			const columns = Object.keys(data[0]);
			const tableHeader = d3.select('#table-header');
			const tableBody = d3.select('#table-body');
			const searchInput = d3.select('#search');
			const prevPageBtn = d3.select('#prev-page');
			const nextPageBtn = d3.select('#next-page');
			const pageInfo = d3.select('#page-info');

			let currentPage = 1;
			const rowsPerPage = 30;
			let filteredData = data;

			function renderTable(page) {
				tableBody.html('');
				let start = (page - 1) * rowsPerPage;
				let end = start + rowsPerPage;
				let paginatedData = filteredData.slice(start, end);

				paginatedData.forEach((row) => {
					const tr = tableBody.append('tr');
					columns.forEach((col) => {
						if (col === 'Salary') {
							const parsed_salary = Number(row[col]);
							const formatted_salary = new Intl.NumberFormat('en-IN').format(parsed_salary);

							tr.append('td').text('₹' + formatted_salary);
						} else {
							tr.append('td').text(row[col]);
						}
					});
				});

				pageInfo.text(`Page ${page} of ${Math.ceil(filteredData.length / rowsPerPage)}`);
				prevPageBtn.attr('disabled', page === 1 ? true : null);
				nextPageBtn.attr('disabled', end >= filteredData.length ? true : null);
			}

			nextPageBtn.on('click', () => {
				if (currentPage * rowsPerPage < filteredData.length) {
					currentPage++;
					renderTable(currentPage);
				}
			});

			prevPageBtn.on('click', () => {
				if (currentPage > 1) {
					currentPage--;
					renderTable(currentPage);
				}
			});

			searchInput.on('input', function () {
				const keyword = this.value.toLowerCase();
				filteredData = data.filter((row) =>
					columns.some((col) => row[col].toLowerCase().includes(keyword))
				);
				currentPage = 1;
				renderTable(currentPage);
			});

			columns.forEach((col) => {
				const th = tableHeader.append('th').style('position', 'relative');
				const headerSpan = th.append('span').style('cursor', 'pointer');
				headerSpan.text(col);
				headerSpan.append('span').attr('class', 'dropdown-indicator').text(' ▼');

				headerSpan.on('click', function (event) {
					d3.selectAll('.dropdown').style('display', 'none');
					const currentDisplay = dropdown.style('display');
					dropdown.style('display', currentDisplay === 'block' ? 'none' : 'block');
					event.stopPropagation();
				});

				const dropdown = th.append('div').attr('class', 'dropdown');
				const uniqueValues = [...new Set(data.map((d) => d[col]))].sort();

				uniqueValues.forEach((value) => {
					dropdown
						.append('div')
						.text(value)
						.on('click', function () {
							filteredData = data.filter((d) => d[col] === value);
							currentPage = 1;
							renderTable(currentPage);
							dropdown.style('display', 'none');
						});
				});
			});

			document.addEventListener('click', function () {
				d3.selectAll('.dropdown').style('display', 'none');
			});

			renderTable(currentPage);
		});
	});
</script>

<div class="container">
	<h3 class="title">See for yourself</h3>
	<p>Want to know more? Use this searchable database of IPL players' scores and salaries.</p>
	<input type="text" id="search" placeholder="Search..." />
	<div class="table-container">
		<table>
			<thead>
				<tr id="table-header" />
			</thead>
			<tbody id="table-body" />
		</table>
	</div>
	<div class="pagination">
		<button id="prev-page" disabled>Previous Page</button>
		<span id="page-info" />
		<button id="next-page">Next Page</button>
	</div>
</div>

<style>
	.container {
		margin: 0 auto;

		@media screen and (min-width: 850px) {
			width: 80vw;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}

	.title {
		font-size: 24px;
		@media screen and (min-width: 850px) {
			font-size: 36px;
		}
	}

	.table-container {
		@media screen and (max-width: 850px) {
			overflow-x: scroll;
		}
	}

	table {
		width: max-content;
		border-collapse: collapse;
	}

	:global(th),
	:global(td) {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: left;
	}

	:global(th) {
		background-color: #f4f4f4;
		cursor: pointer;
		position: relative;
	}

	:global(#table-header > th > span) {
		display: flex;
		align-items: center;
	}

	input {
		margin-bottom: 10px;
		padding: 5px;
		width: 60%;
	}

	:global(.dropdown) {
		position: absolute;
		background: white;
		border: 1px solid #ddd;
		display: none;
		z-index: 10;
		max-height: 200px;
		overflow-y: auto;
		width: max-content;
	}

	:global(.dropdown div) {
		padding: 5px;
		cursor: pointer;
	}

	:global(.dropdown div:hover) {
		background: #f0f0f0;
	}

	:global(.dropdown-indicator) {
		margin-left: 5px;
		font-size: 12px;
		color: gray;
	}

	.pagination {
		margin-top: 10px;
		text-align: center;
	}

	.pagination button {
		padding: 5px 10px;
		margin: 5px;
		cursor: pointer;
	}
</style>
