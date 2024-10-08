# Program Grading System Frontend

## Development

### Pre-requisites

[mise]: https://mise.jdx.dev/getting-started.html

- [Rust](https://www.rust-lang.org/ja)
- [Node.js](https://nodejs.org/en/)
- [Bun](https://bun.sh/)

Node.js と Bun のバージョンは [`.tool-versions`](../.tool-versions) に記載されています。

### Commands

#### 依存関係のインストール

次のコマンドで依存関係をインストールします。

```sh
bun install --frozen-lockfile
```

#### 開発サーバーの起動

次のコマンドで開発サーバーを起動します。

```sh
bun run dev
```

このコマンドでは以下が並列に行われます。

- フロントエンドサーバーの起動
- バックエンドサーバーの起動
- バックエンドのモックサーバーの起動

#### ビルド

次のコマンドでビルドします。

```sh
bun run build
```

#### リント

次のコマンドでリントを実行します。

```sh
bun run lint
```

#### フォーマット

次のコマンドでフォーマットを実行します。

```sh
bun run format:write
```
