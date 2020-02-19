#!/usr/bin/env python3

# Unfortunate code that needs to reside at the front of these scripts if we're
# to unify helpers functions to their own files without allowing them to be
# server endpoints.

import os, sys
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../lib")

# File: addListItem.py
# --------------------
# Adds a new list item to the data store.  We
# assume the request METHOD is POST.  The
# payload is expected to be structured as
# a JSON string, and response is a JSON string
# that looks like this:
#
# {
#    id: 25,
#    item: "Buy groceries"
# }
#

from httputils import extractPayload, publishPayloadAsJSON
from todoutils import extractItems, saveAllItems
import json
        
def handleRequest():
    requestPayload = json.loads(extractPayload())
    info = extractItems("items.json")
    id = info["id"]
    newItem = {"id": id, "item": requestPayload }
    info["id"] += 1
    info["items"][id] = requestPayload
    saveAllItems("items.json", info)
    publishPayloadAsJSON(newItem)
        
handleRequest()