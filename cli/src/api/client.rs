use log::{debug, error};
use reqwest::{header, Client, StatusCode};
use serde_json::json;
use thiserror::Error;

use crate::models::{problem::*, submission::*};

#[derive(Error, Debug)]
#[allow(dead_code)]
pub enum ApiError {
    #[error("HTTP error: {0}")]
    HttpError(#[from] reqwest::Error),

    #[error("Resource not found")]
    NotFound,

    #[error("Invalid submission: {0}")]
    InvalidSubmission(String),

    #[error("Server error: {0}")]
    ServerError(String),

    #[error("Unknown error: {status} - {body}")]
    Unknown { status: StatusCode, body: String },
}

pub struct ApiClient {
    client: Client,
    base_url: String,
}

impl ApiClient {
    pub fn new(base_url: String) -> Result<Self, reqwest::Error> {
        Ok(Self {
            client: Client::builder()
                .user_agent(concat!(
                    env!("CARGO_PKG_NAME"),
                    "/",
                    env!("CARGO_PKG_VERSION")
                ))
                .build()?,
            base_url,
        })
    }

    pub async fn get_problems(&self) -> Result<Vec<Problem>, ApiError> {
        let url = format!("{}/problems", self.base_url);
        debug!("Fetching problems from: {}", url);

        let response = self
            .client
            .get(&url)
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::ACCEPT, "application/json")
            .send()
            .await?;

        let status = response.status();
        debug!("Response status: {}", status);

        let response_text = response.text().await?;
        debug!("Response body: {}", response_text);

        match status {
            StatusCode::OK => match serde_json::from_str::<Vec<Problem>>(&response_text) {
                Ok(problems) => {
                    debug!("Successfully parsed {} problems", problems.len());
                    Ok(problems)
                }
                Err(e) => {
                    error!("Failed to parse response: {}", e);
                    Err(ApiError::Unknown {
                        status,
                        body: format!("Failed to parse response: {} - Body: {}", e, response_text),
                    })
                }
            },
            StatusCode::INTERNAL_SERVER_ERROR => {
                error!("Server error: {}", response_text);
                Err(ApiError::ServerError(response_text))
            }
            _ => {
                error!("Unexpected response: {} - {}", status, response_text);
                Err(ApiError::Unknown {
                    status,
                    body: response_text,
                })
            }
        }
    }

    pub async fn get_problem(&self, id: i32) -> Result<Problem, ApiError> {
        let url = format!("{}/problems/{}", self.base_url, id);
        debug!("Fetching problem {}: {}", id, url);

        let response = self
            .client
            .get(&url)
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::ACCEPT, "application/json")
            .send()
            .await?;

        let status = response.status();
        debug!("Response status: {}", status);

        let response_text = response.text().await?;
        debug!("Response body: {}", response_text);

        match status {
            StatusCode::OK => match serde_json::from_str(&response_text) {
                Ok(problem) => {
                    debug!("Successfully parsed problem {}", id);
                    Ok(problem)
                }
                Err(e) => {
                    error!("Failed to parse response: {}", e);
                    Err(ApiError::Unknown {
                        status,
                        body: format!("Failed to parse response: {} - Body: {}", e, response_text),
                    })
                }
            },
            StatusCode::NOT_FOUND => {
                error!("Problem not found: ID {}", id);
                Err(ApiError::NotFound)
            }
            StatusCode::INTERNAL_SERVER_ERROR => {
                error!("Server error: {}", response_text);
                Err(ApiError::ServerError(response_text))
            }
            _ => {
                error!("Unexpected response: {} - {}", status, response_text);
                Err(ApiError::Unknown {
                    status,
                    body: response_text,
                })
            }
        }
    }

    pub async fn submit_solution(
        &self,
        problem_id: i32,
        submission: SubmissionCreate,
    ) -> Result<SubmissionResponse, ApiError> {
        let url = format!("{}/problems/{}/submit", self.base_url, problem_id);
        debug!("Submission URL: {}", url);

        let language_name = submission
            .language
            .name
            .chars()
            .enumerate()
            .map(|(i, c)| {
                if i == 0 {
                    c.to_uppercase().next().unwrap()
                } else {
                    c.to_lowercase().next().unwrap()
                }
            })
            .collect::<String>();

        let json_body = json!({
            "code": submission.code,
            "language": {
                "name": language_name,
                "version": submission.language.version
            }
        });

        debug!(
            "Request body:\n{}",
            serde_json::to_string_pretty(&json_body).unwrap()
        );

        let response = self
            .client
            .post(&url)
            .header(header::CONTENT_TYPE, "application/json")
            .header(header::ACCEPT, "application/json")
            .json(&json_body)
            .send()
            .await?;

        let status = response.status();
        debug!("Response status: {}", status);

        let response_text = response.text().await?;
        debug!("Response body: {}", response_text);

        match status {
            StatusCode::CREATED | StatusCode::OK => match serde_json::from_str(&response_text) {
                Ok(submission_response) => {
                    debug!("Successfully parsed submission response");
                    Ok(submission_response)
                }
                Err(e) => {
                    error!("Failed to parse response: {}", e);
                    error!("Response text: {}", response_text);
                    Err(ApiError::Unknown {
                        status,
                        body: format!("Failed to parse response: {} - Body: {}", e, response_text),
                    })
                }
            },
            StatusCode::BAD_REQUEST => {
                error!("Bad request error occurred");
                let error_message = if response_text.is_empty() {
                    "Server returned no error message".to_string()
                } else {
                    response_text
                };
                Err(ApiError::InvalidSubmission(error_message))
            }
            StatusCode::NOT_FOUND => {
                error!("Problem not found: ID {}", problem_id);
                Err(ApiError::NotFound)
            }
            StatusCode::INTERNAL_SERVER_ERROR => {
                error!("Server error: {}", response_text);
                Err(ApiError::ServerError(response_text))
            }
            _ => Err(ApiError::Unknown {
                status,
                body: response_text,
            }),
        }
    }
}
