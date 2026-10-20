"""Reproduce the lesson's PIP comparison from the World Bank's public 2021-PPP CSV.
Usage: python3 audit_sources.py /path/to/world_100bin.csv
No third-party packages. Source URL and SHA256 are recorded in the output manifest.
"""
import csv, hashlib, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'static/computational-journalism/session-11/sources'
PICK = {'IND': '2022', 'USA': '2022', 'CAN': '2022', 'DEU': '2022', 'AUS': '2020'}
EXPECTED = {'IND': [3,10], 'USA': [25,173], 'CAN': [31,129], 'DEU': [28,128], 'AUS': [28,129]}
SOURCE='https://datacatalogfiles.worldbank.org/ddh-published/0063646/DR0090357/world_100bin.csv'
EXPECTED_SHA256='6d35e14b8cbbb3effe53d52127d874d593eb0960810841368a9f6e83ce3943d1'
def audit(source):
    assert hashlib.sha256(source.read_bytes()).hexdigest()==EXPECTED_SHA256, 'Source file differs from the verified 20 October 2026 download; inspect the version before regenerating.'
    with source.open(newline='') as f:
        reader=csv.DictReader(f)
        fields=reader.fieldnames
        rows=[r for r in reader if r['country_code'] in PICK and r['year']==PICK[r['country_code']] and r['reporting_level']=='national']
    assert len(rows)==500
    result=[]
    for code,year in PICK.items():
        r=sorted([r for r in rows if r['country_code']==code],key=lambda r:int(r['percentile']))
        assert len(r)==100 and abs(sum(float(x['pop_share']) for x in r)-1)<1e-8
        cutoffs=[float(x['quantile']) for x in r if x['quantile']]
        assert all(a<=b for a,b in zip(cutoffs,cutoffs[1:]))
        q10=float(r[9]['quantile']);q90=float(r[89]['quantile'])
        assert [round(q10),round(q90)]==EXPECTED[code]
        def mean(items):
            return sum(float(x['avg_welfare'])*float(x['pop_share']) for x in items)/sum(float(x['pop_share']) for x in items)
        result.append(dict(country_code=code,year=int(year),reporting_level='national',welfare_type=r[0]['welfare_type'],ppp_reference_year=2021,p10=q10,p90=q90,bin10_mean=float(r[9]['avg_welfare']),bin90_mean=float(r[89]['avg_welfare']),bottom_decile_mean=mean(r[:10]),top_decile_mean=mean(r[90:])))
    OUT.mkdir(parents=True,exist_ok=True)
    with (OUT/'pip-national-percentiles.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)
    manifest=dict(retrieved='2026-10-20',catalogue_version_date='20260922',ppp_reference_year=2021,source=SOURCE,source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),selection=PICK,units='2021 international dollars per person per day',status='Selected rows reproduce the rounded article figures; author export and original selection not confirmed.',decile_mean_method='Sum(avg_welfare * pop_share) / Sum(pop_share) across percentiles 1–10 or 91–100. A one-percentile bin mean is not a decile mean.',rows=result)
    (OUT/'verification.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(result,indent=2))
if __name__=='__main__':audit(Path(sys.argv[1]))
