pub mod converter;

use converter::{ConversionResult, Converter};
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Window,
};

static ALWAYS_ON_TOP: AtomicBool = AtomicBool::new(false);

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
fn toggle_always_on_top(window: Window) -> Result<bool, String> {
    let current = ALWAYS_ON_TOP.load(Ordering::SeqCst);
    let next = !current;
    window
        .set_always_on_top(next)
        .map_err(|e| format!("항상 위 설정 실패: {}", e))?;
    ALWAYS_ON_TOP.store(next, Ordering::SeqCst);
    Ok(next)
}

#[tauri::command]
fn start_drag_window(window: Window) {
    let _ = window.start_dragging();
}

#[tauri::command]
fn hide_window(window: Window) {
    let _ = window.hide();
}

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
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
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "열기 (Show)", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "숨기기 (Hide)", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "종료 (Quit)", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Neko Drop 🐾 - Data File Converter")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            convert_file,
            open_file_folder,
            toggle_always_on_top,
            start_drag_window,
            hide_window,
            exit_app,
            close_window,
            minimize_window
        ])
        .run(tauri::generate_context!())
        .expect("Tauri v2 애플리케이션 실행 중 오류가 발생했습니다.");
}
