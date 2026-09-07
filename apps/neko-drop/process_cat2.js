import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath2 = path.resolve(__dirname, "src/assets/cat2.png");
const outputDir = path.resolve(__dirname, "src/assets");

async function processCat2() {
  console.log("🐾 cat2.png (거부/뾰로통 고양이) 배경 투명화 처리를 시작합니다...");

  const image = sharp(inputPath2);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  console.log(`cat2 해상도: ${width}x${height}`);

  const croppedBuffer = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = croppedBuffer;
  const { width: cropW, height: cropH, channels } = info;

  const visited = new Uint8Array(cropW * cropH);
  const queue = [];

  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const isBgColor = (r, g, b) => {
    const diff = Math.sqrt(
      (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
    );
    const isMint = g > r + 15 && g > b - 15 && g > 150;
    return diff < 48 || (isMint && diff < 90);
  };

  // 외곽 가장자리 등록
  for (let x = 0; x < cropW; x++) {
    queue.push([x, 0]);
    queue.push([x, cropH - 1]);
  }
  for (let y = 0; y < cropH; y++) {
    queue.push([0, y]);
    queue.push([cropW - 1, y]);
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    const idx = y * cropW + x;

    if (visited[idx]) continue;
    visited[idx] = 1;

    const pIdx = idx * channels;
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    if (isBgColor(r, g, b)) {
      data[pIdx + 3] = 0;

      if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
      if (x < cropW - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
      if (y > 0 && !visited[idx - cropW]) queue.push([x, y - 1]);
      if (y < cropH - 1 && !visited[idx + cropW]) queue.push([x, y + 1]);
    }
  }

  // 가장자리 안티에일리어싱 블렌딩
  for (let y = 1; y < cropH - 1; y++) {
    for (let x = 1; x < cropW - 1; x++) {
      const idx = y * cropW + x;
      const pIdx = idx * channels;

      if (data[pIdx + 3] > 0) {
        const neighbors = [
          (idx - 1) * channels + 3,
          (idx + 1) * channels + 3,
          (idx - cropW) * channels + 3,
          (idx + cropW) * channels + 3,
        ];
        const hasTransparentNeighbor = neighbors.some((n) => data[n] === 0);
        if (hasTransparentNeighbor) {
          const r = data[pIdx];
          const g = data[pIdx + 1];
          const b = data[pIdx + 2];
          const diff = Math.sqrt(
            (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
          );
          if (diff < 80) {
            data[pIdx + 3] = Math.max(0, Math.min(255, (diff / 80) * 255));
          }
        }
      }
    }
  }

  const outPath = path.join(outputDir, "cat_reject.png");
  await sharp(data, {
    raw: {
      width: cropW,
      height: cropH,
      channels: 4,
    },
  })
    .trim()
    .png()
    .toFile(outPath);

  console.log(`✅ cat_reject.png 생성 완료: ${outPath}`);
}

processCat2().catch(console.error);
