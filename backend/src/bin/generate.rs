use std::{fs, io};

use backend::Api;
use utoipa::OpenApi;

fn main() -> Result<(), io::Error> {
    let schema = Api::openapi().to_json()?;
    fs::create_dir_all("../generated/openapi")?;
    fs::write("../generated/openapi/schema.json", schema)?;

    Ok(())
}
