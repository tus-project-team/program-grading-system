# Frontend Architecture

## Directory Structure

### `src/`

実際にアプリを構成するソースコードは全てこのディレクトリ内にあります。

ルートディレクトリにある`tailwind.config.ts`など、`.config.{ts,js}`で終わるファイルは全て設定ファイルです。

#### `src/components/`

アプリ全体で使われるコンポーネントがここにあります。

##### `src/components/ui`

[`shadcn/ui`](https://ui.shadcn.com/) のコンポーネントがここにあります。

#### `src/context`

アプリ全体で使われる[コンテキスト](https://ja.react.dev/learn/passing-data-deeply-with-context)がここにあります。

#### `src/features`

機能ごとにまとめられたコンポーネント、コンテキスト、フックなどがここにあります。

##### `src/features/<feature-name>/components`

機能を構成するコンポーネントがここにあります。

##### `src/features/<feature-name>/context`

機能を構成するコンテキストがここにあります。

##### `src/features/<feature-name>/hooks`

機能を構成するフックがここにあります。

##### `src/features/<feature-name>/lib`

機能を構成する関数などがここにあります。

#### `src/hooks`

アプリ全体で使われる[フック](https://ja.react.dev/learn/reusing-logic-with-custom-hooks)がここにあります。

#### `src/lib`

アプリ全体で使われる関数などがここにあります。

APIクライアントやユーティリティ関数などがここにあります。

#### `src/mocks`

[MSW](https://mswjs.io/) によるモックの定義がここにあります。

#### `src/routes`

[ルーティング](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)が定義されています。

詳しくは [File-Based Routing | TanStack Router React Docs](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing) を参照してください。

各ルート内では、以下のようなディレクトリ構造が推奨されます。

| Directory     | Description                      |
| ------------- | -------------------------------- |
| `-components` | ルート内で使われるコンポーネント |
| `-context`    | ルート内で使われるコンテキスト   |
| `-hooks`      | ルート内で使われるフック         |
| `-lib`        | ルート内で使われる関数など       |

以下に例を示します。

```plaintext
src/routes/problems/
├── -components
│   ├── code-editor
│   │   ├── index.ts        // 公開するコンポーネントをexportする
│   │   ├── run-button.tsx  // 実行ボタン
│   │   └── editor.tsx      // エディタ
│   └── problem
│        ├── index.ts        // 公開するコンポーネントをexportする
│        ├── problem.tsx     // 問題表示
│        └── solution.tsx    // 解答表示
├── -context
│   └── problem
│        ├── index.ts        // 公開するコンテキスト等をexportする
│        └── problem.tsx     // 問題コンテキスト
├── -hooks
│   └── use-problem
│        ├── index.ts        // 公開するフックをexportする
│        └── use-problem.tsx // 問題コンテキストを使うカスタムフック
├── index.tsx                 // APIからのデータを取得などを記述する
└── index.lazy.tsx            // `/problems`で表示されるコンポーネントを指定する
```

実際の例としては、[`src/routes/problems/$problemId`](./src/routes/problems/$problemId/) などを参考にしてください。

#### `src/styles`

アプリ全体で使われるグローバルスタイルがここにあります。
