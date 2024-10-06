use axum::Router;
use utoipa::OpenApi;

use crate::components::schemas::{
    Language, Problem, ProblemCreate, ProblemUpdate, Submission, SubmissionCreate, TestCase,
};

mod problems;

#[derive(OpenApi)]
#[openapi(
    components(schemas(
        Problem,
        ProblemCreate,
        ProblemUpdate,
        TestCase,
        Language,
        Submission,
        SubmissionCreate
    )),
    nest(
        (path = "/problems", api = problems::Api)
    ),
)]
pub struct Api;

pub fn router() -> Router {
    Router::new().nest("/problems", problems::router())
}
