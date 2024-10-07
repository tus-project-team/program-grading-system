# Program Grading System Backend

## Development

### Pre-requisites

- [Rust](https://www.rust-lang.org)
- [Node.js](https://nodejs.org)
- [Bun](https://bun.sh/)

### Commands

#### 開発サーバーの起動

```sh
bun run dev
```

#### OpenAPIのスキーマと型定義の生成

```sh
bun run generate
```

> [!important]
> バックエンドのコードを変更した場合は、必ずOpenAPIのスキーマと型定義を生成し、変更を反映させてください。

#### ビルドの実行

```sh
bun run build
```

#### テストの実行

```sh
bun run test
```
