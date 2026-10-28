# Fajaede Privacy-Cleaner - maakt de zip voor de Chrome Web Store
# Gebruik: powershell -ExecutionPolicy Bypass -File build-zip.ps1

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$version = (Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json).version
$zip = Join-Path $root "fajaede-privacy-cleaner-$version.zip"

$files = @(
    'manifest.json',
    'fajaede-background.js',
    'fajaede-popup.html',
    'popup.js',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png'
)

if (Test-Path $zip) { Remove-Item $zip -Force -Confirm:$false }

# Entries met forward slashes, anders vindt de Chrome Web Store de icons niet
$archive = [IO.Compression.ZipFile]::Open($zip, 'Create')
try {
    foreach ($file in $files) {
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $root $file), $file) | Out-Null
    }
} finally {
    $archive.Dispose()
}
Write-Host "Fajaede zip gemaakt: $zip"
