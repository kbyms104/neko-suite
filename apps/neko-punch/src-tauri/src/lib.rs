pub mod commands;

use commands::{
    close_window, exit_app, minimize_window, punch_process, scan_listening_ports,
    start_drag_window,
};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 시스템 트레이 메뉴 생성
            let show_i = MenuItem::with_id(app, "show", "열기 (Show)", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "숨기기 (Hide)", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "종료 (Quit)", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])?;

            // 트레이 아이콘 빌더
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Neko Punch 🐾 - Port Killer")
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
            scan_listening_ports,
            punch_process,
            exit_app,
            close_window,
            minimize_window,
            start_drag_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running neko punch application");
}
