# Source data for Session 11

World Bank, Poverty and Inequality Platform: Percentiles, catalogue release 20260922, 2021 PPP edition. Accessed 20 October 2026. CC BY 4.0.

Catalogue: https://datacatalog.worldbank.org/search/dataset/0063646/poverty-and-inequality-platform-pip-percentiles

Original CSV: https://datacatalogfiles.worldbank.org/ddh-published/0063646/DR0090357/world_100bin.csv

`pip-national-percentiles.csv` retains all 100 percentile-bin records for each of five selected national distributions. `verification.json` records selection, exact source-file hash, units, full-precision cutoffs and separately calculated decile means. The selected rows reproduce the rounded comparison in the NDTV article; the reporter's exact export remains unconfirmed. They are not a latest-observation comparison.

`quantile` is the upper percentile-bin boundary. `avg_welfare` is the mean within a one-percentile bin. To calculate a decile mean, use the population-weighted average of bins 1–10 or 91–100. The percentile-100 cutoff is blank in the source; do not turn it into zero. Means use the reported bin averages and shares.

India uses consumption; the comparator rows use income. All amounts are daily, per person, at 2021 purchasing-power parity. Years and welfare types must accompany any published comparison. Thresholds do not establish group averages or an ordering for every individual. The classroom deck's other numerical examples are explicitly illustrative.
