# fix-schema.ps1
Write-Host "🔧 در حال رفع مشکل ساختار دیتابیس..." -ForegroundColor Yellow

# رفع مشکل فایل کلاس
Write-Host "📝 در حال اصلاح فایل class.service.js..." -ForegroundColor Cyan
$classService = Get-Content "src/services/class.service.js" -Raw
$classService = $classService -replace 'AND role = "student"', 'JOIN roles r ON r.id = u.role_id AND r.slug = "student"'
$classService = $classService -replace 'AND role = "teacher"', 'JOIN roles r ON r.id = u.role_id AND r.slug = "teacher"'
$classService | Set-Content "src/services/class.service.js"
Write-Host "✅ فایل class.service.js اصلاح شد!" -ForegroundColor Green

# رفع مشکل فایل محتوا
Write-Host "📝 در حال اصلاح فایل content.service.js..." -ForegroundColor Cyan
$contentService = Get-Content "src/services/content.service.js" -Raw
$contentService = $contentService -replace 'WHERE v.deleted_at IS NULL', ''
$contentService = $contentService -replace 'WHERE p.is_active = 1', ''
$contentService | Set-Content "src/services/content.service.js"
Write-Host "✅ فایل content.service.js اصلاح شد!" -ForegroundColor Green

Write-Host "`n✅ همه تغییرات با موفقیت اعمال شد!" -ForegroundColor Green
Write-Host "حالا دستورات زیر رو اجرا کنید:" -ForegroundColor Yellow
Write-Host "docker compose down" -ForegroundColor White
Write-Host "docker compose build --no-cache" -ForegroundColor White
Write-Host "docker compose up -d" -ForegroundColor White