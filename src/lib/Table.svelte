<script>
	let tableData = [
		{
			'Book Name': 'The Journal of Francis Buchanan',
			Period: '1815',
			Mood: 'Angry',
			'Read it if': 'You care about Indian history and British colonization'
		},
		{
			'Book Name': 'A second book',
			Period: '19xx',
			Mood: 'xyz',
			'Read it if': 'xyz'
		}
	];
</script>

<table>
	<thead>
		<tr>
			{#each Object.keys(tableData[0]) as columnHeading}
				<th>{columnHeading}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Object.values(tableData) as row}
			<tr>
				{#each Object.values(row) as cell}
					<td>{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table,
	th,
	td {
		border: 1px solid;
		border-collapse: collapse;
		margin: 30px;
		padding: 10px 10px;
	}
</style>
