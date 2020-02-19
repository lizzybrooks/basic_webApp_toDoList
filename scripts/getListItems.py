#!/usr/bin/env python3

# Unfortunate code that needs to reside at the front of these scripts if we're
# to unify helpers functions to their own files without allowing them to be
# server endpoints.

import os, sys
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../lib")

# File: fetchListItems.py
# -----------------------
# Loads all active to-do list items, packages them in 
# some well-documented JSON, and then replies with it.

import json
from todoutils import extractItems
from httputils import publishPayloadAsJSON

def handleRequest():
    info = extractItems("items.json")
    publishPayloadAsJSON(info["items"])

handleRequest()