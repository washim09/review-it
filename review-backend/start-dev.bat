@echo off
:: Set environment variables to disable Next.js tracing and telemetry
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--no-warnings

:: Clean the .next directory if it exists
if exist .next (
  echo Removing .next directory...
  rd /s /q .next
)

:: Start Next.js with tracing disabled
echo Starting Next.js server...
npx next dev --no-telemetry

pause
