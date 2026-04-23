#!/usr/bin/env python3
"""
Download and refresh threat intelligence feeds.
Run daily via cron: 0 2 * * * python scripts/update_feeds.py
"""
import urllib.request
import os

FEEDS = {
    "phishtank": "http://data.phishtank.com/data/online-valid.csv",
    "urlhaus": "https://urlhaus.abuse.ch/downloads/csv_recent/",
}

OUT_DIR = os.path.join(os.path.dirname(__file__), "../data/threat_feeds")


def download(name: str, url: str):
    dest = os.path.join(OUT_DIR, f"{name}.csv")
    print(f"Downloading {name}...")
    urllib.request.urlretrieve(url, dest)
    print(f"  -> {dest}")


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, url in FEEDS.items():
        try:
            download(name, url)
        except Exception as e:
            print(f"  FAILED {name}: {e}")
