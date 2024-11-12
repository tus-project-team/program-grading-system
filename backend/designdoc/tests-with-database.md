# Tests with database design document

## Overview

このドキュメントは、データベースへのアクセスを含むテストを実行する際の課題と解決策についてまとめたものです。

## Author

Rai

## Background

### 技術構成

- ORM: Prisma
- DBMS: SQLite
- Testing Framework: Vitest

### 要件

- データベースへのアクセスを含むテストの実行
- テスト実行前後にデータベースの状態をリセット
- テスト前に必要なデータをデータベースに投入

## Implementation Ideas

### 案1: 実際のデータベースを使用

実際のデータベースを使用してテストを実行する

#### 課題1: テスト前後のデータベースリセット

- **解決案1**: テスト後に、必ず変更したデータを手動で元に戻す

  - **Pros**:
    - 特に何も導入せずに実現可能
  - **Cons**:
    - 手動で行うため、面倒でありミスが発生しやすい
    - リレーションが複数ある場合、リレーションを考慮したリセットは難しく、元に戻し忘れる可能性がある

- **解決案2**: テスト中のDB操作を一回のトランザクションとして扱い、テスト後にトランザクションをロールバックする

  - **Pros**:
    - データを基に戻し忘れる可能性がない
  - **Cons**:

    - 自前で実装しない場合、[jest-prisma](https://github.com/Quramy/jest-prisma) や [vitest-environment-vprisma](https://github.com/aiji42/vitest-environment-vprisma) などのライブラリを導入する必要がある

      - [vitest-environment-vprisma](https://github.com/aiji42/vitest-environment-vprisma) を導入しようとしたところ、次のエラーが発生した

        ```plaintext
        Error: jest-prisma needs "interactiveTransactions" preview feature.
        ❯ PrismaEnvironmentDelegate.beginTransaction ../node_modules/@quramy/jest-prisma-core/lib/delegate.js:97:23
        ❯ ../node_modules/vitest-environment-vprisma/dist/setup.mjs:2:3
              1| global.beforeEach(async () => {
              2|   await Promise.all([
              |   ^
              3|     global.vPrismaDelegate.handleTestEvent({ name: "test_start" }),
              4|     global.vPrismaDelegate.handleTestEvent({ name: "test_fn_start" })
        ```

        `@prisma/client` のバージョンは `5.22.0` であり、`"interactiveTransactions"` は有効になっているはずなため、原因が不明であり、解決策が見つからなかった

    - 本番環境と異なる挙動をする可能性がある

- **解決案3**: テスト後に、データベース内にある全てのデータを削除する

  - **Pros**:
    - データを基に戻し忘れる可能性がない
  - **Cons**:
    - テスト後にデータベース内の全てのデータを削除するため、テストが遅くなる可能性がある
  - **参考文献**:
    - https://www.prisma.io/blog/testing-series-3-aBUyF8nxAn#add-a-vitest-configuration-file-for-integration-tests

#### 課題2: テスト前のデータ投入

- **解決案1**: テスト前に、必要なデータを prisma のAPIを直接使用してデータベースに投入する

  - **Pros**:
    - 特に何も導入せずに実現可能
    - [Faker](https://fakerjs.dev/) などを使用すれば、テストデータを容易に生成できる
  - **Cons**:
    - 必要なコード量が多い

- **解決案2**: データベースにデータを投入する関数を手動で定義する

  - **Pros**:
    - テスト毎に必要なコード量が減る
    - 手動で用意するため、テストデータの生成方法を柔軟に変更できる
    - 特に何も導入せずに実現可能
  - **Cons**:
    - ヘルパー関数を書く手間がかかる

- **解決案3**: データベースにデータを投入する関数を自動で生成する

  - **Pros**:
    - テスト毎に必要なコード量が減る
    - 自動生成するため、関数の定義の手間がかからない
  - **Cons**:
    - [FactoryJS](https://factory-js.github.io/) など、自動生成するためのライブラリを導入する必要がある
    - 手動で定義する場合に比べ、柔軟性が低い

### 案2: モックデータベースを使用

[prismock](https://github.com/morintd/prismock) を使用して、Prismaのモックデータベースを作成し、テスト中にモックデータベースを使用する

### Conclusion

実際の本番環境に近い状態でテストを実行するために、案1 を採用する。

課題1については、リレーションが複数ある場合に手動でリセットするのは困難であるため、解決案2を採用する。

課題2については、テスト毎に prisma の API を直接使用するのは手間がかかるため、解決案3を採用する。

## Implementation Timeline

### Phase 1: テスト用のデータベースを用意する

Prisma では SQLite をインメモリで使用できないため、テスト用のデータベースファイルを `prisma/test.db` に用意する。

これは、テスト時にのみ `DATABASE_URL=sqlite:./test.db` とすることで実現できる。

### Phase 2: テスト前にデータを投入する

`src/db/test-helpers.ts` に、フェイクデータをDBに投入するヘルパー関数を定義する。

例：

```ts
import type { Prisma } from "@prisma/client"

import { faker } from "@faker-js/faker"

import { prisma } from "./prisma"

/**
 * Create a User data object, but never insert it into the db
 * @param data The data to generate the user with
 * @returns The generated user data
 */
export const createStudentData = ({
  name = faker.person.fullName(),
  ...data
}: Partial<Prisma.StudentCreateInput> = {}): Prisma.StudentCreateInput => ({
  email: `${name.replaceAll(/\s/g, "-").toLowerCase()}@student.example.com`,
  name,
  ...data,
})

/**
 * Create a User
 * @param data The data to create the user with
 * @returns The created user
 * @see {@link createStudentData}
 */
export const createStudent = (data: Partial<Prisma.StudentCreateInput> = {}) =>
  prisma.student.create({
    data: createStudentData(data),
  })
```

### Phase 3: テスト後にデータをリセットする

[vitest-environment-vprisma](https://github.com/aiji42/vitest-environment-vprisma) を導入する
