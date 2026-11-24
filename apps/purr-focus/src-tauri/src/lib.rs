pub mod commands;

use commands::{
    close_window, exit_app, hide_window, minimize_window, set_click_through, start_drag_window,
    toggle_always_on_top, CLICK_THROUGH,
};
use std::sync::atomic::Ordering;
use std::time::Duration;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

fn disable_click_through(app: &tauri::AppHandle) {
    CLICK_THROUGH.store(false, Ordering::SeqCst);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_ignore_cursor_events(false);
    }
    let _ = app.emit("click-through-changed", false);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "보이기 (Show)", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "숨기기 (Hide)", true, None::<&str>)?;
            let unlock_i = MenuItem::with_id(
                app,
                "click_through_off",
                "클릭 투과 해제 (Disable Click-Through)",
                true,
                None::<&str>,
            )?;
            let quit_i = MenuItem::with_id(app, "quit", "종료 (Quit)", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &unlock_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Purr Focus 🐾 - Pomodoro Pet")
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
                    "click_through_off" => {
                        disable_click_through(app);
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
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
                                // 클릭 투과가 켜져 있는 상태에서 트레이 클릭 시 바로 조작 가능하도록 해제 및 포커스
                                if CLICK_THROUGH.load(Ordering::SeqCst) {
                                    disable_click_through(app);
                                    let _ = window.set_focus();
                                } else {
                                    let _ = window.hide();
                                }
                            } else {
                                disable_click_through(app);
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // 스마트 호버 감지기: 클릭 투과가 켜져 있어도 상단 컨트롤 바(44px) 위로 마우스가 오면 일시 해제
            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                let mut temp_unlocked = false;
                loop {
                    let active = CLICK_THROUGH.load(Ordering::SeqCst);
                    if !active {
                        temp_unlocked = false;
                        std::thread::sleep(Duration::from_millis(300));
                        continue;
                    }

                    if let (Ok(cursor), Some(window)) = (
                        app_handle.cursor_position(),
                        app_handle.get_webview_window("main"),
                    ) {
                        if let (Ok(pos), Ok(size), Ok(scale)) = (
                            window.outer_position(),
                            window.outer_size(),
                            window.scale_factor(),
                        ) {
                            let wx = pos.x as f64;
                            let wy = pos.y as f64;
                            let ww = size.width as f64;
                            let bar_h = 46.0 * scale;

                            let in_top_bar = cursor.x >= wx
                                && cursor.x <= wx + ww
                                && cursor.y >= wy
                                && cursor.y <= wy + bar_h;

                            if in_top_bar && !temp_unlocked {
                                let _ = window.set_ignore_cursor_events(false);
                                temp_unlocked = true;
                            } else if !in_top_bar && temp_unlocked {
                                let _ = window.set_ignore_cursor_events(true);
                                temp_unlocked = false;
                            }
                        }
                    }

                    std::thread::sleep(Duration::from_millis(120));
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_click_through,
            toggle_always_on_top,
            start_drag_window,
            hide_window,
            minimize_window,
            close_window,
            exit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running purr focus application");
}
