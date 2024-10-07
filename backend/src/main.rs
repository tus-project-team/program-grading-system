mod api;

use std::io;

use axum::{http::HeaderValue, routing::get, Json};
use hyper::header::CONTENT_TYPE;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

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
struct Api;

#[tokio::main]
async fn main() -> Result<(), io::Error> {
    let app = axum::Router::new()
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
                .allow_headers([CONTENT_TYPE]),
        )
        .merge(Scalar::with_url("/api/docs", Api::openapi()))
        .route("/api/openapi.json", get(get_openapi_json))
        .nest("/api", api::router());

    let listner = tokio::net::TcpListener::bind("0.0.0.0:5000").await?;
    axum::serve(listner, app).await
}

/// OpenAPIのスキーマを取得する
#[utoipa::path(
    get,
    path = "/api/openapi.json",
    responses(
        (status = 200, description = "OpenAPIのスキーマ", content_type = "application/json")
    )
)]
async fn get_openapi_json() -> Json<utoipa::openapi::OpenApi> {
    Json(Api::openapi())
}
