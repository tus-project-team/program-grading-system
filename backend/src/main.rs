mod api;
mod components;

use std::io;

use axum::{http::HeaderValue, routing::get};
use hyper::header::CONTENT_TYPE;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

#[derive(OpenApi)]
#[openapi(
    nest(
        (path = "/api", api = api::Api)
    )
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
        .route(
            "/api/openapi.json",
            get(|| async { Api::openapi().to_json().unwrap() }),
        )
        .nest("/api", api::router());

    let listner = tokio::net::TcpListener::bind("0.0.0.0:5000").await?;
    axum::serve(listner, app).await
}
