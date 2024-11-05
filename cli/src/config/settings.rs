use config::{Config, ConfigError, File};
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Debug, Deserialize, Serialize)]
pub struct Settings {
    pub api_endpoint: String,
}

impl Settings {
    pub fn new() -> Result<Self, ConfigError> {
        let proj_dirs = ProjectDirs::from("com", "shuiro", "shuiro")
            .expect("Failed to determine config directory");

        let config_dir = proj_dirs.config_dir();
        std::fs::create_dir_all(config_dir).expect("Failed to create config directory");

        let config_path = config_dir.join("config.toml");

        let s = Config::builder()
            .set_default("api_endpoint", "http://localhost:3000/api")?
            .add_source(File::from(config_path).required(false))
            .build()?;

        s.try_deserialize()
    }

    pub fn save(&self) -> Result<(), Box<dyn Error>> {
        let proj_dirs = ProjectDirs::from("com", "shuiro", "shuiro")
            .expect("Failed to determine config directory");

        let config_path = proj_dirs.config_dir().join("config.toml");
        let toml = toml::to_string_pretty(self)?;
        std::fs::write(config_path, toml)?;
        Ok(())
    }
}
