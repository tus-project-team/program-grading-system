import { BACKEND_URL } from "@/lib/api"
import { fromOpenApi } from "@mswjs/source/open-api"
import { http, HttpResponse } from "msw"
import api from "openapi/schema.json"

// ランダムなバイト列を生成してbase64エンコードする関数
function generateChallenge(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

// カスタムハンドラーを定義
export const handlers = [
  http.post(`${BACKEND_URL}/api/register`, () => {
    return HttpResponse.json({
      challenge: generateChallenge(),
    })
  }),

  http.post(`${BACKEND_URL}/api/register/verify`, () => {
    return HttpResponse.json({
      token: "mock-token-" + Math.random().toString(36).slice(2),
    })
  }),

  http.post(`${BACKEND_URL}/api/authenticate`, () => {
    return HttpResponse.json({
      challenge: generateChallenge(),
    })
  }),

  http.post(`${BACKEND_URL}/api/authenticate/verify`, () => {
    return HttpResponse.json({
      token: "mock-token-" + Math.random().toString(36).slice(2),
    })
  }),

  // その他のエンドポイントはOpenAPI定義から生成
  // @ts-expect-error OpenAPIの型定義の問題
  ...(await fromOpenApi({
    basePath: BACKEND_URL,
    ...api,
  })),
]
