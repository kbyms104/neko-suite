import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputMp4 = path.resolve(__dirname, "src/assets/Cat_walking_back_and_forth.mp4");
const rawFramesDir = path.resolve(__dirname, "raw_frames");
const walkCycleDir = path.resolve(__dirname, "src/assets/walk_cycle");

async function extractFullTailWalkCycle() {
  console.log("🐾 꼬리 완벽 보존 구간(화면 중앙 전신 진입 구간)에서 프레임 추출 시작...");

  if (!fs.existsSync(rawFramesDir)) fs.mkdirSync(rawFramesDir, { recursive: true });
  if (!fs.existsSync(walkCycleDir)) fs.mkdirSync(walkCycleDir, { recursive: true });

  // 꼬리가 비디오 경계 밖으로 나가지 않은 완벽한 걷기 루프 구간 (0.8초 ~ 1.7초)
  await new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        "-y",
        "-ss", "00:00:00.8",
        "-t", "00:00:00.9",
        "-i", inputMp4,
        "-r", "10",
        path.join(rawFramesDir, "step_%02d.png"),
      ],
      (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      }
    );
  });

  const frameFiles = fs
    .readdirSync(rawFramesDir)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`추출된 프레임 수: ${frameFiles.length}`);

  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i];
    const filePath = path.join(rawFramesDir, file);

    const frameBuffer = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = frameBuffer;
    const { width: fw, height: fh, channels } = info;

    const visited = new Uint8Array(fw * fh);
    const queue = [];

    const isMintBg = (r, g, b) => {
      const isGreenDominant = g > r + 10 && g > 125;
      const isShadow = r > 110 && r < 185 && g > 150 && g < 215 && b > 140 && b < 195 && g > r + 5;
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
        data[pIdx + 3] = 0;

        if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
        if (x < fw - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - fw]) queue.push([x, y - 1]);
        if (y < fh - 1 && !visited[idx + fw]) queue.push([x, y + 1]);
      }
    }

    const outStepPath = path.join(walkCycleDir, `walk_${i}.png`);

    // 타이트 trim 후 넉넉한 240x200 캔버스에 중앙 정렬
    const trimmedBuffer = await sharp(data, {
      raw: {
        width: fw,
        height: fh,
        channels: 4,
      },
    })
      .trim()
      .toBuffer({ resolveWithObject: true });

    const trimmedMeta = trimmedBuffer.info;

    await sharp(trimmedBuffer.data, {
      raw: {
        width: trimmedMeta.width,
        height: trimmedMeta.height,
        channels: 4,
      },
    })
      .resize(220, 180, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: 15,
        bottom: 15,
        left: 20,
        right: 20,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outStepPath);

    console.log(`✅ 온전한 꼬리 프레임: walk_${i}.png 저장 완료`);
  }

  fs.rmSync(rawFramesDir, { recursive: true, force: true });
  console.log("🎉 꼬리가 100% 둥글고 온전한 프레임 시퀀스 준비 완료!");
}

extractFullTailWalkCycle().catch(console.error);
