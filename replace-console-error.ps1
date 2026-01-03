# PowerShell script to replace console.error with handleError

$files = Get-ChildItem -Path ".\src\pages" -Filter *.jsx -Recurse

$totalReplaced = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if no console.error
    if ($content -notmatch 'console\.error') {
        continue
    }
    
    $originalContent = $content
    
    # Check if handleError is already imported
    $hasHandleError = $content -match "import.*handleError.*from.*@/lib/errorHandler"
    
    # Replace console.error patterns
    $content = $content -replace "console\.error\('([^']+)'(,\s*)?error\);", "handleError(error, { userMessage: '`$1', showToast: false });"
    $content = $content -replace 'console\.error\("([^"]+)"(,\s*)?error\);', 'handleError(error, { userMessage: "$1", showToast: false });'
    $content = $content -replace "console\.error\(error\);", "handleError(error, { showToast: false });"
    $content = $content -replace "console\.error\('([^']+)', error\);", "handleError(error, { userMessage: '`$1', showToast: false });"
    $content = $content -replace 'console\.error\("([^"]+)", error\);', 'handleError(error, { userMessage: "$1", showToast: false });'
    
    # Add import if needed and content changed
    if ($content -ne $originalContent) {
        if (-not $hasHandleError) {
            $content = $content -replace "(import .* from 'react';)", "`$1`nimport { handleError } from '@/lib/errorHandler';"
        }
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $replacements = ([regex]::Matches($originalContent, 'console\.error')).Count - ([regex]::Matches($content, 'console\.error')).Count
        $totalReplaced += $replacements
        $filesModified++
        Write-Host "Modified $($file.Name): $replacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "Files modified: $filesModified" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplaced" -ForegroundColor Yellow
