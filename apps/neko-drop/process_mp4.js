import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputMp4 = path.resolve(__dirname, "src/assets/Cat_walking_back_and_forth.mp4");
const tempFramesDir = path.resolve(__dirname, "temp_mp4_frames");
const cleanFramesDir = path.resolve(__dirname, "clean_mp4_frames");
const outputWebp = path.resolve(__dirname, "src/assets/cat_walking.webp");

async function processMp4ToTransparentWebp() {
  console.log("🐾 MP4 원본 비디오로부터 고화질 24비트 트루컬러 투명 WebP 생성을 시작합니다...");

  if (!fs.existsSync(tempFramesDir)) fs.mkdirSync(tempFramesDir, { recursive: true });
  if (!fs.existsSync(cleanFramesDir)) fs.mkdirSync(cleanFramesDir, { recursive: true });

  // 1. MP4에서 18fps 고화질 PNG 프레임 추출
  await new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        "-y",
        "-i",
        inputMp4,
        "-r",
        "18", // 부드러운 18fps
        path.join(tempFramesDir, "frame_%04d.png"),
      ],
      (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });

  const frameFiles = fs
    .readdirSync(tempFramesDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`총 ${frameFiles.length}개의 고해상도 프레임 추출 완료.`);

  // 첫 번째 프레임 해상도
  const firstMeta = await sharp(path.join(tempFramesDir, frameFiles[0])).metadata();
  const W = firstMeta.width;
  const H = firstMeta.height;

  // 전체 프레임에서 고양이 바운딩 박스를 포함하는 중앙-하단 영역 크롭 (여백 최소화로 고양이를 큼직하게!)
  // 고양이는 Y축 40% ~ 95% 사이에 위치, X축은 전체 가로 영역을 왕복
  const cropTop = Math.floor(H * 0.25);
  const cropH = Math.floor(H * 0.72);
  const cropLeft = 0;
  const cropW = W;

  console.log(`프레임별 배경 투명화 처리 중 (${cropW}x${cropH})...`);

  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i];
    const filePath = path.join(tempFramesDir, file);

    const frameBuffer = await sharp(filePath)
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = frameBuffer;
    const { width: fw, height: fh, channels } = info;

    const visited = new Uint8Array(fw * fh);
    const queue = [];

    // 모서리 민트색 배경 샘플링
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    const isMintBg = (r, g, b) => {
      const diff = Math.sqrt(
        (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
      );
      // 민트색 배경 및 그림자 영역 판별
      const isGreenish = g > r + 10 && g > b - 15 && g > 130;
      const isShadow = r > 110 && r < 185 && g > 150 && g < 210 && b > 140 && b < 195 && g > r + 6;
      return diff < 42 || isGreenish || isShadow;
    };

    for (let x = 0; x < fw; x++) {
      queue.push([x, 0]);
      queue.push([x, fh - 1]);
    }
    for (let y = 0; y < fh; y++) {
      queue.push([0, y]);
      queue.push([fw - 1, y]);
    }

    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      const idx = y * fw + x;

      if (visited[idx]) continue;
      visited[idx] = 1;

      const pIdx = idx * channels;
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];

      if (isMintBg(r, g, b)) {
        data[pIdx + 3] = 0;

        if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
        if (x < fw - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - fw]) queue.push([x, y - 1]);
        if (y < fh - 1 && !visited[idx + fw]) queue.push([x, y + 1]);
      }
    }

    // 안티에일리어싱 부드러운 가장자리 블렌딩
    for (let y = 1; y < fh - 1; y++) {
      for (let x = 1; x < fw - 1; x++) {
        const idx = y * fw + x;
        const pIdx = idx * channels;

        if (data[pIdx + 3] > 0) {
          const neighbors = [
            (idx - 1) * channels + 3,
            (idx + 1) * channels + 3,
            (idx - fw) * channels + 3,
            (idx + fw) * channels + 3,
          ];
          if (neighbors.some((n) => data[n] === 0)) {
            const r = data[pIdx];
            const g = data[pIdx + 1];
            const b = data[pIdx + 2];
            const diff = Math.sqrt(
              (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
            );
            if (diff < 70) {
              data[pIdx + 3] = Math.max(0, Math.min(255, (diff / 70) * 255));
            }
          }
        }
      }
    }

    const cleanPath = path.join(cleanFramesDir, `clean_${String(i).padStart(4, "0")}.png`);
    await sharp(data, {
      raw: {
        width: fw,
        height: fh,
        channels: 4,
      },
    })
      .png()
      .toFile(cleanPath);
  }

  console.log("모든 프레임 누끼 완료! 고화질 24-bit 투명 WebP로 합성 중...");

  // 3. ffmpeg로 무손실/고화질 투명 WebP 애니메이션 생성 (24비트 트루컬러 + 무제한 색상)
  await new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        "-y",
        "-framerate",
        "18",
        "-i",
        path.join(cleanFramesDir, "clean_%04d.png"),
        "-vcodec",
        "libwebp",
        "-lossless",
        "1",
        "-compression_level",
        "4",
        "-loop",
        "0",
        "-an",
        outputWebp,
      ],
      (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });

  // 임시 폴더 정리
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  fs.rmSync(cleanFramesDir, { recursive: true, force: true });

  console.log(`🎉 100% 무손실 선명한 투명 WebP 애니메이션 생성 완료: ${outputWebp}`);
}

processMp4ToTransparentWebp().catch(console.error);
