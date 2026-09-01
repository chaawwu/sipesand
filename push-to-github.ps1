# ==============================================================================
# Script Otomatis Push & Deploy ke GitHub Repository (SiPesand SaaS)
# ==============================================================================

param(
    [string]$RepoUrl = ""
)

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "🚀 Memulai Otomatisasi Git Init, Commit & Push ke GitHub" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Inisialisasi Git jika belum ada
if (!(Test-Path ".git")) {
    Write-Host "📦 Menginisialisasi Git Repository..." -ForegroundColor Yellow
    git init -b main
} else {
    git branch -M main
}

# 2. Stage Semua File yang relevan
Write-Host "📋 Menambahkan berkas ke Staging Area..." -ForegroundColor Yellow
git add .

# 3. Commit Perubahan
$commitMsg = "feat: complete SiPesand multi-tenant SaaS platform, Cloudflare Pages CI/CD, and real tenant Darul Rahman Sumbersari"
Write-Host "💾 Membuat Git Commit..." -ForegroundColor Yellow
git commit -m $commitMsg

# 4. Handle Remote Repository
$currentRemote = git remote get-url origin 2>$null

if ($RepoUrl -ne "") {
    if ($currentRemote) {
        git remote set-url origin $RepoUrl
    } else {
        git remote add origin $RepoUrl
    }
    Write-Host "🔗 Remote URL diatur ke: $RepoUrl" -ForegroundColor Green
} elseif (!$currentRemote) {
    Write-Host ""
    Write-Host "⚠️ Masukkan URL GitHub Repository Anda (contoh: https://github.com/username/sipesand-app.git):" -ForegroundColor Magenta
    $inputUrl = Read-Host "URL GitHub"
    if ($inputUrl -ne "") {
        git remote add origin $inputUrl
    }
}

# 5. Push ke GitHub
try {
    Write-Host "🚀 Mengunggah (Push) kode ke GitHub branch 'main'..." -ForegroundColor Cyan
    git push -u origin main --force
    Write-Host "✅ BERHASIL PUSH KE GITHUB! Cloudflare Pages akan otomatis ter-deploy." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Gagal push otomatis. Pastikan kredensial GitHub / Personal Access Token Anda aktif." -ForegroundColor Red
}

Write-Host "====================================================================" -ForegroundColor Cyan
