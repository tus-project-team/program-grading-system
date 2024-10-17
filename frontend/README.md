# Program Grading System Frontend

プログラム採点システムのフロントエンドです。

## 🤖 Tech Stack

- **UI Library**:
  - [**React**](https://solidjs.com/) - UI Library
- **Routing**:
  - [**TanStack Router**](https://tanstack.com/router/latest) - Routing Library
- **Data Fetching**:
  - [**TanStack Query**](https://tanstack.com/query/latest) - Data Fetching Library
  - [**OpenAPI TypeScript**](https://openapi-ts.dev/) - OpenAPI Client Generator (used for type-safe API requests)
- **Components**:
  - [**shadcn/ui**](https://ui.shadcn.com/) - UI Components
- **Styling**:
  - [**Tailwind CSS**](https://tailwindcss.com/) - Utility-First CSS Framework
- **Language**:
  - [**TypeScript**](https://www.typescriptlang.org/) - JavaScript with syntax for types
- **Runtime, Package Manager, and Task Runner**:
  - [**Bun**](https://bun.sh/) - JavaScript all-in-one toolkit (used for package management, task running, and more)
  - [**Node.js**](https://nodejs.org/) - JavaScript runtime (used for running JavaScript code outside of a web browser)
- **Other**:
  - [**Lucide**](https://lucide.dev/) - Icons
  - [**Monaco Editor**](https://microsoft.github.io/monaco-editor/) - Code Editor
  - [**date-fns**](https://date-fns.org/) - Date Utility Library
  - [**MSW**](https://mswjs.io/) - Mock Service Worker (used for mocking API requests)

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

次のコマンドで開発サーバーを起動します。`frontend` ディレクトリに移動してから実行してください。

```sh
bun run dev
```

> [!note]
>
> バックエンドはMSWによりモックされた状態で起動します。
>
> 実際のバックエンドサーバーと通信したい場合は、バックエンドサーバーを起動した後、環境変数`NODE_ENV=production`を設定して開発サーバーを起動してください。次にその手順を示します。
>
> 1. `backend` ディレクトリに移動し、バックエンドの開発サーバーを起動します。
>
>    ```sh
>    cd ../backend
>    bun run dev
>    ```
>
> 2. `frontend` ディレクトリに移動し、フロントエンドの開発サーバーを起動します。
>
>    ```sh
>    cd ../frontend
>    NODE_ENV=production bun run dev
>    ```

#### ビルド

次のコマンドでフロントエンドのビルドを行います。

```sh
bun run build
```

#### リント

次のコマンドでフロントエンドのコードをESLintでリントします。

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

次のコマンドでフロントエンドのコードをPrettierでフォーマットします。

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
