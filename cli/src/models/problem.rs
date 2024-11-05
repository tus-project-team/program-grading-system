use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct Problem {
    pub id: i32,
    pub title: String,
    pub body: String,
    pub supported_languages: Vec<Language>,
    pub test_cases: Vec<TestCase>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Language {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Deserialize)]
pub struct TestCase {
    pub input: String,
    pub output: String,
}
