# Instructor-only answer key · Session 11

This file is not served from `static/`, linked on student slides, or included in the in-browser notes. It is a preparation document, not a model student submission. Do not reveal the critique with the headline on slide 21.

## What we checked

Verification date: 20 October 2026.

- Complete NDTV article, edited by Prateek Shukla, dated 12 October 2026 at 08:45 IST. Main story, numerical passages, source attribution and subsequent expert/policy discussion were read. Do not use the automated summary as a substitute for the article.
- World Bank PIP Percentiles catalogue, release date 20260922. Downloaded both PPP vintages and inspected their schema and country-year records.
- The **2021 PPP** download reproduces all ten rounded P10/P90 amounts in the article using the five national rows below. The 2017 PPP file does not reproduce that complete table. Matching is a reconstruction, not confirmation that the reporter used this export, this version or these exact years.
- PIP methods chapters on welfare aggregates, conversion and coverage, including definitions, household-to-person conversion, survey reference years, PPP, questionnaire changes and missing populations.
- Official Economic Survey 2025–26 full report. Converted the PDF to text and searched for `80,000`, `80000`, variants, earnings and relevant top-decile terms. No matching personal-earnings percentile statement was located. The article supplies no edition, page or table. That is an unresolved source check, not proof that the claim is false or never appeared in a different source.

Source links are in `source-trail.md`. The retained data subset and full-precision manifest are under `static/computational-journalism/session-11/sources/`.

## Reconstructed source rows

2021 international dollars per person per day. P10/P90 below are `quantile`, not `avg_welfare`. Year is PIP’s welfare/reference year; it need not be the interview calendar year. All selected records are labeled national. Household welfare is put on a per-person basis; this does not identify each person’s own earnings or control over resources.

| Country | PIP year | Welfare | P10 | P90 |
|---|---:|---|---:|---:|
| India | 2022 | Consumption | 3.3990993491 | 9.9768075216 |
| United States | 2022 | Income | 25.1296269809 | 172.9883133156 |
| Canada | 2022 | Income | 31.1164391324 | 128.8946386022 |
| Germany | 2022 | Income | 28.4376191331 | 127.8585719666 |
| Australia | 2020 | Income | 28.0783807956 | 128.8908257180 |

Rounding to whole dollars yields the article’s comparison. More recent Indian and US observations are present in the file; selecting these matching records is not a recommendation for a latest-data comparison. Do not silently replace them in a reconstruction. A 2026 release is not evidence of a 2026 survey.

`quantile` is an upper boundary for a percentile bin. `avg_welfare` is the mean within that one-percentile bin. Neither the tenth bin’s average nor P10 is the average of the entire bottom decile. At percentile 100 the downloaded `quantile` field is blank; do not manufacture a finite top cutoff or treat it as a zero. The source still provides a mean for that bin.

### Independent decile-mean calculation

For bins S, compute `sum(avg_welfare * pop_share) / sum(pop_share)`. Use bins 1–10 for the bottom decile and 91–100 for the top decile. The audit script checks population shares, available cutoff monotonicity, selected records and the rounded match. It retains the full precision of published bin values. These are means reconstructed from the released percentile bins, not independent observations of every person.

| Country and selected group | Mean welfare / day | Welfare measure |
|---|---:|---|
| India upper decile | 14.0652554371 | Consumption |
| US lower decile | 15.2390757943 | Income |
| Canada lower decile | 22.2339623850 | Income |
| Germany lower decile | 17.5086111667 | Income |
| Australia lower decile | 18.7146253244 | Income |

This result is central to a fair critique. **The boundary inequality does not logically imply a group-mean inequality, but this independent calculation happens to preserve the numerical ordering in the selected source distributions.** It does not turn consumption into earnings, erase coverage differences, compare wealth stocks, or establish an ordering for every individual. Do not teach that the headline has been numerically disproved just because its supporting threshold argument is insufficient.

## 1. Verified factual and logical problems

Distinguish a verified mathematical issue from an unconfirmed attribution about the author’s workflow.

