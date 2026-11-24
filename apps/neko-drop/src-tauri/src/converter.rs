use std::fs::File;
use std::io::{Cursor, Write};
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
                        let rows = Self::csv_to_json(input_path, &out, false)?;
                        (out, "CSV".to_string(), "JSON".to_string(), rows)
                    }
                    "jsonl" => {
                        let out = Self::get_output_path(input_path, "jsonl");
                        let rows = Self::csv_to_json(input_path, &out, true)?;
                        (out, "CSV".to_string(), "JSONL".to_string(), rows)
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
                        let rows = Self::parquet_to_json(input_path, &out, false)?;
                        (out, "Parquet".to_string(), "JSON".to_string(), rows)
                    }
                    "jsonl" => {
                        let out = Self::get_output_path(input_path, "jsonl");
                        let rows = Self::parquet_to_json(input_path, &out, true)?;
                        (out, "Parquet".to_string(), "JSONL".to_string(), rows)
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
                let prefer_lines = extension == "jsonl";
                let from_label = if prefer_lines { "JSONL" } else { "JSON" };
                let target = target_format_override.unwrap_or("csv").to_lowercase();
                match target.as_str() {
                    "parquet" => {
                        let out = Self::get_output_path(input_path, "parquet");
                        let rows = Self::json_to_parquet(input_path, &out, prefer_lines)?;
                        (out, from_label.to_string(), "Parquet".to_string(), rows)
                    }
                    "csv" => {
                        let out = Self::get_output_path(input_path, "csv");
                        let rows = Self::json_to_csv(input_path, &out, prefer_lines)?;
                        (out, from_label.to_string(), "CSV".to_string(), rows)
                    }
                    "json" => {
                        let out = Self::get_output_path(input_path, "json");
                        let rows = Self::json_to_json(input_path, &out, prefer_lines, false)?;
                        (out, from_label.to_string(), "JSON".to_string(), rows)
                    }
                    "jsonl" => {
                        let out = Self::get_output_path(input_path, "jsonl");
                        let rows = Self::json_to_json(input_path, &out, prefer_lines, true)?;
                        (out, from_label.to_string(), "JSONL".to_string(), rows)
                    }
                    other => {
                        return Err(ConverterError::UnsupportedConversion(from_label.into(), other.into()));
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
                        let rows = Self::xlsx_to_json(input_path, &out, false)?;
                        (out, "Excel".to_string(), "JSON".to_string(), rows)
                    }
                    "jsonl" => {
                        let out = Self::get_output_path(input_path, "jsonl");
                        let rows = Self::xlsx_to_json(input_path, &out, true)?;
                        (out, "Excel".to_string(), "JSONL".to_string(), rows)
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

    fn write_json_df(df: &mut DataFrame, output: &Path, as_lines: bool) -> Result<(), ConverterError> {
        let mut file = File::create(output)?;
        let format = if as_lines {
            JsonFormat::JsonLines
        } else {
            JsonFormat::Json
        };
        JsonWriter::new(&mut file).with_json_format(format).finish(df)?;
        Ok(())
    }

    fn read_json_df(input: &Path, prefer_lines: bool) -> Result<DataFrame, ConverterError> {
        let primary = if prefer_lines {
            JsonFormat::JsonLines
        } else {
            JsonFormat::Json
        };
        let fallback = if prefer_lines {
            JsonFormat::Json
        } else {
            JsonFormat::JsonLines
        };

        let file = File::open(input)?;
        match JsonReader::new(file)
            .with_json_format(primary)
            .infer_schema_len(NonZeroUsize::new(1000))
            .finish()
        {
            Ok(df) => Ok(df),
            Err(primary_err) => {
                let file2 = File::open(input)?;
                JsonReader::new(file2)
                    .with_json_format(fallback)
                    .infer_schema_len(NonZeroUsize::new(1000))
                    .finish()
                    .map_err(|_| ConverterError::PolarsError(primary_err))
            }
        }
    }

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

    /// CSV -> JSON / JSONL
    fn csv_to_json(input: &Path, output: &Path, as_lines: bool) -> Result<usize, ConverterError> {
        let mut df = LazyCsvReader::new(input)
            .with_has_header(true)
            .with_try_parse_dates(true)
            .with_infer_schema_length(Some(10000))
            .finish()?
            .collect()?;

        let row_count = df.height();
        Self::write_json_df(&mut df, output, as_lines)?;
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

    /// Parquet -> JSON / JSONL
    fn parquet_to_json(input: &Path, output: &Path, as_lines: bool) -> Result<usize, ConverterError> {
        let file = File::open(input)?;
        let mut df = ParquetReader::new(file).finish()?;
        let row_count = df.height();

        Self::write_json_df(&mut df, output, as_lines)?;
        Ok(row_count)
    }

    /// JSON / JSONL -> CSV
    fn json_to_csv(input: &Path, output: &Path, prefer_lines: bool) -> Result<usize, ConverterError> {
        let mut df = Self::read_json_df(input, prefer_lines)?;
        let row_count = df.height();

        let mut out_file = File::create(output)?;
        CsvWriter::new(&mut out_file)
            .include_header(true)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// JSON / JSONL -> Parquet
    fn json_to_parquet(input: &Path, output: &Path, prefer_lines: bool) -> Result<usize, ConverterError> {
        let mut df = Self::read_json_df(input, prefer_lines)?;
        let row_count = df.height();

        let mut out_file = File::create(output)?;
        ParquetWriter::new(&mut out_file)
            .with_compression(ParquetCompression::Snappy)
            .finish(&mut df)?;

        Ok(row_count)
    }

    /// JSON <-> JSONL
    fn json_to_json(
        input: &Path,
        output: &Path,
        prefer_lines: bool,
        as_lines: bool,
    ) -> Result<usize, ConverterError> {
        let mut df = Self::read_json_df(input, prefer_lines)?;
        let row_count = df.height();
        Self::write_json_df(&mut df, output, as_lines)?;
        Ok(row_count)
    }

    /// Excel first sheet range helper
    fn load_excel_first_sheet(input: &Path) -> Result<Range<Data>, ConverterError> {
        let mut workbook = open_workbook_auto(input)
            .map_err(|e| ConverterError::ExcelError(e.to_string()))?;

        let sheet_names = workbook.sheet_names().to_vec();
        let first_sheet = sheet_names
            .first()
            .ok_or_else(|| ConverterError::ExcelError("엑셀 시트가 비어있습니다.".into()))?;

        workbook
            .worksheet_range(first_sheet)
            .map_err(|e| ConverterError::ExcelError(e.to_string()))
    }

    /// XLSX -> CSV (직접 파일 스트리밍)
    fn xlsx_to_csv(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let range = Self::load_excel_first_sheet(input)?;
        let file = File::create(output)?;
        Self::write_range_to_csv_writer(&range, file)
    }

    /// XLSX -> Polars DataFrame (디스크 임시 파일 없이 인메모리 변환)
    fn xlsx_to_df(input: &Path) -> Result<(DataFrame, usize), ConverterError> {
        let range = Self::load_excel_first_sheet(input)?;
        let mut buffer: Vec<u8> = Vec::new();
        let row_count = Self::write_range_to_csv_writer(&range, &mut buffer)?;

        let df = CsvReadOptions::default()
            .with_has_header(true)
            .with_infer_schema_length(Some(10000))
            .into_reader_with_file_handle(Cursor::new(buffer))
            .finish()?;

        Ok((df, row_count))
    }

    /// XLSX -> Parquet (인메모리 파이프라인)
    fn xlsx_to_parquet(input: &Path, output: &Path) -> Result<usize, ConverterError> {
        let (mut df, row_count) = Self::xlsx_to_df(input)?;
        let mut file = File::create(output)?;
        ParquetWriter::new(&mut file)
            .with_compression(ParquetCompression::Snappy)
            .finish(&mut df)?;
        Ok(row_count)
    }

    /// XLSX -> JSON / JSONL (인메모리 파이프라인)
    fn xlsx_to_json(input: &Path, output: &Path, as_lines: bool) -> Result<usize, ConverterError> {
        let (mut df, row_count) = Self::xlsx_to_df(input)?;
        Self::write_json_df(&mut df, output, as_lines)?;
        Ok(row_count)
    }

    fn write_range_to_csv_writer<W: Write>(
        range: &Range<Data>,
        writer: W,
    ) -> Result<usize, ConverterError> {
        let mut wtr = csv::WriterBuilder::new().from_writer(writer);
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
