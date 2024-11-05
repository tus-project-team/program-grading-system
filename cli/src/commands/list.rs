use colored::Colorize;
use log::{debug, error};
use std::error::Error;

use crate::api::client::ApiClient;

pub async fn execute(client: &ApiClient) -> Result<(), Box<dyn Error>> {
    debug!("Executing list command");

    match client.get_problems().await {
        Ok(problems) => {
            println!("\n{}", "Available Problems:".bold());
            println!("{}", "=================".bold());

            if problems.is_empty() {
                println!("No problems available.");
                return Ok(());
            }

            for problem in problems {
                println!(
                    "{}: {} (Supported languages: {})",
                    problem.id.to_string().green(),
                    problem.title.white().bold(),
                    problem
                        .supported_languages
                        .iter()
                        .map(|l| format!("{} {}", l.name, l.version))
                        .collect::<Vec<_>>()
                        .join(", ")
                );
            }
            println!();
            Ok(())
        }
        Err(e) => {
            error!("Failed to fetch problems: {:?}", e);
            println!("Failed to fetch problems: {}", e.to_string().red());
            Err(e.into())
        }
    }
}
