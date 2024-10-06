use axum::{extract::Path, routing::get, Json};
use utoipa::OpenApi;

use crate::components::Problem;

#[derive(OpenApi)]
#[openapi(paths(get_problem_by_id, get_problems))]
pub struct Api;

pub fn router() -> axum::Router {
    axum::Router::new()
        .route("/:id", get(get_problem_by_id))
        .route("/", get(get_problems))
}

/// 特定の問題の詳細を取得する
#[utoipa::path(
    get,
    path = "/{id}",
    params(("id", description = "問題のID")),
    responses(
        (status = 200, description = "問題の詳細", body = Problem),
        (status = 404, description = "指定されたIDの問題が見つかりません")
    )
)]
pub async fn get_problem_by_id(Path((id,)): Path<(u64,)>) -> Json<Problem> {
    Json(Problem {})
}

/// 問題の一覧を取得する
#[utoipa::path(
    get,
    path = "/",
    responses(
        (status = 200, description = "問題の一覧", body = [Problem])
    )
)]
pub async fn get_problems() -> Json<Vec<Problem>> {
    Json(vec![])
}
