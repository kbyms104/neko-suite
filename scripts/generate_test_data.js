import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../test_data");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("🐾 Neko Drop 테스트 파일 생성을 시작합니다...\n");

// 1. 소형 CSV 파일 (1,000행)
function generateSmallCSV() {
  const filePath = path.join(outputDir, "01_small_sales_1k.csv");
  const headers = ["transaction_id", "user_id", "product_name", "category", "price", "quantity", "timestamp"];
  const products = ["고양이 츄르", "스크래쳐", "참치 캔", "레이저 포인터", "캣타워", "깃털 낚싯대", "모래 화장실", "자동 급식기"];
  const categories = ["간식", "가구", "장난감", "위생"];

  const rows = [headers.join(",")];
  for (let i = 1; i <= 1000; i++) {
    const prod = products[i % products.length];
    const cat = categories[i % categories.length];
    const price = 5000 + (i % 20) * 1500;
    const qty = (i % 5) + 1;
    const date = new Date(Date.now() - i * 3600000).toISOString();
    rows.push(`TXN_${i.toString().padStart(6, "0")},USER_${(i % 150) + 1},${prod},${cat},${price},${qty},${date}`);
  }

  fs.writeFileSync(filePath, rows.join("\n"), "utf8");
  console.log(`✅ [1/5] 소형 CSV 생성 완료 (1,000행): ${filePath}`);
}

// 2. 대용량 성능 검증용 CSV (100,000행 - 10만 행 Polars 초고속 변환 벤치마크)
function generateLargeCSV() {
  const filePath = path.join(outputDir, "02_large_financial_100k.csv");
  const headers = ["id", "symbol", "bid_price", "ask_price", "volume", "volatility", "is_trade", "timestamp"];
  const symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT", "ADA/USDT"];

  const writeStream = fs.createWriteStream(filePath, { encoding: "utf8" });
  writeStream.write(headers.join(",") + "\n");

  const totalRows = 100000;
  for (let i = 1; i <= totalRows; i++) {
    const symbol = symbols[i % symbols.length];
    const basePrice = 1000 + (i % 500) * 2.5;
    const bid = (basePrice - 0.5).toFixed(2);
    const ask = (basePrice + 0.5).toFixed(2);
    const vol = ((i % 100) + 1) * 12.35;
    const vola = (0.015 + (i % 10) * 0.002).toFixed(4);
    const isTrade = i % 3 === 0 ? "true" : "false";
    const ts = new Date(Date.now() - (totalRows - i) * 1000).toISOString();

    writeStream.write(`${i},${symbol},${bid},${ask},${vol.toFixed(2)},${vola},${isTrade},${ts}\n`);
  }

  writeStream.end();
  console.log(`✅ [2/5] 대용량 CSV 생성 완료 (100,000행 성능 테스트): ${filePath}`);
}

// 3. JSON 배열 파일 (10,000건)
function generateJSON() {
  const filePath = path.join(outputDir, "03_users_stream_10k.json");
  const roles = ["admin", "developer", "designer", "tester", "operator"];
  const cities = ["Seoul", "Tokyo", "San Francisco", "London", "Berlin", "Singapore"];

  const records = [];
  for (let i = 1; i <= 10000; i++) {
    records.push({
      user_id: `USR_${i.toString().padStart(6, "0")}`,
      username: `neko_user_${i}`,
      email: `cat_${i}@nekosuite.dev`,
      role: roles[i % roles.length],
      city: cities[i % cities.length],
      login_count: (i * 7) % 320,
      is_active: i % 4 !== 0,
      score: ((i * 13.5) % 100).toFixed(2),
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf8");
  console.log(`✅ [3/5] JSON 파일 생성 완료 (10,000건 객체 배열): ${filePath}`);
}

// 4. Excel XLSX 파일 (5,000행 Calamine 파싱 검증)
function generateXLSX() {
  const filePath = path.join(outputDir, "04_quarterly_sales_5k.xlsx");
  const headers = ["Quarter", "Region", "Store_Code", "Item_Name", "Units_Sold", "Revenue_KRW", "Profit_Rate"];
  const regions = ["강남구", "마포구", "판교", "해운대", "유성구", "수성구"];
  const items = ["프리미엄 츄르 50P", "원목 캣타워 Pro", "두부모래 6L", "스마트 자동급수기", "캣닢 쿠션"];

  const data = [headers];
  for (let i = 1; i <= 5000; i++) {
    const qtr = `2026-Q${(i % 4) + 1}`;
    const reg = regions[i % regions.length];
    const store = `STORE_${(i % 25) + 101}`;
    const item = items[i % items.length];
    const units = (i % 30) + 5;
    const rev = units * (25000 + (i % 10) * 5000);
    const profit = ((18 + (i % 15) * 1.2) / 100).toFixed(3);

    data.push([qtr, reg, store, item, units, rev, parseFloat(profit)]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sales_Performance");
  XLSX.writeFile(wb, filePath);

  console.log(`✅ [4/5] Excel XLSX 생성 완료 (5,000행): ${filePath}`);
}

// 5. 미지원 파일들 (Reject / 냥펀치 모션 검증용)
function generateRejectFiles() {
  const txtPath = path.join(outputDir, "05_reject_sample.txt");
  fs.writeFileSync(
    txtPath,
    "안녕하세요! 이 파일은 텍스트 문서입니다.\nNeko Drop에 드래그하면 고양이가 냥펀치로 쳐내는지 확인해 보세요! 🐾",
    "utf8"
  );

  const pdfPath = path.join(outputDir, "06_reject_document.pdf");
  fs.writeFileSync(pdfPath, "%PDF-1.4 ... Dummy PDF Header for test ...", "utf8");

  console.log(`✅ [5/5] 미지원 테스트 파일 생성 완료 (.txt, .pdf): ${outputDir}`);
}

generateSmallCSV();
generateLargeCSV();
generateJSON();
generateXLSX();
generateRejectFiles();

console.log("\n🎉 모든 테스트 데이터가 성공적으로 준비되었습니다!");
