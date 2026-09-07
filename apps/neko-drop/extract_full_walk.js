import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputMp4 = path.resolve(__dirname, "src/assets/Cat_walking_back_and_forth.mp4");
const rawFramesDir = path.resolve(__dirname, "temp_full_raw");
const outFramesDir = path.resolve(__dirname, "public/cat_walk_frames");

async function extractFullNaturalWalk() {
  console.log("🐾 10초 풀 영상 자연스러운 왕복 & 턴 시퀀스 추출 시작...");

  if (!fs.existsSync(rawFramesDir)) fs.mkdirSync(rawFramesDir, { recursive: true });
  if (!fs.existsSync(outFramesDir)) fs.mkdirSync(outFramesDir, { recursive: true });

  // 12fps로 10초 전체 추출 (총 약 120개 프레임)
  await new Promise((resolve, reject) => {
    execFile(
      ffmpegPath,
      [
        "-y",
        "-i", inputMp4,
        "-r", "12", // 부드러우면서 초경량인 12fps
        path.join(rawFramesDir, "frame_%04d.png"),
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

  const firstMeta = await sharp(path.join(rawFramesDir, frameFiles[0])).metadata();
  const W = firstMeta.width;
  const H = firstMeta.height;

  // 고양이가 이동하는 높이 영역 (Y축 25% ~ 95%)
  const cropTop = Math.floor(H * 0.22);
  const cropH = Math.floor(H * 0.75);
  const cropLeft = 0;
  const cropW = W;

  // 최종 앱에 맞춘 최적화 해상도 (폭 360px x 높이 190px)
  const targetW = 360;
  const targetH = 190;

  for (let i = 0; i < frameFiles.length; i++) {
    const file = frameFiles[i];
    const filePath = path.join(rawFramesDir, file);

    const frameBuffer = await sharp(filePath)
      .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
      .resize(targetW, targetH, { fit: "contain" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = frameBuffer;
    const { width: fw, height: fh, channels } = info;

    const visited = new Uint8Array(fw * fh);
    const queue = [];

    // 민트색 배경 판별
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    const isMintBg = (r, g, b) => {
      const diff = Math.sqrt(
        (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
      );
      const isGreenish = g > r + 10 && g > b - 15 && g > 125;
      const isShadow = r > 110 && r < 185 && g > 150 && g < 215 && b > 140 && b < 195 && g > r + 5;
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
        data[pIdx + 3] = 0; // 완전 투명

        if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
        if (x < fw - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - fw]) queue.push([x, y - 1]);
        if (y < fh - 1 && !visited[idx + fw]) queue.push([x, y + 1]);
      }
    }

    // 안티에일리어싱 블렌딩
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

    const outStepPath = path.join(outFramesDir, `f_${String(i).padStart(3, "0")}.png`);
    await sharp(data, {
      raw: {
        width: fw,
        height: fh,
        channels: 4,
      },
    })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outStepPath);
  }

  // 매니페스트(프레임 수 메타데이터) 파일 작성
  fs.writeFileSync(
    path.join(outFramesDir, "manifest.json"),
    JSON.stringify({ frameCount: frameFiles.length, fps: 12, width: targetW, height: targetH })
  );

  fs.rmSync(rawFramesDir, { recursive: true, force: true });
  console.log(`🎉 10초 풀 시퀀스 (${frameFiles.length}개 프레임) 생성 완료!`);
}

extractFullNaturalWalk().catch(console.error);
