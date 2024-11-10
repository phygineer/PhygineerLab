from fastapi import FastAPI,APIRouter,UploadFile, HTTPException, Form
import speech_recognition as sr
from gtts import gTTS
from fastapi.responses import StreamingResponse
import io
from pydub import AudioSegment


router = APIRouter()


# Endpoint for speech-to-text with language support and multiple audio formats
@router.post("/speech-to-text/")
async def speech_to_text(audio_file: UploadFile, language: str = "en-US"):
    # Supported formats: wav, mp3, ogg, flac
    audio_bytes = await audio_file.read()
    audio_data = io.BytesIO(audio_bytes)

    # Convert the input audio to WAV in memory (required by speech_recognition)
    try:
        # If the file is not WAV, try converting it to WAV using pydub (excluding AIFF format)
        if audio_file.content_type not in ["audio/wav", "audio/flac"]:
            audio = AudioSegment.from_file(audio_data)
            wav_audio = io.BytesIO()
            audio.export(wav_audio, format="wav")
            wav_audio.seek(0)
            audio_data = wav_audio
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Audio conversion error: {str(e)}")

    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_data) as source:
        audio = recognizer.record(source)

    try:
        # Use the language parameter to recognize speech in different languages
        text = recognizer.recognize_google(audio, language=language)
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Speech not recognized.")
    except sr.RequestError:
        raise HTTPException(status_code=503, detail="Error with the speech recognition service.")

    return {"transcribed_text": text}

# Endpoint for text-to-speech with language support
@router.post("/text-to-speech/")
async def text_to_speech(input_text: str = Form(...), language: str = Form("en")):
    tts = gTTS(text=input_text, lang=language)
    audio_buffer = io.BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)

    return StreamingResponse(audio_buffer, media_type="audio/mpeg", headers={"Content-Disposition": "inline; filename=output_audio.mp3"})