- **Thresholds do not identify group averages.** A value that marks entry to an upper decile and one marking the top of a lower decile constrain different boundaries. Ordering those boundaries leaves both tails unspecified. This is a logical result, regardless of whether the actual group means happen to be ordered in the same direction.
- **The reconstructed Indian welfare record is consumption.** It cannot be described as measured personal earnings. The other selected records use household income on a per-person basis, which also is not necessarily labour earnings. This is verified for the source rows that reproduce the comparison; the reporter’s exact export remains unconfirmed.
- **The matching records have different years.** The Australian reference year is 2020; the others are 2022. The publication and release dates are later. It would be incorrect to call these contemporaneous 2026 survey observations.
- **A descriptive cross-country comparison is not an estimated causal effect of a policy.** The distribution records alone cannot demonstrate which regulatory or business-policy package produced the gap or would close it.

Avoid calling every use of a group noun a mathematical error. A headline can be read as comparing averages, typical people, cutoffs, or entire groups. Explain which reading is unsupported by which evidence.

## 2. Potentially misleading editorial choices

- Moving from an explicitly defined distribution statistic in the body to an unqualified group comparison can leave readers thinking that the average, a typical member or every member is being compared.
- Using an earnings verb for a consumption-based record, or calling a high-consumption group the wealthiest, changes the measured construct. Wealth is a stock; income and consumption are flows.
- A common PPP unit can create an impression that all remaining methodological differences have been harmonised. They have not.
- Mixing a rupee earnings statistic into a per-person consumption comparison can look like corroboration without being one.
- An attributed expert’s policy interpretation can appear to follow mechanically from the descriptive table. Attribution should remain clear, and the proposed mechanism needs independent scrutiny. Do not label a debatable policy view a numerical error or demand an equal-length contrary quote merely for balance.

## 3. Questions requiring additional source verification

1. What exact PIP export, release, welfare type, geography and survey/welfare years did the reporter use? What is the rule for choosing a year, especially when later data exist?
2. Was the intended statistic `quantile`, a one-percentile-bin mean, or a computed decile mean? Can the reporter provide the calculation?
3. What survey-specific inclusion, nonresponse and upper-tail issues apply to these exact records? How sensitive is the comparison to a common year, alternative welfare concepts or revised harmonisation?
4. Which edition and page/table of the Economic Survey support the rupee claim? Is it a threshold or a mean? Which population is ranked? What is the period and underlying data source?
5. What independent empirical evidence supports the expert’s explanation and policy recommendations? What plausible alternatives or implementation constraints matter?

The welfare-construction handbook establishes per-capita normalisation as PIP practice. A survey-specific questionnaire, metadata file or harmonisation note is still needed to describe precisely what is included in each aggregate. “National” does not prove complete coverage of non-household residents or the richest households. Do not quantify an upper-tail correction without evidence.

## 4. Defensible interpretations

- The retained records show a substantial gap between these measured national welfare distributions on a common PPP basis, with explicitly different concepts and reference years.
- Both the selected cutoff comparison and a separate weighted-bin mean comparison can be reported if each statistic is named, calculations are disclosed and the mixed welfare measures are explained.
- The contrast can motivate consequential reporting about broad living standards, productivity and distribution. It does not force a single causal or normative policy conclusion.
- A strong rewrite can preserve the finding while narrowing the population and construct claims. Multiple headlines and ledes are defensible. There is no fixed “perfect” answer.

## 5. Claims the supplied data cannot support

- Every Indian in the upper decile earns less than every person in the lower decile of each comparator country.
- A cutoff equals the group’s average or describes a typical individual without further distributional evidence.
- The Indian consumption record measures wages, personal earnings or household wealth.
- All survey observations refer to a single current year, or PPP removes every comparability issue.
- The table estimates the effect of a government policy, proves the necessity of a particular reform, or predicts its impact.
- The unresolved rupee citation is demonstrably fabricated, disproved or correctly attributed merely because we did not locate it in the searched report.

## Facilitation and marking

Evaluate the group’s product on five dimensions: statistic and construct, comparison and scope, evidence/inference boundary, source transparency, and preserved news value. Demand two reporting questions that can actually be answered with a source or document. A 120-word draft can be clear and compelling without filling half its space with generic caveats. Avoid penalising a well-supported forceful finding for its tone.

Use the source rows to challenge both the original story and an overconfident critique of it. The lesson’s standard applies to the critic, too. If someone argues that group means must be computed, show the independent calculation and ask what that changes—and what it does not.
