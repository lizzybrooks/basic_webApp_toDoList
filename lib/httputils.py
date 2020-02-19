# File: httputlis.py
# ------------------
# Defines a small set of Python convenience functions to
# extract isolated parameters from query strings,
# pull out the payload of POST requests, and publish
# the trailing end of an HTTP response whose structure
# generally depends on what the server endpoint computed
# and needs to send back to the client.

import cgi, os, sys, json

def extractRequestParam(param):
    """
    Returns the value attached to the key within the query string
    of the request URL.  If, for instance, the query string is
    a=123&b=hello, then extractRequestParam("a") would return "123",
    extractRequestParam("b") would return "hello", and extractRequestParam("c")
    would return None
    """
    params = cgi.FieldStorage()
    if param not in params: return None
    return params[param].value

def extractPayload():
    """
    Returns the payload of a POST request, or the "" if
    the request isn't actually a POST
    """    
    if os.environ["REQUEST_METHOD"] != "POST": return ""
    length = int(os.environ["CONTENT_LENGTH"])
    payload = sys.stdin.read(length)
    return payload
    
def publishPayloadAsJSON(response):
    """
    Publishes the headers needed to respond with JSON, and then
    sends the supplied response (as JSON) as the HTTP Response payload.
    """
    responsePayload = json.dumps(response)
    print("Content-Length: " + str(len(responsePayload)))
    print("Content-Type: application/json")
    print()
    print(responsePayload)
