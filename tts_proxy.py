#!/usr/bin/env python3
"""车载语音助手 — 本地静态服务器（支持 Range 请求，音频可 seek）"""

import http.server
import os
import sys
import re

PORT = 8766
DESKTOP = os.path.dirname(os.path.abspath(__file__))

class RangeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DESKTOP, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.end_headers()

    def do_GET(self):
        # 处理 Range 请求（音频 seek 必需）
        range_header = self.headers.get('Range')
        if range_header:
            path = self.translate_path(self.path)
            if not os.path.isfile(path):
                self.send_error(404)
                return
            file_size = os.path.getsize(path)
            m = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if not m:
                self.send_error(416)
                return
            start = int(m.group(1))
            end = int(m.group(2)) if m.group(2) else file_size - 1
            if start >= file_size:
                self.send_error(416)
                return
            end = min(end, file_size - 1)
            content_length = end - start + 1

            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
            self.send_header("Content-Length", str(content_length))
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()

            with open(path, 'rb') as f:
                f.seek(start)
                self.wfile.write(f.read(content_length))
            return
        # 非 Range 请求走默认处理
        super().do_GET()

    def log_message(self, format, *args):
        pass

httpd = http.server.HTTPServer(("", PORT), RangeHandler)
print(f"\n  车载助手 → http://localhost:{PORT}\n", flush=True)
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    httpd.shutdown()
