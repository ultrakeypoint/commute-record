#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::SystemTray;
use tauri::{SystemTrayMenu};

fn main() {
    let tray_menu = SystemTrayMenu::new();
    let system_tray = SystemTray::new().with_menu(tray_menu);
        tauri::Builder::default()
            .system_tray(system_tray)
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
}
