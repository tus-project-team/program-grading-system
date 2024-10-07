mod components;
mod paths;

use axum::Router;
use utoipa::OpenApi;

use components::schemas::{
    Language, Problem, ProblemCreate, ProblemUpdate, Submission, SubmissionCreate,
    SubmissionResult, SubmissionStatus, TestCase, TestResult, TestStatus,
};
use paths::{problems, submissions};

#[derive(OpenApi)]
#[openapi(
    components(schemas(
        Problem,
        ProblemCreate,
        ProblemUpdate,
        TestCase,
        Language,
        Submission,
        SubmissionCreate,
        SubmissionResult,
        TestResult,
        SubmissionStatus,
        TestStatus,
    )),
    nest(
        (path = "/problems", api = problems::Api),
        (path = "/submissions", api = submissions::Api)
    ),
)]
pub struct Api;

pub fn router() -> Router {
    Router::new()
        .nest("/problems", problems::router())
        .nest("/submissions", submissions::router())
}
