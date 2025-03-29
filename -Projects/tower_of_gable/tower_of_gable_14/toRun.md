
To run a local HTTP server with Python that supports Cross-Origin Resource Sharing (CORS):

1. Open terminal/command prompt in your project directory
2. Run one of these commands:

## Python 3
```bash
python -m http.server 8000
```

## Python 2
```bash
python -m SimpleHTTPServer 8000
```

Visit `http://localhost:8000` in your browser.

**Note:** For proper CORS support, you may need to use a CORS-enabled server or add CORS headers. Consider using Node.js's `http-server` package or Python's `cors-anywhere` for better CORS handling.