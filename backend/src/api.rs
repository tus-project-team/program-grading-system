use axum::Router;
use utoipa::OpenApi;

use crate::components::Problem;

mod problems;

#[derive(OpenApi)]
#[openapi(
    components(schemas(Problem)),
    nest(
        (path = "/problems", api = problems::Api)
    ),
)]
pub struct Api;

pub fn router() -> Router {
    Router::new().nest("/problems", problems::router())
}
