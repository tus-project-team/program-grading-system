use colored::Colorize;
use log::{debug, error, info};
use std::error::Error;
use std::io::{self, Write};
use std::path::Path;

use crate::api::client::{ApiClient, ApiError};
use crate::models::problem::Language;
use crate::models::submission::SubmissionCreate;

pub async fn execute(
    client: &ApiClient,
    id: i32,
    file: String,
    language: String,
    version: String,
) -> Result<(), Box<dyn Error>> {
    debug!("Executing submit command");
    debug!("Problem ID: {}", id);
    debug!("File: {}", file);
    debug!("Language: {} {}", language, version);

    let path = Path::new(&file);
    if !path.exists() {
        error!("File not found: {}", file);
        return Err(format!("File not found: {}", file).into());
    }

    let code = std::fs::read_to_string(&file)?;
    debug!("Source code length: {} bytes", code.len());

    if code.trim().is_empty() {
        error!("Source code file is empty: {}", file);
        return Err("Source code file is empty".into());
    }

    let submission = SubmissionCreate {
        code,
        language: Language {
            name: language,
            version,
        },
    };

    print!("Submitting solution... ");
    io::stdout().flush()?;

    match client.submit_solution(id, submission).await {
        Ok(response) => {
            println!("✓");
            info!("Submission successful");

            println!("\n{}", "Submission Results:".bold());
            println!("{}", "=================".bold());
            println!(
                "Status: {}",
                match response.result.status.as_str() {
                    "Accepted" => "Accepted ✓".green(),
                    "WrongAnswer" => "Wrong Answer ✗".red(),
                    "RuntimeError" => "Runtime Error ✗".red(),
                    "CompileError" => "Compile Error ✗".red(),
                    status => format!("{} ✗", status).red(),
                }
            );

            println!("Message: {}", response.result.message);

            println!("\nTest Results:");
            for result in response.test_results {
                let status_str = match result.status.as_str() {
                    "Passed" => "Passed ✓".green(),
                    "Failed" => "Failed ✗".red(),
                    status => format!("{} ✗", status).red(),
                };
                println!("Test Case {}: {}", result.test_case_id, status_str);
                if !result.message.is_empty() {
                    println!("  Message: {}", result.message);
                }
            }
            println!();
            Ok(())
        }
        Err(e) => {
            println!("✗");
            error!("Submission failed: {:?}", e);

            println!("\nSubmission failed:");
            match &e {
                ApiError::InvalidSubmission(msg) => {
                    println!("  Invalid submission: {}", msg.red());
                }
                ApiError::NotFound => {
                    println!("  Problem not found: ID {}", id.to_string().red());
                }
                ApiError::ServerError(msg) => {
                    println!("  Server error: {}", msg.red());
                }
                ApiError::Unknown { status, body } => {
                    println!("  Unexpected error ({}): {}", status, body.red());
                }
                ApiError::HttpError(err) => {
                    println!("  HTTP error: {}", err.to_string().red());
                }
            }
            Err(e.into())
        }
    }
}
