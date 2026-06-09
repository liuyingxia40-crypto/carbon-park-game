@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules\" (
  echo 正在安装依赖，请稍候...
  call npm install
  if errorlevel 1 (
    echo.
    echo [失败] 请先安装 Node.js: https://nodejs.org/
    echo 安装后重新双击本文件。
    pause
    exit /b 1
  )
)

echo.
echo ============================================
echo   游戏服务器启动中，请勿关闭本窗口
echo   浏览器将自动打开，或手动访问:
echo   http://localhost:5173/
echo ============================================
echo.

call npm run dev

echo.
echo 服务器已停止。
pause
