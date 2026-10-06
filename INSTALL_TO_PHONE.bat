@echo off
:: ============================================================
:: MediQueue - Transfer to Android Phone via USB (ADB)
:: ============================================================
:: Make sure your phone is connected via USB with USB Debugging ON
:: and File Transfer (MTP) mode selected.

setlocal
set ADB="%~dp0platform-tools\adb.exe"
set APP_DIR=%~dp0dist
set PHONE_DIR=/sdcard/MediQueue

echo.
echo  ==========================================
echo   MediQueue - Install to Android Phone
echo  ==========================================
echo.

:: Step 1: Check ADB devices
echo [1/5] Checking ADB connection to phone...
%ADB% devices
echo.

:: Step 2: Check if device is found
for /f "skip=1 tokens=1" %%i in ('%ADB% devices') do (
    if "%%i" NEQ "" (
        echo [OK] Android device detected: %%i
        goto :found
    )
)

echo [ERROR] No Android device found!
echo.
echo  Please:
echo   1. Connect your phone via USB cable
echo   2. Unlock your phone
echo   3. When prompted, tap "Allow USB debugging"
echo   4. Set USB mode to "File Transfer" (MTP)
echo   5. Run this script again
echo.
pause
exit /b 1

:found
echo.

:: Step 3: Create folder on phone
echo [2/5] Creating MediQueue folder on phone...
%ADB% shell mkdir -p %PHONE_DIR%
echo [OK] Folder created at %PHONE_DIR%
echo.

:: Step 4: Push all dist files
echo [3/5] Transferring MediQueue app files to phone...
%ADB% push "%APP_DIR%\." %PHONE_DIR%
echo [OK] Files transferred!
echo.

:: Step 5: Verify files on phone
echo [4/5] Verifying files on phone...
%ADB% shell ls -la %PHONE_DIR%
echo.

:: Step 6: Open Chrome on phone to the app (via ADB intent)
echo [5/5] Opening MediQueue in Chrome on your phone...
echo.
echo  NOTE: The app will open in Chrome. Then follow the steps to
echo        install it as a home screen app.
echo.
echo  ---  INSTALL STEPS ON YOUR PHONE  ---
echo.
echo   1. Chrome will open with the app
echo   2. Tap the 3-dot menu (top right in Chrome)
echo   3. Tap "Add to Home screen" or "Install app"
echo   4. Tap "Add" or "Install"
echo   5. Done! MediQueue icon will appear on your home screen
echo.
echo  ==========================================
echo   App files are saved at:
echo   Phone: %PHONE_DIR%\index.html
echo  ==========================================
echo.
echo  To open the app directly, use:
echo   %ADB% shell am start -a android.intent.action.VIEW -d "file:///sdcard/MediQueue/index.html" com.android.chrome
echo.

pause
endlocal
