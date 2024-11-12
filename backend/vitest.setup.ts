import { beforeEach } from "vitest"

import { resetDb } from "./src/db/test-helpers"

beforeEach(async () => {
  await resetDb()
})
