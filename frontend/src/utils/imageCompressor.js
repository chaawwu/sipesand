/**
 * SiPesand Client-Side Image Compressor
 * 
 * Mengompresi dan mengubah ukuran berkas foto secara otomatis di browser menggunakan HTML5 Canvas.
 * Menghasilkan Data URL (Base64) berukuran ringan (~30KB - 70KB) yang tajam dan jernih,
 * sehingga tidak melanggar batas 1MB Firestore maupun kuota 5MB LocalStorage browser.
 */

export function compressImage(file, options = {}) {
  const { 
    maxWidth = 600, 
    maxHeight = 600, 
    quality = 0.82,
    preserveTransparency = false 
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Berkas tidak ditemukan'));
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Format berkas tidak valid. Harap pilih gambar (JPG, PNG, atau WebP).'));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(new Error('Gagal membaca berkas: ' + (err.message || 'Error FileReader')));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompresi'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan proporsi aspek rasio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result); // Fallback ke original jika canvas context gagal
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Jika bukan preserveTransparency (misalnya JPG foto kiai), isi background putih bersih
        const isPng = file.type === 'image/png';
        if (!preserveTransparency || !isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        let outputType = 'image/jpeg';
        if (preserveTransparency && isPng) {
          outputType = 'image/png';
        }

        const compressedDataUrl = canvas.toDataURL(outputType, quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
