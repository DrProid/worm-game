REM CD /d "%~dp0"
FOR /F "tokens=* delims=." %%a in ('dir /b *.wav') DO ffmpeg -i %%a %%~na.mp3
pause