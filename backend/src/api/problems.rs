use axum::{
    extract::Path,
    routing::{get, post},
    Json,
};
use utoipa::OpenApi;

use crate::components::schemas::{
    Problem, ProblemCreate, ProblemUpdate, Submission, SubmissionCreate,
};

#[derive(OpenApi)]
#[openapi(paths(get_problem_by_id, create_problem, get_problems))]
pub struct Api;

pub fn router() -> axum::Router {
    axum::Router::new()
        .route("/", get(get_problems).post(create_problem))
        .route(
            "/:id",
            get(get_problem_by_id)
                .put(update_problem_by_id)
                .delete(delete_problem_by_id),
        )
        .route("/:id/submit", post(submit_program))
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
    todo!()
}

/// 新しい問題を作成する
#[utoipa::path(
    post,
    path = "/",
    request_body = ProblemCreate,
    responses(
        (status = 201, description = "作成された問題", body = Problem)
    )
)]
pub async fn create_problem(Json(problem): Json<ProblemCreate>) -> Json<Problem> {
    todo!()
}

/// 問題の詳細を取得する
#[utoipa::path(
    get,
    path = "/{id}",
    params(("id" = u64, description = "問題のID")),
    responses(
        (status = 200, description = "問題の詳細", body = Problem),
        (status = 404, description = "指定されたIDの問題が見つかりません")
    )
)]
pub async fn get_problem_by_id(Path((id,)): Path<(u64,)>) -> Json<Problem> {
    todo!()
}

/// 問題を更新する
#[utoipa::path(
    put,
    path = "/{id}",
    params(("id" = u64, description = "問題のID")),
    request_body = ProblemUpdate,
    responses(
        (status = 200, description = "更新された問題", body = Problem),
        (status = 404, description = "指定されたIDの問題が見つかりません")
    )
)]
pub async fn update_problem_by_id(
    Path((id,)): Path<(u64,)>,
    Json(problem): Json<ProblemUpdate>,
) -> Json<Problem> {
    todo!()
}

/// 問題を削除する
#[utoipa::path(
    delete,
    path = "/{id}",
    params(("id" = u64, description = "問題のID")),
    responses(
        (status = 204, description = "問題が削除されました"),
        (status = 404, description = "指定されたIDの問題が見つかりません")
    )
)]
pub async fn delete_problem_by_id(Path((id,)): Path<(u64,)>) {
    todo!()
}

/// プログラムを提出する
#[utoipa::path(
    post,
    path = "/{id}/submit",
    params(("id" = u64, description = "問題のID")),
    request_body = SubmissionCreate,
    responses(
        (status = 201, description = "提出されたプログラム", body = Submission),
        (status = 404, description = "指定されたIDの問題が見つかりません")
    )
)]
pub async fn submit_program(
    Path((id,)): Path<(u64,)>,
    Json(submission): Json<SubmissionCreate>,
) -> Json<Submission> {
    todo!()
}
