#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ ! -d "tts_server/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv tts_server/venv
    tts_server/venv/bin/python3 -m pip install edge-tts flask flask-cors --quiet
fi

echo "🚀 Starting Local Neural TTS Server..."
exec tts_server/venv/bin/python3 tts_server/server.py
