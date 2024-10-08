use std::io;

use axum::{http::HeaderValue, routing::get};
use backend::{api, get_openapi_json, Api};
use hyper::header::CONTENT_TYPE;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

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

    let listner = tokio::net::TcpListener::bind("0.0.0.0:5016").await?;
    axum::serve(listner, app).await
}
