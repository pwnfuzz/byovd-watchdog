#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Tool Name: BYOVDFinder Comparison Script
# Description: Compares two BYOVDFinder JSON results and generates a changelog
# Usage: python3 compare_results.py old_results.json new_results.json
#
# Author: Nikhil John Thomas (@ghostbyt3)
# License: Apache License 2.0

import argparse
import json
import sys
from datetime import datetime
from typing import Dict, List, Set

def load_json_file(file_path: str) -> Dict:
    """Load and validate JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate expected structure
        required_keys = ['summary', 'allowed_drivers', 'blocked_drivers']
        for key in required_keys:
            if key not in data:
                raise ValueError(f"Invalid JSON structure: missing '{key}' key")
        
        return data
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{file_path}': {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)

def get_driver_signature(driver: Dict) -> str:
    """Generate a unique signature for a driver based on its identifiers."""
    # Use SHA256 hash as primary identifier, fallback to other hashes
    if driver.get('sha256'):
        return f"sha256:{driver['sha256'].lower()}"
    elif driver.get('sha1'):
        return f"sha1:{driver['sha1'].lower()}"
    elif driver.get('md5'):
        return f"md5:{driver['md5'].lower()}"
    else:
        # Fallback to filename + driver_id combination
        return f"file:{driver.get('filename', 'unknown')}_{driver.get('driver_id', 'unknown')}"

def create_driver_map(drivers: List[Dict]) -> Dict[str, Dict]:
    """Create a mapping of driver signatures to driver data."""
    driver_map = {}
    for driver in drivers:
        signature = get_driver_signature(driver)
        driver_map[signature] = driver
    return driver_map

def compare_drivers(old_data: Dict, new_data: Dict) -> Dict:
    """Compare old and new driver data and identify changes."""
    
    # Create maps for both allowed and blocked drivers
    old_allowed_map = create_driver_map(old_data['allowed_drivers'])
    old_blocked_map = create_driver_map(old_data['blocked_drivers'])
    new_allowed_map = create_driver_map(new_data['allowed_drivers'])
    new_blocked_map = create_driver_map(new_data['blocked_drivers'])
    
    # Find drivers that were in old but not in new
    old_all_drivers = {**old_allowed_map, **old_blocked_map}
    new_all_drivers = {**new_allowed_map, **new_blocked_map}
    
    removed_signatures = set(old_all_drivers.keys()) - set(new_all_drivers.keys())
    added_signatures = set(new_all_drivers.keys()) - set(old_all_drivers.keys())
    
    # Categorize removed drivers
    removed_allowed = []
    removed_blocked = []
    
    for signature in removed_signatures:
        driver = old_all_drivers[signature]
        if signature in old_allowed_map:
            removed_allowed.append(driver)
        else:
            removed_blocked.append(driver)
    
    # Categorize added drivers
    added_allowed = []
    added_blocked = []
    
    for signature in added_signatures:
        driver = new_all_drivers[signature]
        if signature in new_allowed_map:
            added_allowed.append(driver)
        else:
            added_blocked.append(driver)
    
    # Check for status changes (allowed -> blocked or blocked -> allowed)
    status_changes = []
    common_signatures = set(old_all_drivers.keys()) & set(new_all_drivers.keys())
    
    for signature in common_signatures:
        old_driver = old_all_drivers[signature]
        new_driver = new_all_drivers[signature]
        
        old_was_allowed = signature in old_allowed_map
        new_is_allowed = signature in new_allowed_map
        
        if old_was_allowed != new_is_allowed:
            status_changes.append({
                'driver': new_driver,
                'old_status': 'allowed' if old_was_allowed else 'blocked',
                'new_status': 'allowed' if new_is_allowed else 'blocked'
            })
    
    return {
        'removed_allowed': removed_allowed,
        'removed_blocked': removed_blocked,
        'added_allowed': added_allowed,
        'added_blocked': added_blocked,
        'status_changes': status_changes,
        'summary': {
            'total_removed': len(removed_signatures),
            'total_added': len(added_signatures),
            'removed_allowed_count': len(removed_allowed),
            'removed_blocked_count': len(removed_blocked),
            'added_allowed_count': len(added_allowed),
            'added_blocked_count': len(added_blocked),
            'status_changes_count': len(status_changes)
        }
    }

def generate_changelog(comparison: Dict, old_file: str, new_file: str) -> Dict:
    """Generate a structured changelog from comparison results."""
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    changelog = {
        'metadata': {
            'generated_at': timestamp,
            'old_file': old_file,
            'new_file': new_file,
            'comparison_summary': comparison['summary']
        },
        'changes': {
            'removed_drivers': {
                'allowed': comparison['removed_allowed'],
                'blocked': comparison['removed_blocked']
            },
            'added_drivers': {
                'allowed': comparison['added_allowed'],
                'blocked': comparison['added_blocked']
            },
            'status_changes': comparison['status_changes']
        }
    }
    
    return changelog

def extract_date_from_filename(filename: str) -> str:
    """Extract date from filename like byovd_finder_results_20250707_013424.json"""
    try:
        # Extract the date part (YYYYMMDD)
        parts = filename.split('_')
        for part in parts:
            if len(part) == 8 and part.isdigit():
                # Convert YYYYMMDD to DD-MM-YYYY
                year = part[:4]
                month = part[4:6]
                day = part[6:8]
                return f"{day}-{month}-{year}"
    except:
        pass
    
    # Fallback to current date
    return datetime.now().strftime("%d-%m-%Y")

def format_changes_for_changelog(comparison: Dict) -> Dict:
    """Format changes for the simple changelog structure."""
    changes = {
        "removed": [],
        "added": [],
        "status_changes": []
    }
    
    # Format removed drivers
    for driver in comparison['removed_allowed'] + comparison['removed_blocked']:
        changes["removed"].append({
            "name": driver.get('filename', 'Unknown'),
            "hash": driver.get('sha256', driver.get('sha1', driver.get('md5', 'N/A'))),
            "driver_id": driver.get('driver_id', 'N/A')
        })
    
    # Format added drivers
    for driver in comparison['added_allowed'] + comparison['added_blocked']:
        changes["added"].append({
            "name": driver.get('filename', 'Unknown'),
            "hash": driver.get('sha256', driver.get('sha1', driver.get('md5', 'N/A'))),
            "driver_id": driver.get('driver_id', 'N/A')
        })
    
    # Format status changes
    for change in comparison['status_changes']:
        driver = change['driver']
        changes["status_changes"].append({
            "name": driver.get('filename', 'Unknown'),
            "hash": driver.get('sha256', driver.get('sha1', driver.get('md5', 'N/A'))),
            "driver_id": driver.get('driver_id', 'N/A'),
            "old_status": change['old_status'],
            "new_status": change['new_status']
        })
    
    return changes

def load_existing_changelog(changelog_file: str) -> Dict:
    """Load existing changelog file or create new structure."""
    try:
        with open(changelog_file, 'r', encoding='utf-8') as f:
            existing_changelog = json.load(f)
        
        # Validate structure
        if not isinstance(existing_changelog, list):
            raise ValueError("Invalid changelog structure")
        
        return existing_changelog
    except FileNotFoundError:
        # Create new changelog structure
        return []
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Warning: Could not load existing changelog ({e}). Creating new one.")
        return []

def save_changelog(comparison: Dict, old_file: str, new_file: str, output_file: str = None) -> str:
    """Save changelog to file and return filename."""
    if output_file is None:
        output_file = "byovd_changelog.json"
    
    # Extract date from new file (the latest one)
    date = extract_date_from_filename(new_file)
    
    # Format changes
    changes = format_changes_for_changelog(comparison)
    
    # Check if there are any changes
    total_changes = (len(changes["removed"]) + 
                    len(changes["added"]) + 
                    len(changes["status_changes"]))
    
    if total_changes == 0:
        print("No changes detected - skipping changelog entry.")
        return output_file
    
    # Load existing changelog
    existing_changelog = load_existing_changelog(output_file)
    
    # Create new entry
    new_entry = {
        "date": date,
        "data": changes
    }
    
    # Add to changelog
    existing_changelog.append(new_entry)
    
    # Save updated changelog
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(existing_changelog, f, indent=2, ensure_ascii=False)
    
    return output_file

def print_summary(comparison: Dict):
    """Print a human-readable summary of the comparison."""
    summary = comparison['summary']
    
    print("\n" + "="*60)
    print("BYOVDFinder Comparison Summary")
    print("="*60)
    
    # Only show removed drivers if there are any
    if summary['total_removed'] > 0:
        print(f"Total drivers removed: {summary['total_removed']}")
        if summary['removed_allowed_count'] > 0:
            print(f"  - Allowed drivers removed: {summary['removed_allowed_count']}")
        if summary['removed_blocked_count'] > 0:
            print(f"  - Blocked drivers removed: {summary['removed_blocked_count']}")
    
    # Only show added drivers if there are any
    if summary['total_added'] > 0:
        print(f"\nTotal drivers added: {summary['total_added']}")
        if summary['added_allowed_count'] > 0:
            print(f"  - Allowed drivers added: {summary['added_allowed_count']}")
        if summary['added_blocked_count'] > 0:
            print(f"  - Blocked drivers added: {summary['added_blocked_count']}")
    
    # Only show status changes if there are any
    if summary['status_changes_count'] > 0:
        print(f"\nStatus changes: {summary['status_changes_count']}")
    
    # Show removed allowed drivers if any
    if summary['total_removed'] > 0 and summary['removed_allowed_count'] > 0:
        print(f"\nRemoved allowed drivers:")
        for driver in comparison['removed_allowed']:
            print(f"  - {driver.get('filename', 'Unknown')} ({driver.get('driver_id', 'N/A')})")
    
    # Show status changes if any
    if summary['status_changes_count'] > 0:
        print(f"\nStatus changes:")
        for change in comparison['status_changes']:
            driver = change['driver']
            print(f"  - {driver.get('filename', 'Unknown')}: {change['old_status']} → {change['new_status']}")
    
    # If no changes at all, show a message
    if (summary['total_removed'] == 0 and 
        summary['total_added'] == 0 and 
        summary['status_changes_count'] == 0):
        print("No changes detected between the two result files.")

def display_changelog_history(changelog_file: str = "byovd_changelog.json"):
    """Display changelog history in a format suitable for website display."""
    try:
        with open(changelog_file, 'r', encoding='utf-8') as f:
            changelog = json.load(f)
        
        if not changelog:
            print("No changelog history found.")
            return
        
        print("\n" + "="*80)
        print("BYOVDFinder Changelog History")
        print("="*80)
        
        # Sort by date (newest first)
        changelog.sort(key=lambda x: x['date'], reverse=True)
        
        for entry in changelog:
            print(f"\nChangeLog {entry['date']}:")
            
            data = entry['data']
            
            # Show removed drivers
            if data.get('removed'):
                print(f"  - Drivers removed: {len(data['removed'])}")
                for driver in data['removed']:
                    print(f"    - {driver['name']} ({driver['hash'][:16]}...)")
            
            # Show added drivers
            if data.get('added'):
                print(f"  - Drivers added: {len(data['added'])}")
                for driver in data['added']:
                    print(f"    - {driver['name']} ({driver['hash'][:16]}...)")
            
            # Show status changes
            if data.get('status_changes'):
                print(f"  - Status changes: {len(data['status_changes'])}")
                for change in data['status_changes']:
                    print(f"    - {change['name']}: {change['old_status']} → {change['new_status']}")
        
        print(f"\nTotal entries: {len(changelog)}")
        
    except FileNotFoundError:
        print(f"Changelog file '{changelog_file}' not found.")
    except Exception as e:
        print(f"Error reading changelog: {e}")

def main():
    parser = argparse.ArgumentParser(description="Compare two BYOVDFinder JSON results and generate a changelog.")
    parser.add_argument("old_file", nargs='?', help="Path to the older JSON results file.")
    parser.add_argument("new_file", nargs='?', help="Path to the newer JSON results file.")
    parser.add_argument("-o", "--output", help="Output filename for changelog (default: byovd_changelog.json).")
    parser.add_argument("--summary-only", action="store_true", help="Only print summary, don't save changelog.")
    parser.add_argument("--show-history", action="store_true", help="Display existing changelog history.")
    
    args = parser.parse_args()
    
    if args.show_history:
        display_changelog_history(args.output or "byovd_changelog.json")
        return
    
    # Check if both files are provided when not showing history
    if not args.old_file or not args.new_file:
        parser.error("Both old_file and new_file are required when not using --show-history")
    
    print("Loading old results...")
    old_data = load_json_file(args.old_file)
    
    print("Loading new results...")
    new_data = load_json_file(args.new_file)
    
    print("Comparing results...")
    comparison = compare_drivers(old_data, new_data)
    
    # Print summary
    print_summary(comparison)
    
    if not args.summary_only:
        # Save changelog directly from comparison data
        output_file = save_changelog(comparison, args.old_file, args.new_file, args.output)
        print(f"\nChangelog updated: {output_file}")

if __name__ == "__main__":
    main() 