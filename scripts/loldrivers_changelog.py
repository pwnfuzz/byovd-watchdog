#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to detect new drivers added to loldrivers.io and update the changelog.
"""
import os
import json
import requests
from datetime import datetime

LOLDIVERS_URL = "https://www.loldrivers.io/api/drivers.json"
PREVIOUS_PATH = os.path.join("data", "jsons", "loldrivers_previous.json")
CHANGELOG_PATH = os.path.join("data", "jsons", "byovd_changelog.json")


def fetch_loldrivers():
    resp = requests.get(LOLDIVERS_URL)
    resp.raise_for_status()
    return resp.json()


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_driver_key(driver):
    # Use Id if present, else SHA256
    if "Id" in driver:
        return driver["Id"]
    # fallback: try to get a unique hash
    for h in ["SHA256", "sha256", "SHA1", "sha1", "MD5", "md5"]:
        if h in driver and driver[h]:
            return driver[h]
    return None


def main():
    latest = fetch_loldrivers()
    previous = load_json(PREVIOUS_PATH)
    if previous is None:
        print("No previous loldrivers file found. Saving current as baseline.")
        save_json(PREVIOUS_PATH, latest)
        return

    prev_keys = set(get_driver_key(d) for d in previous if get_driver_key(d))
    new_drivers = [d for d in latest if get_driver_key(d) not in prev_keys]

    if not new_drivers:
        print("No new drivers found.")
        save_json(PREVIOUS_PATH, latest)
        return

    # Prepare changelog entry
    today = datetime.now().strftime("%d-%m-%Y")
    changelog = load_json(CHANGELOG_PATH) or []
    entry = {
        "date": today,
        "data": {
            "added": [],
            "removed": [],
            "status_changes": []
        }
    }
    for driver in new_drivers:
        # Try to get a name
        name = None
        if "Tags" in driver and driver["Tags"]:
            name = driver["Tags"][0]
        elif "Filename" in driver and driver["Filename"]:
            name = driver["Filename"]
        else:
            name = get_driver_key(driver)
        # Try to get a hash
        hashval = (
            driver.get("SHA256") or driver.get("sha256") or
            driver.get("SHA1") or driver.get("sha1") or
            driver.get("MD5") or driver.get("md5")
        )
        if not hashval and "KnownVulnerableSamples" in driver and driver["KnownVulnerableSamples"]:
            sample = driver["KnownVulnerableSamples"][0]
            hashval = (
                sample.get("SHA256") or sample.get("sha256") or
                sample.get("SHA1") or sample.get("sha1") or
                sample.get("MD5") or sample.get("md5")
            )
        entry["data"]["added"].append({
            "name": name,
            "hash": hashval,
            "driver_id": driver.get("Id"),
            "source": "loldrivers"
        })
    # Only add if there are new drivers
    if entry["data"]["added"]:
        changelog.append(entry)
        save_json(CHANGELOG_PATH, changelog)
        print(f"Added {len(entry['data']['added'])} new drivers to changelog.")
    else:
        print("No new drivers to add to changelog.")
    # Update the previous file
    save_json(PREVIOUS_PATH, latest)

if __name__ == "__main__":
    main()