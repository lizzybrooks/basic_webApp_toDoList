#!/usr/bin/env python3

# Unfortunate code that needs to reside at the front of these scripts if we're
# to unify helpers functions to their own files without allowing them to be
# server endpoints.  You can pretend this isn't here.
import os, sys
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../lib")

# File: removeListItems.py
# ------------------------
# Handles a POST request designed to delete any record
# of the list items whose IDs are supplied in the
# request payload, which is structured as an JSON array of
# item IDs, as with:
# 
#   ["44", "94", "106"]
#
# This endpoint is tapped by both the clear button *and* the
# double click, since one just POSTs a request to delete
# all of them, and the second posts a request to delete all
# of them.

from httputils import extractPayload, publishPayloadAsJSON
from todoutils import extractItems, saveAllItems
import json
        
def handleRequest():
    itemsToDelete = json.loads(extractPayload())
    info = extractItems("items.json")
    results = {};
    for itemID in itemsToDelete:
        results[itemID] = itemID in info["items"]
        if results[itemID]:
            del info["items"][itemID]
    saveAllItems("items.json", info)
    publishPayloadAsJSON(results)          
        
handleRequest()