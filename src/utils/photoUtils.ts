/**
 * Utility functions for camera capture, compression and preview
 */

export function canvasToWebP(canvas: HTMLCanvasElement, quality = 0.82): string {
  try {
    const webpUrl = canvas.toDataURL('image/webp', quality);
    if (webpUrl.startsWith('data:image/webp')) {
      return webpUrl;
    }
  } catch (e) {
    // Browser does not support WebP canvas export, fallback
  }
  return canvas.toDataURL('image/jpeg', quality);
}

export function getImageSizeInfo(dataUrl: string): { format: string; sizeKb: number; sizeText: string } {
  let format = 'WebP';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
    format = 'JPEG';
  } else if (dataUrl.startsWith('data:image/png')) {
    format = 'PNG';
  } else if (dataUrl.startsWith('data:image/webp')) {
    format = 'WebP';
  }

  // Calculate base64 decoded byte size: (chars * 3/4)
  const base64Index = dataUrl.indexOf(';base64,');
  const base64Length = base64Index !== -1 ? dataUrl.length - (base64Index + 8) : dataUrl.length;
  const bytes = Math.round(base64Length * 0.75);
  const sizeKb = Math.round(bytes / 1024);

  return {
    format,
    sizeKb,
    sizeText: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`
  };
}

export async function fileToDataUrl(file: File, maxWidth = 1600, maxHeight = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Add small timestamp stamp on bottom right corner (Inspection watermark)
        const timestamp = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(width - 240, height - 36, 230, 28);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`GVD INSPECT • ${timestamp}`, width - 230, height - 18);

        // Export compressed as WebP format for optimal storage savings
        resolve(canvasToWebP(canvas, quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a visually appealing simulated inspection photo for instant testing
 */
export function generateSampleInspectionPhoto(
  slotLabel: string,
  vehicleNumber: string,
  stage: 'checkin' | 'checkout',
  type: 'car' | 'bike'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  if (stage === 'checkin') {
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
  } else {
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(1, '#022c22');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  // Grid background
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }
  for (let y = 0; y < 600; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Center silhouette / box
  ctx.strokeStyle = stage === 'checkin' ? '#38bdf8' : '#34d399';
  ctx.lineWidth = 3;
  ctx.strokeRect(100, 100, 600, 400);

  // Vehicle Silhouette icon
  ctx.font = 'bold 36px sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.fillText(slotLabel.toUpperCase(), 400, 240);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = stage === 'checkin' ? '#38bdf8' : '#34d399';
  ctx.fillText(stage === 'checkin' ? '● CHECK-IN (BEFORE SERVICE)' : '✓ CHECK-OUT (AFTER SERVICE)', 400, 290);

  ctx.font = '20px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`VEHICLE: ${vehicleNumber || 'KA 01 XX 0000'}`, 400, 340);
  ctx.fillText(`TYPE: ${type.toUpperCase()} SERVICE CENTER`, 400, 375);

  // Timestamp watermark
  const timestamp = new Date().toLocaleString('en-IN');
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 560, 800, 40);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`GVD AUTOCARE • ${timestamp} • ${stage.toUpperCase()}`, 780, 585);

  return canvasToWebP(canvas, 0.85);
}
