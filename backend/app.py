from flask import Flask, jsonify

app = Flask(__name__)

@app.get('/api/health')
def health():
    return jsonify(status='ok')

@app.get('/')
def root():
    return 'PapaPizza Backend Running'

if __name__ == '__main__':
    # For development only; use a WSGI server (gunicorn/etc.) in production
    app.run(host='0.0.0.0', port=5050, debug=True)
