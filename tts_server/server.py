#!/usr/bin/env python3
"""
Amazing Desktop Mac - Local High-Fidelity Neural TTS Server
Provides fast, local, natural Southern Vietnamese Female & Male Voice synthesis endpoints.
"""

import os
import io
import asyncio
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import edge_tts

app = Flask(__name__)
CORS(app)

# Default Southern Vietnamese Female Neural Voice
DEFAULT_VOICE = "vi-VN-HoaiMyNeural"

async def generate_speech_bytes(text, voice):
    communicate = edge_tts.Communicate(text, voice)
    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])
    audio_buffer.seek(0)
    return audio_buffer

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "AmazingDesktop Local Neural TTS",
        "default_voice": DEFAULT_VOICE
    })

@app.route('/tts', methods=['GET', 'POST'])
def tts():
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        text = data.get('text', '')
        voice = data.get('voice', DEFAULT_VOICE)
    else:
        text = request.args.get('text', '')
        voice = request.args.get('voice', DEFAULT_VOICE)

    cleaned_text = text.strip()
    if not cleaned_text:
        return jsonify({"error": "No text provided"}), 400

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_buffer = loop.run_until_complete(generate_speech_bytes(cleaned_text, voice))
        loop.close()

        return send_file(
            audio_buffer,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )
    except Exception as e:
        print(f"Local TTS Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8008))
    print(f"🚀 Starting Local Neural TTS Server on http://127.0.0.1:{port}...")
    app.run(host='127.0.0.1', port=port, debug=False, threaded=True)
