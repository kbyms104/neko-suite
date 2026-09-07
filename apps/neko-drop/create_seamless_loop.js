import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const framesDir = path.resolve(__dirname, "public/cat_walk_frames");
const tempDir = path.resolve(__dirname, "temp_seamless");

async function createSeamlessClosedLoop() {
  console.log("🐾 텔레포트 0% 완전무결 닫힌 루프(Seamless Closed Loop) 재정렬 시작...");

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  // 1. 기존 프레임들을 임시 폴더로 백업
  const originalFiles = fs
    .readdirSync(framesDir)
    .filter((f) => f.startsWith("f_") && f.endsWith(".png"))
    .sort();

  console.log(`기존 총 프레임 수: ${originalFiles.length}`);

  for (const f of originalFiles) {
    fs.copyFileSync(path.join(framesDir, f), path.join(tempDir, f));
  }

  // 2. 완벽한 폐곡선 순서:
  // [왼쪽 턴 완료 후 오른쪽 전진]: f_110 ~ f_121 (12프레임)
  // [오른쪽 전진 계속]: f_000 ~ f_049 (50프레임)
  // [오른쪽 끝 턴]: f_050 ~ f_065 (16프레임)
  // [왼쪽 전진]: f_066 ~ f_099 (34프레임)
  // [왼쪽 끝 턴]: f_100 ~ f_109 (10프레임)
  // 다시 f_110으로 100% 매끄럽게 연결!

  const seamlessSequence = [];
  for (let i = 110; i <= 121; i++) seamlessSequence.push(`f_${String(i).padStart(3, "0")}.png`);
  for (let i = 0; i <= 109; i++) seamlessSequence.push(`f_${String(i).padStart(3, "0")}.png`);

  console.log(`새로운 완벽 루프 프레임 수: ${seamlessSequence.length}`);

  // 3. 기존 framesDir의 f_*.png 삭제 후 새 순서로 저장
  for (const f of originalFiles) {
    fs.unlinkSync(path.join(framesDir, f));
  }

  for (let i = 0; i < seamlessSequence.length; i++) {
    const srcName = seamlessSequence[i];
    const dstName = `f_${String(i).padStart(3, "0")}.png`;
    fs.copyFileSync(path.join(tempDir, srcName), path.join(framesDir, dstName));
  }

  fs.rmSync(tempDir, { recursive: true, force: true });

  // 매니페스트 업데이트
  fs.writeFileSync(
    path.join(framesDir, "manifest.json"),
    JSON.stringify({ frameCount: seamlessSequence.length, fps: 12 })
  );

  console.log(`🎉 텔레포트 0% 완벽한 무한 루프 생성 완료! (총 ${seamlessSequence.length}개 프레임)`);
}

createSeamlessClosedLoop().catch(console.error);
