#!/usr/bin/env python3
import json
import sqlite3
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path('/Users/areena.arora/dev/tidbits_tracker/backend/data/tidbits.db')
OUT_PATH = Path('/Users/areena.arora/dev/areenaarora_com/src/lib/data/tidbits_snapshot.json')


def norm(v: str | None, fallback: str = 'Unknown') -> str:
    if v is None:
        return fallback
    s = str(v).strip()
    return s if s else fallback


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    rows = conn.execute(
        """
        SELECT
          id,
          created_at,
          text,
          url,
          COALESCE(NULLIF(TRIM(geography_final), ''), NULLIF(TRIM(geography_pred), '')) AS geography,
          COALESCE(NULLIF(TRIM(category_final), ''), NULLIF(TRIM(category_pred), '')) AS category,
          COALESCE(NULLIF(TRIM(sector_final), ''), NULLIF(TRIM(sector_pred), '')) AS sector,
          COALESCE(NULLIF(TRIM(theme_final), ''), NULLIF(TRIM(theme_pred), '')) AS theme
        FROM signals
        ORDER BY datetime(created_at) DESC, id DESC
        """
    ).fetchall()

    signals = []
    geo = Counter()
    cat = Counter()
    sec = Counter()
    thm = Counter()

    for r in rows:
        g = norm(r['geography'])
        c = norm(r['category'])
        s = norm(r['sector'])
        t = norm(r['theme'])

        geo[g] += 1
        cat[c] += 1
        sec[s] += 1
        thm[t] += 1

        signals.append(
            {
                'id': int(r['id']),
                'created_at': r['created_at'],
                'text': r['text'] or '',
                'url': r['url'],
                'geography': g,
                'category': c,
                'sector': s,
                'theme': t,
            }
        )

    last_signal_at = signals[0]['created_at'] if signals else None

    payload = {
        'lastUpdated': datetime.now(timezone.utc).isoformat(),
        'sourceLastSignalAt': last_signal_at,
        'totalSignals': len(signals),
        'topGeographies': [{'label': k, 'count': v} for k, v in geo.most_common(12)],
        'topCategories': [{'label': k, 'count': v} for k, v in cat.most_common(12)],
        'topSectors': [{'label': k, 'count': v} for k, v in sec.most_common(12)],
        'topThemes': [{'label': k, 'count': v} for k, v in thm.most_common(12)],
        'signals': signals,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(f'Wrote {OUT_PATH}')
    print(f'Total signals: {len(signals)}')


if __name__ == '__main__':
    main()
