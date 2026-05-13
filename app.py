#!/usr/bin/env python3
"""
Qazlet - Simple study app using Python's built-in HTTP server
No external dependencies required!
"""

import http.server
import json
import os
from urllib.parse import urlparse

class QazletHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for Qazlet"""
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # API endpoint for loading questions
        if path == '/api/questions':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                with open('questions.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                payload = json.dumps(data['questions'], ensure_ascii=False).encode('utf-8')
                self.wfile.write(payload)
            except FileNotFoundError:
                self.wfile.write(b'[]')
            except json.JSONDecodeError:
                self.wfile.write(b'[]')
        else:
            # Serve static files
            if path == '/' or path == '':
                path = '/index.html'
            
            # Map paths to actual file locations
            if path == '/index.html':
                requested_file = './templates/index.html'
            else:
                requested_file = '.' + path
            
            # Prevent directory traversal - convert to absolute path and verify it's in current directory
            requested_file = os.path.normpath(requested_file)
            current_dir = os.path.abspath('.')
            requested_abs = os.path.abspath(requested_file)
            
            if not requested_abs.startswith(current_dir + os.sep) and requested_abs != current_dir:
                self.send_error(403)
                return
            
            # Try to find the file
            if os.path.isfile(requested_file):
                if requested_file.endswith('.html'):
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html; charset=utf-8')
                    self.end_headers()
                    with open(requested_file, 'rb') as f:
                        self.wfile.write(f.read())
                elif requested_file.endswith('.css'):
                    self.send_response(200)
                    self.send_header('Content-type', 'text/css; charset=utf-8')
                    self.end_headers()
                    with open(requested_file, 'rb') as f:
                        self.wfile.write(f.read())
                elif requested_file.endswith('.js'):
                    self.send_response(200)
                    self.send_header('Content-type', 'application/javascript; charset=utf-8')
                    self.end_headers()
                    with open(requested_file, 'rb') as f:
                        self.wfile.write(f.read())
                else:
                    super().do_GET()
            else:
                self.send_error(404)
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Customize log messages"""
        print(f"{self.address_string()} - {format % args}")

if __name__ == '__main__':
    PORT = 5000
    
    # Change to the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Create server
    server_address = ('0.0.0.0', PORT)
    httpd = http.server.HTTPServer(server_address, QazletHandler)
    
    print(f"🎓 Qazlet Server Started")
    print(f"📖 Open your browser: http://localhost:{PORT}")
    print(f"🌐 On your network: http://YOUR_IP:{PORT}")
    print(f"📁 Questions file: questions.json")
    print(f"\nPress Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        httpd.server_close()
