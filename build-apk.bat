@echo off
echo =======================================================
echo   SiPesand Mobile - Android APK Builder (Local)
echo =======================================================
echo.

cd /d "%~dp0\frontend"

echo [1/3] Membangun Frontend Web Vite...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gagal build frontend.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Sinkronisasi Aset Web ke Proyek Android Native (Capacitor)...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gagal sinkronisasi Capacitor.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Membuka Proyek Android atau Kompilasi Gradle...
cd android
if exist gradlew.bat (
    echo Menjalankan Gradle Assemble Debug...
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% equ 0 (
        echo.
        echo [SUKSES] APK Berhasil Dibuat di:
        echo frontend\android\app\build\outputs\apk\debug\app-debug.apk
        echo.
        if not exist "%~dp0\dist-apk" mkdir "%~dp0\dist-apk"
        copy /y "app\build\outputs\apk\debug\app-debug.apk" "%~dp0\dist-apk\sipesand-app.apk"
        echo File disalin ke: dist-apk\sipesand-app.apk
    ) else (
        echo.
        echo [INFO] Gradle lokal memerlukan Java JDK & Android SDK terpasang.
        echo Anda dapat membuka proyek di Android Studio dengan perintah:
        echo cd frontend ^&^& npx cap open android
    )
)

echo.
echo Selesai!
pause
