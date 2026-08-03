@echo off
cd /d C:\Users\王思尧\Desktop\car-assistant-deploy
start "" "C:\Program Files (x86)\Microsoft\Edge Dev\Application\msedge.exe" http://localhost:8766
python tts_proxy.py
pause
