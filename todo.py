#!/usr/bin/env python3
# File: todo.py
# -------------
# Implements a web application that helps one
# manage a to-do list.  This is a generic
# entry point that listens for HTTP traffic on
# port 8001.  All requests for documents relative
# to http://localhost:8001 are served up directly
# as static files, *unless* the requested file
# is in a scripts subdirectory 

from http.server import HTTPServer, CGIHTTPRequestHandler

def runServer(port):
    CGIHTTPRequestHandler.cgi_directories = ['/scripts']
    server = HTTPServer(("", port), CGIHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down server.")

DEFAULT_PORT = 8001
runServer(DEFAULT_PORT)
