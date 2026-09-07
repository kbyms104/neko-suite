pub mod converter;

use converter::{ConversionResult, Converter};
use std::path::Path;
use tauri::Window;

#[tauri::command]
async fn convert_file(
    file_path: String,
    target_format: Option<String>,
) -> Result<ConversionResult, String> {
    // 백그라운드 블로킹 스레드 풀에서 고속 변환 연산 수행 (UI 스레드 멈춤 방지)
    tauri::async_runtime::spawn_blocking(move || {
        Converter::convert_file(&file_path, target_format.as_deref())
            .map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| format!("태스크 실행 오류: {}", e))?
}

#[tauri::command]
fn open_file_folder(file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    let parent = if path.is_file() {
        path.parent().unwrap_or(path)
    } else {
        path
    };

    open::that(parent).map_err(|e| format!("폴더 열기 실패: {}", e))
}

#[tauri::command]
fn close_window(window: Window) {
    let _ = window.close();
}

#[tauri::command]
fn minimize_window(window: Window) {
    let _ = window.minimize();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            convert_file,
            open_file_folder,
            close_window,
            minimize_window
        ])
        .run(tauri::generate_context!())
        .expect("Tauri v2 애플리케이션 실행 중 오류가 발생했습니다.");
}
