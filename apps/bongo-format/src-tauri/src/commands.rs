use arboard::Clipboard;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};

static ALWAYS_ON_TOP: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Serialize, Deserialize)]
pub struct CsvData {
    pub headers: Vec<String>,
    pub rows: Vec<Vec<String>>,
    pub delimiter: String,
    pub total_rows: usize,
    pub total_cols: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonFormatResult {
    pub formatted: String,
    pub is_valid: bool,
    pub error_message: Option<String>,
    pub line: Option<usize>,
    pub column: Option<usize>,
    pub is_array: bool,
    pub item_count: usize,
}

#[tauri::command]
pub fn read_clipboard() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| format!("클립보드 열기 실패: {}", e))?;
    clipboard.get_text().map_err(|e| format!("클립보드 읽기 실패: {}", e))
}

#[tauri::command]
pub fn write_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new().map_err(|e| format!("클립보드 열기 실패: {}", e))?;
    clipboard.set_text(text).map_err(|e| format!("클립보드 쓰기 실패: {}", e))
}

#[tauri::command]
pub fn format_sql_cmd(query: String, indent_spaces: Option<u8>, uppercase: Option<bool>) -> Result<String, String> {
    let indent = indent_spaces.unwrap_or(2);
    let upper = uppercase.unwrap_or(true);

    let options = sqlformat::FormatOptions {
        indent: sqlformat::Indent::Spaces(indent),
        uppercase: upper,
        lines_between_queries: 1,
    };

    let formatted = sqlformat::format(&query, &sqlformat::QueryParams::None, options);
    Ok(formatted)
}

#[tauri::command]
pub fn format_json_cmd(raw_json: String, indent_spaces: Option<usize>, minify: Option<bool>) -> Result<JsonFormatResult, String> {
    let trimmed = raw_json.trim();
    if trimmed.is_empty() {
        return Ok(JsonFormatResult {
            formatted: String::new(),
            is_valid: true,
            error_message: None,
            line: None,
            column: None,
            is_array: false,
            item_count: 0,
        });
    }

    match serde_json::from_str::<serde_json::Value>(trimmed) {
        Ok(value) => {
            let is_array = value.is_array();
            let item_count = if let Some(arr) = value.as_array() {
                arr.len()
            } else if let Some(obj) = value.as_object() {
                obj.len()
            } else {
                1
            };

            let formatted = if minify.unwrap_or(false) {
                serde_json::to_string(&value).map_err(|e| e.to_string())?
            } else {
                let spaces = indent_spaces.unwrap_or(2);
                let indent_bytes = vec![b' '; spaces];
                let formatter = serde_json::ser::PrettyFormatter::with_indent(&indent_bytes);
                let mut buf = Vec::new();
                let mut ser = serde_json::Serializer::with_formatter(&mut buf, formatter);
                value.serialize(&mut ser).map_err(|e| e.to_string())?;
                String::from_utf8(buf).map_err(|e| e.to_string())?
            };

            Ok(JsonFormatResult {
                formatted,
                is_valid: true,
                error_message: None,
                line: None,
                column: None,
                is_array,
                item_count,
            })
        }
        Err(err) => {
            Ok(JsonFormatResult {
                formatted: raw_json,
                is_valid: false,
                error_message: Some(err.to_string()),
                line: Some(err.line()),
                column: Some(err.column()),
                is_array: false,
                item_count: 0,
            })
        }
    }
}

#[tauri::command]
pub fn parse_csv_cmd(raw_csv: String, delimiter: Option<String>) -> Result<CsvData, String> {
    let trimmed = raw_csv.trim();
    if trimmed.is_empty() {
        return Ok(CsvData {
            headers: Vec::new(),
            rows: Vec::new(),
            delimiter: ",".to_string(),
            total_rows: 0,
            total_cols: 0,
        });
    }

    // 구분자 자동 감지 (지정되지 않은 경우)
    let delim_str = delimiter.unwrap_or_else(|| {
        let first_line = trimmed.lines().next().unwrap_or("");
        let comma_count = first_line.matches(',').count();
        let tab_count = first_line.matches('\t').count();
        let semi_count = first_line.matches(';').count();
        let pipe_count = first_line.matches('|').count();

        if tab_count > comma_count && tab_count >= semi_count && tab_count >= pipe_count {
            "\t".to_string()
        } else if semi_count > comma_count && semi_count >= pipe_count {
            ";".to_string()
        } else if pipe_count > comma_count {
            "|".to_string()
        } else {
            ",".to_string()
        }
    });

    let delim_byte = delim_str.as_bytes().first().copied().unwrap_or(b',');

    let mut rdr = csv::ReaderBuilder::new()
        .delimiter(delim_byte)
        .flexible(true)
        .has_headers(true)
        .from_reader(trimmed.as_bytes());

    let headers: Vec<String> = match rdr.headers() {
        Ok(h) => h.iter().map(|s| s.to_string()).collect(),
        Err(e) => return Err(format!("CSV 헤더 파싱 실패: {}", e)),
    };

    let total_cols = headers.len();
    let mut rows = Vec::new();

    for result in rdr.records() {
        match result {
            Ok(record) => {
                let mut row: Vec<String> = record.iter().map(|s| s.to_string()).collect();
                // 컬럼 수 불일치 시 패딩
                if row.len() < total_cols {
                    row.resize(total_cols, String::new());
                }
                rows.push(row);
            }
            Err(e) => {
                // 에러 행은 단일 컬럼으로 보존
                rows.push(vec![format!("(Parse Error: {})", e)]);
            }
        }
    }

    let total_rows = rows.len();

    Ok(CsvData {
        headers,
        rows,
        delimiter: delim_str,
        total_rows,
        total_cols,
    })
}

#[tauri::command]
pub fn toggle_always_on_top(window: tauri::Window) -> Result<bool, String> {
    let current = ALWAYS_ON_TOP.load(Ordering::SeqCst);
    let next = !current;
    window
        .set_always_on_top(next)
        .map_err(|e| format!("항상 위 설정 실패: {}", e))?;
    ALWAYS_ON_TOP.store(next, Ordering::SeqCst);
    Ok(next)
}

#[tauri::command]
pub fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
pub fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
pub fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
pub fn start_drag_window(window: tauri::Window) {
    let _ = window.start_dragging();
}
