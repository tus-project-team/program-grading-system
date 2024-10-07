# Program Grading System Frontend

## Development

### Pre-requisites

[mise]: https://mise.jdx.dev/getting-started.html

開発には次のソフトウェアが必要です。

- [Rust](https://www.rust-lang.org/ja)
- [Node.js](https://nodejs.org/en/)
- [Bun](https://bun.sh/)

必要な Node.js と Bun のバージョンは [`.tool-versions`](../.tool-versions) に記載されています。

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

このコマンドでは次のことが並列に行われます。

- バックエンドサーバーの起動
- フロントエンドサーバーの起動
- バックエンドのモックサーバーの起動
- バックエンドのAPIのTypeScript型定義の生成

> [!important]
> 開発を開始する前には、必ず開発サーバーを起動してください。
> 
> 開発サーバーの起動時にAPIの型定義を生成するため、APIの変更を反映させるためには開発サーバーを再起動する必要があります。

#### APIの型定義の生成

次のコマンドでバックエンドのAPIの型定義を生成します。

```sh
bun run generate
```

> [!warning]
> このコマンドは、バックエンドのサーバーが起動している状態で実行してください。
> バックエンドのサーバーが起動していない場合、APIの型定義を生成できません。
>
> バックエンドのサーバーの起動も同時に行う場合は、次のコマンドを実行してください。
> ```sh
> bun run sync
> ```
> このコマンドは、バックエンドのサーバーの起動とAPIの型定義の生成を同時に行います。

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
