extern crate dotenv;

pub mod models;
use crate::schema::*;
use diesel::prelude::*;
use dotenv::dotenv;
use models::{CommuteRecord, NewCommuteRecord, UpdateCommuteRecord};
use std::env;

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

pub fn commute_record_create(
    conn: &SqliteConnection,
    commute_date: &str,
    commute_in_time: &str,
    commute_out_time: &str,
) -> String {
    let new_commute_record = NewCommuteRecord {
        commute_date,
        commute_in_time,
        commute_out_time,
    };
    let commute_record = diesel::insert_into(commute_records::table)
        .values(&new_commute_record)
        .execute(conn)
        .expect("Error saving new post");
    let commute_record_json = serde_json::to_string(&commute_record).unwrap();
    commute_record_json
}

pub fn commute_record_update(
    conn: &SqliteConnection,
    qid: i32,
    commute_in_time: &str,
    commute_out_time: &str,
) -> String {

    use commute_records::dsl::{id};

    diesel::update(commute_records::dsl::commute_records.filter(id.eq(&qid)))
    .set(&UpdateCommuteRecord {
        commute_in_time: commute_in_time,
        commute_out_time: commute_out_time,
    })
    .execute(conn)
    .expect("Error updating");
    
    let updated = commute_records::dsl::commute_records
        .filter(id.eq(&qid))
        .first::<CommuteRecord>(conn)
        .expect("Todo not found");

    serde_json::to_string(&updated).unwrap()
}

pub fn commute_record_list(conn: &SqliteConnection) -> String {
    let all_commute_record = commute_records::dsl::commute_records
        .load::<CommuteRecord>(conn)
        .expect("Expect loading commute records");
    let serialized = serde_json::to_string(&all_commute_record).unwrap();
    serialized
}