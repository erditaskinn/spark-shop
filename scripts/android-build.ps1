param([switch]$Production)
$ErrorActionPreference = 'Stop'
if (-not $env:JAVA_HOME) {
    $portableJdk = Get-ChildItem (Join-Path $PSScriptRoot '../.tools/java') -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($portableJdk) { $env:JAVA_HOME = $portableJdk.FullName }
}
if (-not $env:JAVA_HOME) { throw 'Set JAVA_HOME to JDK 21 before building.' }
Push-Location (Join-Path $PSScriptRoot '..')
try {
    if ($Production) { $env:VITE_ADMOB_PRODUCTION = 'true'; $env:SPARK_PRODUCTION = 'true' }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Browser build failed' }
    npx cap sync android
    if ($LASTEXITCODE -ne 0) { throw 'Capacitor sync failed' }
    Push-Location android
    try { .\gradlew.bat bundleRelease assembleDebug --console=plain; if ($LASTEXITCODE -ne 0) { throw 'Android build failed' } }
    finally { Pop-Location }
} finally { Pop-Location }
