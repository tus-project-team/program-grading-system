use colored::Colorize;
use log::{debug, error};
use std::error::Error;

use crate::api::client::{ApiClient, ApiError};

pub async fn execute(client: &ApiClient, id: i32) -> Result<(), Box<dyn Error>> {
    debug!("Executing show command for problem {}", id);

    match client.get_problem(id).await {
        Ok(problem) => {
            println!("\n{}", "Problem Details:".bold());
            println!("{}", "===============".bold());
            println!("ID: {}", problem.id.to_string().green());
            println!("Title: {}", problem.title.white().bold());
            println!("\nDescription:");
            println!("{}", problem.body);

            println!("\nSupported Languages:");
            for lang in problem.supported_languages {
                println!("- {} {}", lang.name, lang.version);
            }

            println!("\nSample Test Cases:");
            for (i, test) in problem.test_cases.iter().enumerate() {
                println!("\nTest Case {}:", i + 1);
                println!("Input:\n{}", test.input);
                println!("Expected Output:\n{}", test.output);
            }
            println!();
            Ok(())
        }
        Err(e) => {
            error!("Failed to fetch problem {}: {:?}", id, e);
            match e {
                ApiError::NotFound => {
                    println!("Problem not found: ID {}", id.to_string().red());
                }
                _ => {
                    println!("Failed to fetch problem: {}", e.to_string().red());
                }
            }
            Err(e.into())
        }
    }
}
