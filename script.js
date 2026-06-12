# pipeline/session_store.py

import json
import base64


def _normalize_routine(routine):
    """
    Ensures the routine is ALWAYS a flat list of:
    { "name": str, "duration": int }
    """
    if not routine:
        return []

    normalized = []

    # Case 1: routine is a dict with blocks
    if isinstance(routine, dict) and "blocks" in routine:
        routine = routine["blocks"]

    # Case 2: routine is a dict with routine
    if isinstance(routine, dict) and "routine" in routine:
        routine = routine["routine"]

    # Case 3: routine is a single dict
    if isinstance(routine, dict):
        routine = [routine]

    # Case 4: iterate and normalize
    for item in routine:
        if not isinstance(item, dict):
            continue

        name = item.get("name") or item.get("exercise") or "Exercise"
        duration = item.get("duration") or item.get("seconds") or 30

        try:
            duration = int(duration)
        except:
            duration = 30

        normalized.append({
            "name": name,
            "duration": duration
        })

    return normalized


def create_session(routine, spotify_uri):
    """
    Creates a BASE64-encoded session payload for the WebApp.
    Returns a URL-safe string to embed in ?data=
    """

    normalized = _normalize_routine(routine)

    payload = {
        "routine": normalized,
        "music": {"spotify_uri": spotify_uri},
    }

    json_bytes = json.dumps(payload).encode("utf-8")
    encoded = base64.urlsafe_b64encode(json_bytes).decode("utf-8")

    return encoded
