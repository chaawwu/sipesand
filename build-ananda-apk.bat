@echo off
echo ===============================================================
echo   Ananda by SiPesand - Aplikasi Wali Santri APK Builder
echo ===============================================================
echo.

cd /d "%~dp0\ananda-android"

if exist gradlew.bat (
    echo Menjalankan Gradle Assemble Debug...
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% equ 0 (
        echo.
        echo [SUKSES] APK Ananda Berhasil Dibuat di:
        echo ananda-android\app\build\outputs\apk\debug\app-debug.apk
        echo.
        if not exist "%~dp0\dist-apk" mkdir "%~dp0\dist-apk"
        copy /y "app\build\outputs\apk\debug\app-debug.apk" "%~dp0\dist-apk\ananda-wali-sipesand.apk"
        echo File disalin ke: dist-apk\ananda-wali-sipesand.apk
    ) else (
        echo.
        echo [INFO] Memerlukan Java JDK 17 & Android SDK lokal untuk compile command-line.
        echo Buka direktori 'ananda-android' langsung di Android Studio:
        echo File -^> Open -^> C:\sipesand-app\ananda-android
    )
)

echo.
echo Selesai!
pause
