use clap::{Parser, Subcommand};
use colored::Colorize;
use env_logger::Env;
use log::debug;
use std::error::Error;

mod api;
mod commands;
mod config;
mod models;

use crate::api::client::ApiClient;
use crate::config::settings::Settings;

#[derive(Parser)]
#[command(name = "shuiro", about = "A CLI tool for Shuiro", version, author)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Config {
        #[arg(short, long)]
        api: Option<String>,

        #[arg(short, long)]
        show: bool,
    },
    List,
    Show {
        id: i32,
    },
    Submit {
        id: i32,
        file: String,
        language: String,
        version: String,
    },
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let env = Env::default()
        .filter_or("RUST_LOG", "info")
        .write_style_or("RUST_LOG_STYLE", "always");

    env_logger::init_from_env(env);

    debug!("Starting shuiro CLI");

    let cli = Cli::parse();
    let settings = Settings::new()?;

    debug!("Using API endpoint: {}", settings.api_endpoint);

    let api_endpoint = settings.api_endpoint.clone();
    let client = ApiClient::new(api_endpoint).expect("Failed to create API client");

    match cli.command {
        Commands::Config { api, show } => {
            if show {
                println!("\n{}", "Current Configuration:".bold());
                println!("{}", "====================".bold());
                println!("API Endpoint: {}", settings.api_endpoint);
                println!();
                return Ok(());
            }

            if let Some(api_url) = api {
                let mut new_settings = settings;
                new_settings.api_endpoint = api_url;
                new_settings.save()?;
                println!("✓ Configuration updated successfully");
            }
        }
        Commands::List => {
            commands::list::execute(&client).await?;
        }
        Commands::Show { id } => {
            commands::show::execute(&client, id).await?;
        }
        Commands::Submit {
            id,
            file,
            language,
            version,
        } => {
            commands::submit::execute(&client, id, file, language, version).await?;
        }
    }

    Ok(())
}
