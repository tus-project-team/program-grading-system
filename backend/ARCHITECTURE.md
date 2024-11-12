# Backend Architecture

## Directory Structure

### `src/`

実際にアプリを構成するソースコードは全てこのディレクトリ内にあります。

ルートディレクトリにある`tailwind.config.ts`など、`.config.{ts,js}`で終わるファイルは全て設定ファイルです。

#### `src/api/`

APIのルーティングなどがここにあります。

`src/api` のディレクトリ構成は、OpenAPI のスキーマの構造をもとにしています。

各エンドポイントに対応するファイルが `src/api/paths` にあります。

#### `src/bin/`

ビルドなどに必要なスクリプトがここにあります。

#### `src/db/`

DB に関する実装がここにあります。

#### `src/services/`

##### `src/services/program/`

プログラムの実行に関する実装がここにあります。
