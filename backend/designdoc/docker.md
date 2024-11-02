# Docker Implementation Design Document

## Overview

このドキュメントは、Bunを使用したTypeScriptアプリケーションのDocker化プロセスについて、直面した課題と解決策をまとめたものです。

## Author

Kattyan

## Background

### プロジェクト構成

- モノレポ構造
- バックエンドアプリケーション（Bun + TypeScript）
- Prismaを使用したデータベース管理
- Pyodideを使用したPythonコード実行環境

### 要件

1. 本番環境での実行に最適化
2. セキュアな実行環境
3. 最小限のイメージサイズ
4. 適切なデータの永続化

## Implementation Timeline

### Phase 1: 基本的なDocker化

#### 課題1: Bunの実行環境セットアップ

- **問題**: BunをDocker内で実行するための適切な環境構築
- **解決策**: miseを使用したバージョン管理

```dockerfile
RUN curl https://mise.run | sh
ENV MISE_ROOT="/root/.local/share/mise"
ENV PATH="${MISE_ROOT}/shims:${MISE_ROOT}/bin:/root/.local/bin:${PATH}"
```

#### 課題2: postinstallスクリプトの実行エラー

- **問題**: `bun install`実行時のpostinstallスクリプトエラー
- **解決策**: `--no-install-scripts`オプションの使用

```dockerfile
RUN bun install --no-install-scripts
```

### Phase 2: Prisma統合

#### 課題3: PrismaクライアントとQuery Engine

- **問題**: 本番環境でのPrismaクライアントの初期化エラー
- **解決策**: 必要なファイルの明示的なコピーと権限設定

```dockerfile
COPY --from=build /app/node_modules/@prisma/engines/libquery_engine-debian-openssl-3.0.x.so.node ./node_modules/.prisma/client/
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
```

#### 課題4: データベースの永続化

- **問題**: SQLiteデータベースへの書き込み権限エラー
- **解決策**: 適切なディレクトリ構造と権限設定

```dockerfile
RUN mkdir -p prisma/data && \
    chmod 777 /app/production/prisma/data && \
    chmod 666 /app/production/prisma/data/deploy.db
```

### Phase 3: セキュリティと最適化

#### 課題5: distrolessイメージへの移行

- **問題**: 最小限のセキュアな実行環境の構築
- **解決策**: `gcr.io/distroless/cc-debian12:nonroot`の採用

```dockerfile
FROM gcr.io/distroless/cc-debian12:nonroot AS production
```

##### はまったポイント

1. 当初は`gcr.io/distroless/base-debian12:nonroot`を使用していたが、下記のエラーが発生：

```
PrismaClientInitializationError: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node`).
Prisma cannot find the required `libgcc_s` system library in your system.
```

2. `/busybox/sh`を使用しようとして失敗：

```
runc run failed: unable to start container process: error during container init: exec: "/busybox/sh": stat /busybox/sh: no such file or directory
```

3. 最終的に`cc-debian12`に変更することで解決。これにはC/C++ランタイムライブラリが含まれており、Prismaの実行に必要な依存関係が揃っていた。

#### 課題6: Pyodide依存関係

- **問題**: Pyodideの実行に必要なファイルのパス解決
- **解決策**: ルートレベルの`node_modules`ディレクトリ構造の維持

##### はまったポイント

1. 最初に遭遇したエラー：

```
ENOENT: No such file or directory
   path: "/node_modules/pyodide/pyodide.asm.wasm"
```

2. 試行錯誤したアプローチ：
   - ❌ シンボリックリンクの作成（distrolessではシェルコマンドが使えない）
   - ❌ 環境変数`NODE_PATH`の設定（Pyodideが絶対パスを要求）
   - ✅ ルートレベルでの直接コピー

```dockerfile
COPY --from=build --chown=nonroot:nonroot /tmp/prod/node_modules /node_modules
```

3. SQLiteデータベースの権限エラー：

```
attempt to write a readonly database
```

- 解決策として、ビルド時に適切な権限を設定：

```dockerfile
RUN chmod 777 /app/production/prisma/data && \
    chmod 666 /app/production/prisma/data/deploy.db
