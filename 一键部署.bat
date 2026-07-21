@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   智能车载语音助手 — 一键部署
echo ========================================
echo.

echo [1/2] 提交所有改动到 Git...
git add -A
git commit -m "更新 %date:~0,10% %time:~0,5%"
if %errorlevel% neq 0 (
    echo ⚠️ 没有新变更，直接推送
)

echo.
echo [2/2] 推送到 GitHub...
git push

if %errorlevel% neq 0 (
    echo.
    echo ❌ 推送失败！可能网络不稳定，请稍后重试。
    echo    也可以打开 https://github.com/Chitoge-Zin/car-voice-assistant
    echo    手动 Upload files 上传。
) else (
    echo.
    echo ========================================
    echo   ✅ 部署完成！
    echo   访问：https://chitoge-zin.github.io/car-voice-assistant/
    echo   （等待30秒生效）
    echo ========================================
)

echo.
pause
