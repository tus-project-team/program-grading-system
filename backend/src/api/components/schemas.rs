use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct Problem {
    id: u64,
    title: String,
    body: String,
    test_cases: Vec<TestCase>,
    supported_languages: Vec<Language>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct ProblemCreate {
    title: String,
    body: String,
    test_cases: Vec<TestCase>,
    supported_languages: Vec<Language>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct ProblemUpdate {
    title: Option<String>,
    body: Option<String>,
    test_cases: Option<Vec<TestCase>>,
    supported_languages: Option<Vec<Language>>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct TestCase {
    input: String,
    output: String,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct Language {
    name: String,
    version: String,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct Submission {
    id: u64,
    problem_id: u64,
    student_id: u64,
    code: String,
    language: Language,
    result: SubmissionResult,
    test_results: Vec<TestResult>,
    submitted_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct SubmissionCreate {
    problem_id: u64,
    student_id: u64,
    code: String,
    language: Language,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct SubmissionResult {
    status: SubmissionStatus,
    message: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub struct TestResult {
    test_case_id: u64,
    status: TestStatus,
    message: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub enum SubmissionStatus {
    #[default]
    Accepted,
    WrongAnswer,
    RuntimeError,
    CompileError,
}

#[derive(Serialize, Deserialize, Clone, ToSchema, Default)]
pub enum TestStatus {
    #[default]
    Passed,
    Failed,
}
