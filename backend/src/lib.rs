use axum::Json;
use utoipa::OpenApi;

pub mod api;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Program Grading System API",
        description = "プログラム採点システムのAPI",
    ),
    nest(
        (path = "/api", api = api::Api)
    ),
    paths(get_openapi_json)
)]
pub struct Api;

/// OpenAPIのスキーマを取得する
#[utoipa::path(
    get,
    path = "/api/openapi.json",
    responses(
        (status = 200, description = "OpenAPIのスキーマ", content_type = "application/json")
    )
)]
pub async fn get_openapi_json() -> Json<utoipa::openapi::OpenApi> {
    Json(Api::openapi())
}
