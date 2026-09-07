import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(__dirname, "src/assets/cat.png");
const outputDir = path.resolve(__dirname, "src/assets");

async function processCatSprites() {
  console.log("🐾 고양이 이미지 4분할 및 배경 투명화 처리를 시작합니다...");

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  console.log(`원본 해상도: ${width}x${height}`);

  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  // 흰색 구분선 여백 제외
  const margin = Math.floor(width * 0.012);

  const quadrants = [
    {
      name: "cat_walk.png",
      left: margin,
      top: margin,
      w: halfW - margin * 2,
      h: halfH - margin * 2,
      desc: "1. 좌상: 걷는 고양이 (산책 모드)",
    },
    {
      name: "cat_sit.png",
      left: halfW + margin,
      top: margin,
      w: halfW - margin * 2,
      h: halfH - margin * 2,
      desc: "2. 우상: 앉아있는 고양이 (정면 대기)",
    },
    {
      name: "cat_open.png",
      left: margin,
      top: halfH + margin,
      w: halfW - margin * 2,
      h: halfH - margin * 2,
      desc: "3. 좌하: 입 크게 벌린 고양이 (드래그 & 먹방)",
    },
    {
      name: "cat_happy.png",
      left: halfW + margin,
      top: halfH + margin,
      w: halfW - margin * 2,
      h: halfH - margin * 2,
      desc: "4. 우하: 젤리 발 인사 & 하트 고양이 (성공)",
    },
  ];

  for (const q of quadrants) {
    // 1. 영역 크롭
    const croppedBuffer = await sharp(inputPath)
      .extract({ left: q.left, top: q.top, width: q.w, height: q.h })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = croppedBuffer;
    const { width: cropW, height: cropH, channels } = info;

    // 2. 외곽 FloodFill로 민트색 배경 투명화
    const visited = new Uint8Array(cropW * cropH);
    const queue = [];

    // 모서리 픽셀의 배경색 샘플링 (민트색: R~150-180, G~210-230, B~190-210)
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    const isBgColor = (r, g, b) => {
      // 민트색 배경 판별 (초록/청록 기운이 강한 색상)
      const diff = Math.sqrt(
        (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
      );
      // 배경색과 가깝거나, 초록빛이 강하고 밝은 영역
      const isMint = g > r + 15 && g > b - 15 && g > 150;
      return diff < 45 || (isMint && diff < 85);
    };

    // 가장자리 외곽 픽셀들을 큐에 등록
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
        // 배경이므로 알파를 0(완전 투명)으로 설정
        data[pIdx + 3] = 0;

        // 4방향 확장
        if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
        if (x < cropW - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - cropW]) queue.push([x, y - 1]);
        if (y < cropH - 1 && !visited[idx + cropW]) queue.push([x, y + 1]);
      }
    }

    // 3. 가장자리 부드러운 블렌딩 (Anti-aliasing feathering)
    for (let y = 1; y < cropH - 1; y++) {
      for (let x = 1; x < cropW - 1; x++) {
        const idx = y * cropW + x;
        const pIdx = idx * channels;

        if (data[pIdx + 3] > 0) {
          // 주변에 투명 픽셀이 있는지 확인
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
            if (diff < 75) {
              data[pIdx + 3] = Math.max(0, Math.min(255, (diff / 75) * 255));
            }
          }
        }
      }
    }

    const outPath = path.join(outputDir, q.name);
    await sharp(data, {
      raw: {
        width: cropW,
        height: cropH,
        channels: 4,
      },
    })
      .trim() // 불필요한 여백 자동 트리밍
      .png()
      .toFile(outPath);

    console.log(`✅ ${q.desc} ➔ ${q.name} 생성 완료!`);
  }

  console.log("\n🎉 모든 고양이 스프라이트 분할 및 투명화 완료!");
}

processCatSprites().catch(console.error);
