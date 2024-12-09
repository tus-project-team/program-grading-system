FROM ubuntu:24.04@sha256:99c35190e22d294cdace2783ac55effc69d32896daaa265f0bbedbcde4fbe3e5 AS base
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl=8.5.0-2ubuntu10.4 \
    unzip=6.0-28ubuntu4.1 \
    openssl=3.0.13-0ubuntu3.4 \
    ca-certificates=20240203 \
    && rm -rf /var/lib/apt/lists/*
USER appuser
WORKDIR /home/appuser
ENV MISE_ROOT="/home/appuser/.local/share/mise"
ENV PATH="/home/appuser/.local/bin:${MISE_ROOT}/shims:${MISE_ROOT}/bin:${PATH}"
RUN curl https://mise.run | bash && \
    echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
WORKDIR /app
COPY --chown=appuser:appuser .tool-versions ./
RUN . ~/.bashrc && mise install

FROM base AS build
WORKDIR /app
USER root
RUN mkdir -p /app/node_modules \
    /app/backend/node_modules \
    /app/frontend/node_modules \
    /app/generated/openapi/node_modules \
    /app/backend/prisma/data && \
    chown -R appuser:appuser /app
COPY --chown=appuser:appuser . .
USER appuser
RUN . ~/.bashrc \
    && bun install --no-install-scripts
USER appuser
WORKDIR /app/backend
RUN bun prisma generate
ENV DATABASE_URL=file:/app/backend/prisma/data/deploy.db
RUN touch prisma/data/deploy.db && \
    bun prisma migrate deploy && \
    bun build --compile src/index.ts --outfile ./app
USER root
RUN mkdir -p /tmp/prod/app/node_modules/.prisma/client \
    /tmp/prod/app/prisma/data \
    /tmp/prod/node_modules/pyodide && \
    mv app /tmp/prod/app/ && \
    mv prisma/data/deploy.db /tmp/prod/app/prisma/data/ && \
    cp -r /app/node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node /tmp/prod/app/node_modules/.prisma/client/ && \
    cp -r /app/node_modules/@prisma/client /tmp/prod/app/node_modules/@prisma/ && \
    cp -r /app/node_modules/pyodide/* /tmp/prod/node_modules/pyodide/ && \
    chown -R 65532:65532 /tmp/prod && \
    chmod -R 755 /tmp/prod && \
    chmod 777 /tmp/prod/app/prisma/data && \
    chmod 666 /tmp/prod/app/prisma/data/deploy.db

FROM gcr.io/distroless/cc-debian12:nonroot@sha256:594b5200fd1f06d17a877ebee16d4af84a9a7ab83c898632a2d5609c0593cbab AS production
WORKDIR /
COPY --from=build /tmp/prod/node_modules /node_modules
COPY --from=build /tmp/prod/app /app
ENV NODE_ENV=production \
    DATABASE_URL=file:/app/prisma/data/deploy.db \
    PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
WORKDIR /app
USER nonroot
EXPOSE 3000
CMD ["./app"]
