const { execSync } = require('child_process');

function autoPush(customMessage) {
  try {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const commitMsg = customMessage || `chore(auto-sync): update SiPesand codebase at ${timestamp}`;

    console.log(`\n🚀 [Auto-Git] Menjalankan Auto-Commit & Auto-Push ke GitHub...`);
    execSync('git add .', { stdio: 'inherit' });

    // Cek apakah ada perubahan untuk dicommit
    const status = execSync('git status --porcelain').toString().trim();
    if (!status) {
      console.log(`✅ [Auto-Git] Tidak ada perubahan baru. Repositori GitHub sudah up-to-date.`);
      return;
    }

    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log(`🎉 [Auto-Git] Berhasil Auto-Push ke https://github.com/chaawwu/sipesand (Branch main)\n`);
  } catch (err) {
    console.error(`⚠️ [Auto-Git Error]:`, err.message);
  }
}

// Jika dijalankan langsung via node sync-github.js "pesan commit"
if (require.main === module) {
  const msg = process.argv.slice(2).join(' ');
  autoPush(msg);
}

module.exports = autoPush;
