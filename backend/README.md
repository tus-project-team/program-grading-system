# Program Grading System Backend

プログラム採点システムのAPIサーバーです。

## 🤖 Tech Stack

- **Framework**:
  - [**Hono**](https://hono.dev/) - Web application framework
- **Open API**:
  - [**Zod OpenAPI Hono**](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - Define API schemas with Zod and validate values and types
  - [**Scalar API Reference**](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference) - Generate API reference documentation from OpenAPI schemas
- **Database**:
  - [**Prisma**](https://www.prisma.io/) - ORM for Node.js and TypeScript
  - [**SQLite**](https://www.sqlite.org/) - RDBMS
- **Language**:
  - [**TypeScript**](https://www.typescriptlang.org/) - JavaScript with syntax for types
- **Runtime, Package Manager, and Task Runner**:
  - [**Bun**](https://bun.sh/) - JavaScript all-in-one toolkit (used for package management, task running, and more)
  - [**Node.js**](https://nodejs.org/) - JavaScript runtime (used for running JavaScript code outside of a web browser)

## 🚀 Development

### Prerequisites

> [!warning]
> Dev Containerにより開発環境を構築した場合は、以下はすでにインストールされています。

- [**Node.js**](https://nodejs.org/)
- [**Bun**](https://bun.sh/)

それぞれ必要なバージョンは[`.tool-versions`](../.tool-versions)を参照してください。

### Commands

#### 依存関係のインストール

次のコマンドで依存関係をインストールします。

```sh
bun install
```

#### 開発サーバーの起動

次のコマンドで開発サーバーを起動します。`backend` ディレクトリに移動してから実行してください。

```sh
bun run dev
```

`http://localhost:3000` にてAPIサーバーが起動します。
また、`http://localhost:3000/api/docs` にてAPIリファレンスが表示されます。

#### ビルド

次のコマンドでバックエンドのビルドを行います。

```sh
bun run build
```

#### リント

次のコマンドでバックエンドのコードをESLintでリントします。

```sh
bun run lint:write
```

> [!note]
> 自動修正しない場合は次のコマンドを実行してください。
>
> ```sh
> bun run lint
> ```

#### フォーマット

次のコマンドでバックエンドのコードをPrettierでフォーマットします。

```sh
bun run format:write
```

> [!note]
>
> フォーマットに従っているかの確認だけを行い、自動修正しない場合は次のコマンドを実行してください。
>
> ```sh
> bun run format
> ```
