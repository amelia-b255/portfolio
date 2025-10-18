#!/usr/bin/env python3
import os, sys

ROOT = os.getcwd()
SKIP_DIRS = {".git", ".github", "__pycache__", "node_modules"}

DRY_RUN = ("--apply" not in sys.argv)

def sanitize(name: str) -> str:
    return name.lower().replace(" ", "-")

def rename_case_sensitive(src, dst):
    """
    Forces a rename even on case-insensitive filesystems (macOS default).
    """
    temp = src + ".tmp_rename_marker"
    os.rename(src, temp)
    os.rename(temp, dst)

def main():
    changes = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if fname == ".DS_Store":
                continue
            src = os.path.join(dirpath, fname)
            dst = os.path.join(dirpath, sanitize(fname))
            if src == dst:
                continue
            if os.path.exists(dst):
                print(f"[SKIP] Target exists: {dst}")
                continue
            rel_src = os.path.relpath(src, ROOT)
            rel_dst = os.path.relpath(dst, ROOT)
            if DRY_RUN:
                print(f"[DRY] Would rename {rel_src} → {rel_dst}")
            else:
                rename_case_sensitive(src, dst)
                print(f"[RENAMED] {rel_src} → {rel_dst}")
            changes += 1
    print(f"\n{changes} file(s) {'would be' if DRY_RUN else 'were'} renamed.")
    if DRY_RUN:
        print("Run again with --apply to perform changes.")

if __name__ == "__main__":
    main()
