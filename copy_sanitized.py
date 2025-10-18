#!/usr/bin/env python3
import os, shutil, sys

# DRY RUN by default; pass --apply to actually copy
APPLY = ("--apply" in sys.argv)

ROOT = os.getcwd()
SKIP_DIRS = {".git", ".github", "__pycache__", "node_modules"}

def sanitize(name: str) -> str:
    # only change case + spaces -> hyphens; keep other chars intact
    return name.lower().replace(" ", "-")

def main():
    collisions = 0
    actions = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # skip certain dirs
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".DS_")]
        for fname in filenames:
            if fname == ".DS_Store": 
                continue
            src = os.path.join(dirpath, fname)
            # leave directory names as-is; only sanitize the FILE name
            new_fname = sanitize(fname)
            if new_fname == fname:
                continue  # already compliant
            dst = os.path.join(dirpath, new_fname)

            if os.path.exists(dst):
                print(f"[SKIP] Would create '{dst}', but it already exists (collision).")
                collisions += 1
                continue

            rel_src = os.path.relpath(src, ROOT)
            rel_dst = os.path.relpath(dst, ROOT)
            if APPLY:
                shutil.copy2(src, dst)
                print(f"[COPIED] {rel_src} -> {rel_dst}")
            else:
                print(f"[DRY-RUN] Would copy {rel_src} -> {rel_dst}")
            actions += 1

    print(f"\nDone. {'Copied' if APPLY else 'Planned'} {actions} file(s). Collisions: {collisions}.")
    if not APPLY:
        print("Run again with --apply to perform copies.")

if __name__ == "__main__":
    main()