```

### Phase 4: ベストプラクティスの適用

#### 課題7: Dockerfileの最適化

- **問題**: hadolintによる警告への対応
- **解決策**:
  - パッケージバージョンの固定
  - `--no-install-recommends`の使用
  - `SHELL`オプションの設定
  - レイヤー数の最適化

##### はまったポイント

1. hadolintの警告：

```bash
DL3008 warning: Pin versions in apt get install
DL3015 info: Avoid additional packages by specifying `--no-install-recommends`
DL4006 warning: Set the SHELL option -o pipefail
```

2. 循環参照エラー：

```
failed to solve: circular dependency detected on stage: build
```

- 解決策として、ビルドステージの構造を整理し、明確な依存関係の流れを設定

### Phase 5: 非rootユーザー対応

#### 課題8: 権限関連の問題

- **問題**: rootユーザーでの実行に関するセキュリティ警告
- **解決策**: 非rootユーザーの作成と適切な権限設定

##### はまったポイント

1. ホームディレクトリの権限エラー：

```
/bin/bash: line 1: /home/appuser/.bashrc: No such file or directory
```

- 解決策：

```dockerfile
RUN groupadd -r appuser && \
    useradd -r -g appuser -m -d /home/appuser -s /bin/bash appuser && \
    mkdir -p /home/appuser/.local/bin && \
    chown -R appuser:appuser /home/appuser
```

2. mise インストール時の権限エラー：

```
mkdir: cannot create directory '/home/appuser': Permission denied
```

- 解決策：適切なユーザー切り替えとパス設定

```dockerfile
USER appuser
WORKDIR /home/appuser
ENV MISE_ROOT="/home/appuser/.local/share/mise"
ENV PATH="/home/appuser/.local/bin:${MISE_ROOT}/shims:${MISE_ROOT}/bin:${PATH}"
```

3. node_modules作成時の権限エラー：

```
error: EACCES creating node_modules folder
```

- 解決策：事前にディレクトリを作成し権限を設定

```dockerfile
RUN mkdir -p backend/node_modules backend/prisma/data && \
    chown -R appuser:appuser backend
```

#### 課題9: ビルドパフォーマンスの最適化

- **問題**: 権限変更処理による著しいビルド時間の増加
- **解決策**: 必要最小限の権限設定に限定

##### はまったポイント

1. 全体的な権限変更による遅延：

```dockerfile
chown -R appuser:appuser /app  # 非常に遅い
```

2. 最適化した解決策：

```dockerfile
# 必要なディレクトリのみに権限設定を限定
RUN mkdir -p backend/node_modules backend/prisma/data && \
    chown -R appuser:appuser backend
```

### Technical Details

### マルチステージビルド構造

1. **base**: システム依存関係とmiseのセットアップ
2. **build**: アプリケーションのビルドと依存関係の解決
3. **production**: 最小限の実行環境

### ファイル構造

```
/app
├── node_modules/
│   ├── .prisma/
│   ├── @prisma/
│   └── pyodide/
├── prisma/
│   └── data/
└── app
```

### 環境変数

```env
NODE_ENV=production
DATABASE_URL=file:/app/prisma/data/deploy.db
PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
```

#### 権限構造

```plaintext
/home/appuser/
  └── .local/
      └── share/
          └── mise/  (755 appuser:appuser)

/app/
  ├── backend/  (755 appuser:appuser)
  │   ├── node_modules/  (755 appuser:appuser)
  │   └── prisma/
  │       └── data/  (777)
  │           └── deploy.db  (666)
  └── node_modules/  (755 nonroot:nonroot)
```

### Security Considerations

1. nonrootユーザーでの実行
2. 最小限の実行環境（distroless）
3. 適切なファイル権限設定
4. 固定されたパッケージバージョン
5. 階層的な権限管理
   - ビルド時: 必要な箇所のみrootで操作
   - 実行時: 常に非root（nonroot:65532）
   - データ永続化: 適切な実行権限

### Trade-offs

#### Pros

1. セキュアな実行環境
2. 最小限のイメージサイズ
3. 再現性の高いビルド
4. 適切な権限分離
5. 詳細な権限管理による高いセキュリティ
6. 効率的なビルドプロセス

#### Cons

1. 複雑なビルド構成
2. デバッグの難しさ
3. ビルド時間の増加
4. 複雑な権限設定
5. 権限関連のデバッグの難しさ

### Future Improvements

1. ビルドキャッシュの最適化
2. CI/CDパイプラインの統合
3. ヘルスチェックの追加
4. 監視機能の統合
5. マルチステージビルドの更なる最適化
6. 権限設定の自動化ツールの導入
7. セキュリティスキャンの自動化

## References

1. [Bun Documentation](https://bun.sh/docs)
2. [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
3. [Docker Best Practices](https://docs.docker.com/develop/develop-images/guidelines/)
4. [Distroless Documentation](https://github.com/GoogleContainerTools/distroless)
5. [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
6. [Linux Permissions Guide](https://www.linux.com/training-tutorials/understanding-linux-file-permissions/)
