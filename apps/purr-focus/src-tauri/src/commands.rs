use std::sync::atomic::{AtomicBool, Ordering};

static ALWAYS_ON_TOP: AtomicBool = AtomicBool::new(true);
static CLICK_THROUGH: AtomicBool = AtomicBool::new(false);

#[tauri::command]
pub fn set_click_through(window: tauri::Window, enable: bool) -> Result<bool, String> {
    window
        .set_ignore_cursor_events(enable)
        .map_err(|e| format!("클릭 투과 설정 실패: {}", e))?;
    CLICK_THROUGH.store(enable, Ordering::SeqCst);
    Ok(enable)
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
pub fn start_drag_window(window: tauri::Window) {
    let _ = window.start_dragging();
}

#[tauri::command]
pub fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
pub fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[tauri::command]
pub fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}
