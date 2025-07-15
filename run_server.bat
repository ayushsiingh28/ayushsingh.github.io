@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python app.py 