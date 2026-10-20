# Source trail · checked 20 October 2026

## Article

https://www.ndtv.com/business-news/indian-economy-income-inequality-living-standard-rich-countries-world-bank-12171665

Complete main article read. Its headline is typeset accurately on slide 21, with editor and publication/update details. No screenshot is reconstructed. The rupee excerpt on slide 27 is short and exact; surrounding claims are paraphrased and attributed. The body’s distinction between threshold and group is central to the exercise. Policy discussion is treated as interpretation requiring separate evidence.

## World Bank primary data

Catalogue and variable definitions:
https://datacatalog.worldbank.org/search/dataset/0063646/poverty-and-inequality-platform-pip-percentiles

Downloaded 2021-PPP CSV:
https://datacatalogfiles.worldbank.org/ddh-published/0063646/DR0090357/world_100bin.csv

Downloaded 2017-PPP CSV (checked for an alternative vintage):
https://datacatalogfiles.worldbank.org/ddh-published/0063646/DR0090251/world_100bin.csv

Selected source records and full-precision calculations are retained as CSV and JSON under the new session’s sources directory. The full download SHA256 is recorded in the manifest. The catalogue identifies release 20260922. An unversioned URL can change; the local audit script refuses a different source hash rather than silently relabeling it as this release.

Reproduce with:

```sh
python3 docs/computational-journalism/session-11/audit_sources.py /path/to/verified/world_100bin.csv
```

Selection: national IND 2022 consumption, USA/CAN/DEU 2022 income, AUS 2020 income. It reconstructs all rounded article figures. It does not establish the reporter’s actual selection method or export. The small retained subset contains every published percentile bin for those five selected distributions, so decile calculations can also be independently checked without the full international file. World Bank catalogue license: CC BY 4.0.

## World Bank methods

Welfare construction:
https://datanalytics.worldbank.org/PIP-Methodology/welfareaggregate.html

Conversion and PPP:
https://datanalytics.worldbank.org/PIP-Methodology/convert.html

Survey acquisition and coverage:
https://datanalytics.worldbank.org/PIP-Methodology/acquiring.html

Used to verify concepts, per-capita normalisation, PPP reference versus survey year, construction differences and coverage cautions. No numerical correction for missing top incomes is asserted.

## Economic Survey check — unresolved

Official index:
https://www.indiabudget.gov.in/economicsurvey/

Full 2025–26 report:
https://www.indiabudget.gov.in/economicsurvey/doc/echapter.pdf

Downloaded and searched the extracted text for the amount, variants and relevant percentile/earnings language. The amount found in a fiscal allocation passage is unrelated to personal earnings. No matching percentile statement was located. This is a bounded search of one report, not an exhaustive disproof. Ask the reporter for the original edition, page/table and underlying statistic. Do not borrow an alternative unsupported attribution from another news article.

## Fictional examples and arithmetic

- Counts and denominator: 100 / 10,000 = 10 per 1,000; 120 / 15,000 = 8. Counts +20%, rate −20%.
- Payments: ₹10bn / 100m = ₹100; ₹9bn / 150m = ₹60.
- Training: 40→60 and 30→50; changes both +20 percentage points; contrast in changes 0. No causal identification is asserted.
- Time windows: [100,102,106,70,85,105,110,112,114], annual 2017–2025. Full period +14%; trough-to-final +62.857…%; 2019–2022 −0.943…%.
- Attrition: (60 × 75 + 40 × 20)/100 = 53. The missing-group value is explicitly hypothetical.
- Equal means: [10,10,10,10,10] and [1,1,1,1,46] each mean 10; medians 10 and 1.
- Aggregation: districts 9/10→80/100 and 36/90→3/10. Both rates fall 10 points; pooled 45/100→83/110, or 45%→75.4545…%.
- Uncertainty interval: constructed estimated difference +0.1 points with a symmetric illustrative 95% interval [−2.0,+2.2]. It is not derived from invented sample microdata, nor offered as a model for every dataset.

The seven-choice audit, claim ladder and fairness distinctions are teaching frameworks, not empirical claims about every newsroom or a claimed universal ordering of methods.
