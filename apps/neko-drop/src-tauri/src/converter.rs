use std::fs::File;
use std::num::NonZeroUsize;
use std::path::{Path, PathBuf};
use std::time::Instant;

use calamine::{open_workbook_auto, Data, Range, Reader};
use polars::prelude::*;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConverterError {
    #[error("지원하지 않는 파일 포맷입니다: {0}")]
    UnsupportedFormat(String),

    #[error("지원하지 않는 대상 포맷 변환입니다: {0} -> {1}")]
    UnsupportedConversion(String, String),

    #[error("파일을 찾을 수 없습니다: {0}")]
    FileNotFound(String),

    #[error("데이터프레임 처리 오류: {0}")]
    PolarsError(#[from] PolarsError),

    #[error("Excel 파싱 오류: {0}")]
    ExcelError(String),

    #[error("JSON 파싱 오류: {0}")]
    JsonError(String),

    #[error("CSV 처리 오류: {0}")]
    CsvError(#[from] csv::Error),

    #[error("IO 입출력 오류: {0}")]
    IoError(#[from] std::io::Error),
}

impl serde::Serialize for ConverterError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConversionResult {
    pub source_path: String,
    pub output_path: String,
    pub format_from: String,
    pub format_to: String,
    pub row_count: usize,
    pub elapsed_ms: u128,
    pub file_size_bytes: u64,
}

pub struct Converter;

impl Converter {
    pub fn convert_file(
        input_path_str: &str,
        target_format_override: Option<&str>,
    ) -> Result<ConversionResult, ConverterError> {
        let start_time = Instant::now();
        let input_path = Path::new(input_path_str);

        if !input_path.exists() {
            return Err(ConverterError::FileNotFound(input_path_str.to_string()));
        }

        let extension = input_path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_lowercase())
            .ok_or_else(|| ConverterError::UnsupportedFormat("확장자 없음".to_string()))?;

        let (output_path, format_from, format_to, row_count) = match extension.as_str() {
            // 1. CSV 입력
            "csv" => {
                let target = target_format_override.unwrap_or("parquet").to_lowercase();
                match target.as_str() {
                    "json" => {
                        let out = Self::get_output_path(input_path, "json");
                        let rows = Self::csv_to_json(input_path, &out)?;
                        (out, "CSV".to_string(), "JSON".to_string(), rows)
                    }
                    "parquet" => {
                        let out = Self::get_output_path(input_path, "parquet");
                        let rows = Self::csv_to_parquet(input_path, &out)?;
                        (out, "CSV".to_string(), "Parquet".to_string(), rows)
                    }
                    other => {
                        return Err(ConverterError::UnsupportedConversion("CSV".into(), other.into()));
                    }
                }
            }

            // 2. Parquet 입력
            "parquet" => {
                let target = target_format_override.unwrap_or("csv").to_lowercase();
                match target.as_str() {
                    "json" => {
                        let out = Self::get_output_path(input_path, "json");
                        let rows = Self::parquet_to_json(input_path, &out)?;
                        (out, "Parquet".to_string(), "JSON".to_string(), rows)
                    }
                    "csv" => {
                        let out = Self::get_output_path(input_path, "csv");
                        let rows = Self::parquet_to_csv(input_path, &out)?;
                        (out, "Parquet".to_string(), "CSV".to_string(), rows)
                    }
                    other => {
                        return Err(ConverterError::UnsupportedConversion("Parquet".into(), other.into()));
                    }
                }
            }

            // 3. JSON / JSONL 입력
            "json" | "jsonl" => {
                let target = target_format_override.unwrap_or("csv").to_lowercase();
                match target.as_str() {
                    "parquet" => {
                        let out = Self::get_output_path(input_path, "parquet");
                        let rows = Self::json_to_parquet(input_path, &out)?;
                        (out, "JSON".to_string(), "Parquet".to_string(), rows)
                    }
                    "csv" => {
                        let out = Self::get_output_path(input_path, "csv");
                        let rows = Self::json_to_csv(input_path, &out)?;
                        (out, "JSON".to_string(), "CSV".to_string(), rows)
                    }
                    other => {
                        return Err(ConverterError::UnsupportedConversion("JSON".into(), other.into()));
                    }
                }
            }

            // 4. Excel (XLSX / XLS) 입력
            "xlsx" | "xls" => {
                let target = target_format_override.unwrap_or("csv").to_lowercase();
                match target.as_str() {
                    "parquet" => {
                        let out = Self::get_output_path(input_path, "parquet");
                        let rows = Self::xlsx_to_parquet(input_path, &out)?;
                        (out, "Excel".to_string(), "Parquet".to_string(), rows)
                    }
                    "json" => {
                        let out = Self::get_output_path(input_path, "json");
                        let rows = Self::xlsx_to_json(input_path, &out)?;
                        (out, "Excel".to_string(), "JSON".to_string(), rows)
                    }
                    "csv" => {
                        let out = Self::get_output_path(input_path, "csv");
                        let rows = Self::xlsx_to_csv(input_path, &out)?;
                        (out, "Excel".to_string(), "CSV".to_string(), rows)
                    }
                    other => {
                        return Err(ConverterError::UnsupportedConversion("Excel".into(), other.into()));
                    }
                }
            }

            other => {
                return Err(ConverterError::UnsupportedFormat(format!(
                    ".{} 포맷은 지원되지 않습니다.",
                    other
                )));
            }
        };

        let file_size_bytes = std::fs::metadata(&output_path)
            .map(|m| m.len())
            .unwrap_or(0);

        let elapsed_ms = start_time.elapsed().as_millis();

        Ok(ConversionResult {
            source_path: input_path_str.to_string(),
            output_path: output_path.to_string_lossy().to_string(),
            format_from,
            format_to,
            row_count,
            elapsed_ms,
            file_size_bytes,
        })
    }

    fn get_output_path(input_path: &Path, new_ext: &str) -> PathBuf {
        let parent = input_path.parent().unwrap_or_else(|| Path::new(""));
        let stem = input_path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("converted");

        let default_output = parent.join(format!("{}.{}", stem, new_ext));

        // 해당 파일이 존재하지 않고, 원본 파일 경로와도 다르면 기본 경로 사용
        if !default_output.exists() && default_output != input_path {
            return default_output;
        }

        // 이미 파일이 존재하거나 원본과 경로가 같은 경우: name (1).ext, name (2).ext ... 자동 넘버링
        let mut count = 1;
        loop {
            let candidate = parent.join(format!("{} ({}).{}", stem, count, new_ext));
            if !candidate.exists() && candidate != input_path {
                return candidate;
            }
            count += 1;
        }
    }

    // --- Core Converters ---

    /// CSV -> Parquet
    fn csv_to_parquet(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let mut df = LazyCsvReader::new(input)
            .with_has_header(true)
            .with_try_parse_dates(true)
            .with_infer_schema_length(Some(10000))
            .finish()?
            .collect()?;

        let row_count = df.height();
        let mut file = File::create(output)?;
        ParquetWriter::new(&mut file)
            .with_compression(ParquetCompression::Snappy)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// CSV -> JSON
    fn csv_to_json(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let mut df = LazyCsvReader::new(input)
            .with_has_header(true)
            .finish()?
            .collect()?;

        let row_count = df.height();
        let mut file = File::create(output)?;
        JsonWriter::new(&mut file)
            .with_json_format(JsonFormat::Json)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// Parquet -> CSV
    fn parquet_to_csv(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let file = File::open(input)?;
        let mut df = ParquetReader::new(file).finish()?;
        let row_count = df.height();

        let mut out_file = File::create(output)?;
        CsvWriter::new(&mut out_file)
            .include_header(true)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// Parquet -> JSON
    fn parquet_to_json(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let file = File::open(input)?;
        let mut df = ParquetReader::new(file).finish()?;
        let row_count = df.height();

        let mut out_file = File::create(output)?;
        JsonWriter::new(&mut out_file)
            .with_json_format(JsonFormat::Json)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// JSON -> CSV
    fn json_to_csv(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let file = File::open(input)?;
        let mut df = JsonReader::new(file)
            .with_json_format(JsonFormat::Json)
            .infer_schema_len(NonZeroUsize::new(1000))
            .finish()?;

        let row_count = df.height();
        let mut out_file = File::create(output)?;
        CsvWriter::new(&mut out_file)
            .include_header(true)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// JSON -> Parquet
    fn json_to_parquet(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let file = File::open(input)?;
        let mut df = JsonReader::new(file)
            .with_json_format(JsonFormat::Json)
            .infer_schema_len(NonZeroUsize::new(1000))
            .finish()?;

        let row_count = df.height();
        let mut out_file = File::create(output)?;
        ParquetWriter::new(&mut out_file)
            .with_compression(ParquetCompression::Snappy)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// XLSX -> CSV
    fn xlsx_to_csv(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let mut workbook = open_workbook_auto(input)
            .map_err(|e| ConverterError::ExcelError(e.to_string()))?;

        let sheet_names = workbook.sheet_names().to_vec();
        let first_sheet = sheet_names
            .first()
            .ok_or_else(|| ConverterError::ExcelError("엑셀 시트가 비어있습니다.".into()))?;

        let range = workbook
            .worksheet_range(first_sheet)
            .map_err(|e| ConverterError::ExcelError(e.to_string()))?;

        let row_count = Self::write_range_to_csv(&range, output)?;
        Ok(row_count)
    }

    /// XLSX -> Parquet (임시 CSV 메모리 파이프라인 거쳐 고속 Parquet 생성)
    fn xlsx_to_parquet(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let temp_csv_path = output.with_extension("tmp.csv");
        let row_count = Self::xlsx_to_csv(input, &temp_csv_path)?;
        
        let convert_res = Self::csv_to_parquet(&temp_csv_path, output);
        let _ = std::fs::remove_file(&temp_csv_path);
        
        convert_res.map(|_| row_count)
    }

    /// XLSX -> JSON
    fn xlsx_to_json(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let temp_csv_path = output.with_extension("tmp.csv");
        let row_count = Self::xlsx_to_csv(input, &temp_csv_path)?;
        
        let convert_res = Self::csv_to_json(&temp_csv_path, output);
        let _ = std::fs::remove_file(&temp_csv_path);
        
        convert_res.map(|_| row_count)
    }

    fn write_range_to_csv(range: &Range<Data>, output: &Path) -> Result<usize, ConverterError> {
        let file = File::create(output)?;
        let mut wtr = csv::WriterBuilder::new().from_writer(file);
        let mut count = 0;

        for row in range.rows() {
            let record: Vec<String> = row
                .iter()
                .map(|cell| match cell {
                    Data::Empty => "".to_string(),
                    Data::String(s) => s.trim().to_string(),
                    Data::Float(f) => f.to_string(),
                    Data::Int(i) => i.to_string(),
                    Data::Bool(b) => b.to_string(),
                    Data::DateTime(dt) => dt.to_string(),
                    Data::Error(e) => format!("{:?}", e),
                    Data::DateTimeIso(s) => s.clone(),
                    Data::DurationIso(s) => s.clone(),
                })
                .collect();

            wtr.write_record(&record)?;
            count += 1;
        }

        wtr.flush()?;
        Ok(if count > 0 { count - 1 } else { 0 })
    }
}
