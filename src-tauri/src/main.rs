#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use diesel_migrations::embed_migrations;
use std::sync::Mutex;

#[macro_use]
extern crate diesel;
#[macro_use]
extern crate diesel_migrations;
embed_migrations!("../migrations/");

use diesel::prelude::*;
pub mod db;
pub mod schema;

#[tauri::command]
fn commute_record_create(
    commute_date: String,
    commute_in_time: String,
    commute_out_time: String,
    state: tauri::State<AppState>,
) -> String {
    let conn = state.conn.lock().unwrap();
    db::commute_record_create(&conn, &commute_date, &commute_in_time, &commute_out_time).to_string()
}

#[tauri::command]
fn commute_record_update(
    id: i32,
    commute_in_time: String,
    commute_out_time: String,
    state: tauri::State<AppState>, 
) -> String {
    let conn = state.conn.lock().unwrap();
    db::commute_record_update(&conn, id, &commute_in_time, &commute_out_time).to_string()
}

#[tauri::command]
fn commute_record_list(state: tauri::State<AppState>) -> String {
    let con = state.conn.lock().unwrap();
    db::commute_record_list(&con)
}

struct AppState {
    conn: Mutex<SqliteConnection>,
}

fn main() {

    let conn = db::establish_connection();
    diesel_migrations::run_pending_migrations(&conn).expect("Error migrating");

    let state = AppState {
        conn: Mutex::new(db::establish_connection()),
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commute_record_create,
            commute_record_update,
            commute_record_list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
