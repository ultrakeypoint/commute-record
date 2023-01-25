use crate::schema::commute_records;
use serde::Serialize;

#[derive(Queryable, Serialize, Debug)]
pub struct CommuteRecord {
    pub id: i32,
    pub commute_date: String,
    pub commute_in_time: String,
    pub commute_out_time: String,
}

#[derive(Insertable, Serialize, Debug, Clone)]
#[table_name = "commute_records"]
pub struct NewCommuteRecord<'a> {
    pub commute_date: &'a str,
    pub commute_in_time: &'a str,
    pub commute_out_time: &'a str,
}

#[derive(AsChangeset, Insertable, Serialize, Debug, Clone)]
#[table_name = "commute_records"]
pub struct UpdateCommuteRecord<'a> {
    pub commute_in_time: &'a str,
    pub commute_out_time: &'a str,
}
