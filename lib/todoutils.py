#!/usr/bin/env python3
# File: todoutils.py
# ------------------
# Defines a small set of utility functions specific
# to the to-do list application.

import json
from os import path

def ensureFileExists(name):
    """
    Ensures that the named file exists, and if not, creates it
    to store and empty list of items.
    """
    if path.exists(name): return
    initialData = {}
    initialData["id"] = 1
    initialData["items"] = {}
    with open(name, "w") as outfile:
        outfile.write(json.dumps(initialData))

def extractItems(name):
    """
    Lifts the data out of the named file and returns it
    as a JSON.  If the file doesn't exist at the time
    of the call, then it's created and populated with
    an empty list of items and a start id of 1.
    """
    ensureFileExists(name)
    with open(name) as infile:
        return json.loads(infile.read())

def saveAllItems(name, storedItems):
    """
    Accepts the provided JSON and writes it out to the
    named file, overwriting whatever was there prior.
    If the file doesn't exist at the time
    of the call, then it's created and populated with
    an empty list of items and a start id of 1.
    """
    ensureFileExists(name)       
    with open(name, "w") as outfile:
        outfile.write(json.dumps(storedItems, indent=3)) 
