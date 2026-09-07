import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputGif = path.resolve(__dirname, "src/assets/cat_warking.gif");
const tempFramesDir = path.resolve(__dirname, "temp_frames");
const cleanFramesDir = path.resolve(__dirname, "clean_frames");
const outputGif = path.resolve(__dirname, "src/assets/cat_walking.gif");

async function processCrispWalkingGif() {
  console.log("🐾 고화질 선명도 보존 & 타이트 확대 GIF 생성 시작...");

  if (!fs.existsSync(tempFramesDir)) fs.mkdirSync(tempFramesDir, { recursive: true });
  if (!fs.existsSync(cleanFramesDir)) fs.mkdirSync(cleanFramesDir, { recursive: true });

  await new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      ["-y", "-i", inputGif, path.join(tempFramesDir, "frame_%03d.png")],
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

  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i];
    const filePath = path.join(tempFramesDir, file);

    const frameBuffer = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = frameBuffer;
    const { width: fw, height: fh, channels } = info;

    const visited = new Uint8Array(fw * fh);
    const queue = [];

    // 민트색 배경만 정확히 타격 (고양이 내부 라인/털은 100% 보존)
    const isMintBg = (r, g, b) => {
      // 민트색 배경 샘플: R~150-195, G~200-240, B~180-225 (G가 R보다 확연히 높음)
      const isGreenDominant = g > r + 14 && g > 135;
      const isShadow = r > 115 && r < 175 && g > 155 && g < 205 && b > 140 && b < 190 && g > r + 8;
      return isGreenDominant || isShadow;
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
        data[pIdx + 3] = 0; // 배경 투명화

        if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
        if (x < fw - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - fw]) queue.push([x, y - 1]);
        if (y < fh - 1 && !visited[idx + fw]) queue.push([x, y + 1]);
      }
    }

    const cleanPath = path.join(cleanFramesDir, `clean_${String(i).padStart(3, "0")}.png`);
    await sharp(data, {
      raw: {
        width: fw,
        height: fh,
        channels: 4,
      },
    })
      .trim() // 빈 여백 제거로 큼직하게 확대
      .resize(200, 200, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(cleanPath);
  }

  // 최적화된 고화질 투명 GIF 생성
  await new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        "-y",
        "-framerate",
        "16",
        "-i",
        path.join(cleanFramesDir, "clean_%03d.png"),
        "-filter_complex",
        "[0:v] split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=00000000 [p];[b][p] paletteuse=alpha_threshold=128",
        outputGif,
      ],
      (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });

  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  fs.rmSync(cleanFramesDir, { recursive: true, force: true });

  console.log(`🎉 큼직하고 또렷한 고화질 걷기 GIF 생성 완료: ${outputGif}`);
}

processCrispWalkingGif().catch(console.error);
