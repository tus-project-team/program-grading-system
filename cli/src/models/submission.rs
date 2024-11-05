use super::problem::Language;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct SubmissionCreate {
    pub code: String,
    pub language: Language,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct SubmissionResponse {
    pub id: i32,
    pub code: String,
    #[serde(rename = "languageName")]
    pub language_name: String,
    #[serde(rename = "languageVersion")]
    pub language_version: String,
    pub language: Language,
    pub result: SubmissionResultResponse,
    #[serde(rename = "testResults")]
    pub test_results: Vec<SubmissionTestResult>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    #[serde(rename = "problemId")]
    pub problem_id: i32,
    #[serde(rename = "studentId")]
    pub student_id: i32,
    #[serde(rename = "resultId")]
    pub result_id: i32,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct SubmissionResultResponse {
    pub id: i32,
    #[serde(rename = "statusId")]
    pub status: String,
    pub message: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct SubmissionTestResult {
    pub id: i32,
    #[serde(rename = "statusId")]
    pub status: String,
    pub message: String,
    #[serde(rename = "testCaseId")]
    pub test_case_id: i32,
    #[serde(rename = "submissionId")]
    pub submission_id: i32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}
