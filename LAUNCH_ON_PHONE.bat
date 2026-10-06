@echo off
:: ============================================================
::  MediQueue - One-Click Phone Launcher
::  Run this EVERY TIME you want to use the app on your phone
:: ============================================================
setlocal
set ADB="%~dp0platform-tools\adb.exe"

echo.
echo  ==========================================
echo    MediQueue - Android Phone Launcher
echo  ==========================================
echo.

:: Check phone is connected
echo [1/4] Checking phone connection...
%ADB% start-server >nul 2>&1
for /f "skip=1 tokens=1,2" %%i in ('%ADB% devices 2^>nul') do (
    if "%%j"=="device" (
        set DEVICE_ID=%%i
        goto :device_found
    )
)

echo [ERROR] No phone found!
echo.
echo  Make sure:
echo   1. USB cable is connected
echo   2. Phone is unlocked
echo   3. USB mode = "File Transfer" (MTP)
echo   4. USB Debugging is ON (Settings > Developer Options)
echo.
pause
exit /b 1

:device_found
echo [OK] Phone connected: %DEVICE_ID%
echo.

:: Set ADB port reversal so phone reaches PC's servers
echo [2/4] Setting up USB port tunnel...
%ADB% -s %DEVICE_ID% reverse tcp:4173 tcp:4173 >nul
%ADB% -s %DEVICE_ID% reverse tcp:5000 tcp:5000 >nul
echo [OK] Ports 4173 (app) + 5000 (backend) tunneled to phone.
echo.

:: Start Vite preview server in background
echo [3/4] Starting MediQueue web server...
start "MediQueue Server" cmd /k "npm run preview"
timeout /t 3 >nul
echo [OK] Server running on http://localhost:4173
echo.

:: Open in Chrome on phone
echo [4/4] Opening MediQueue on phone Chrome...
%ADB% -s %DEVICE_ID% shell am start -a android.intent.action.VIEW -d http://localhost:4173 com.android.chrome >nul 2>&1
echo [OK] MediQueue opened on your phone!
echo.

echo  ==========================================
echo   APP IS LIVE ON YOUR PHONE!
echo  ==========================================
echo.
echo  To INSTALL as home screen app:
echo   1. In Chrome on your phone, tap menu (3 dots)
echo   2. Tap "Add to Home screen" or "Install app"  
echo   3. Tap "Install" - Done!
echo.
echo  App URL: http://localhost:4173
echo  Backend: http://localhost:5000/api
echo.
echo  Keep this window open while using the app.
echo.
pause
endlocal
