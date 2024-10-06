use axum::{routing::get, Json};
use utoipa::OpenApi;

use crate::components::schemas::Submission;

#[derive(OpenApi)]
#[openapi(paths(get_submission_by_id, get_submissions))]
pub struct Api;

pub fn router() -> axum::Router {
    axum::Router::new()
        .route("/", get(get_submissions))
        .route("/:id", get(get_submission_by_id))
}

/// 提出一覧を取得する
#[utoipa::path(
    get,
    path = "/",
    responses(
        (status = 200, description = "提出一覧", body = [Submission])
    )
)]
pub async fn get_submissions() -> Json<Vec<Submission>> {
    todo!()
}

/// 提出の詳細を取得する
#[utoipa::path(
    get,
    path = "/{id}",
    params(("id" = u64, description = "提出のID")),
    responses(
        (status = 200, description = "提出の詳細", body = Submission),
        (status = 404, description = "指定されたIDの提出が見つかりません")
    )
)]
pub async fn get_submission_by_id() -> Json<Submission> {
    todo!()
}
