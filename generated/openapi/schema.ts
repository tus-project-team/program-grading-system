/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/api/openapi.json": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** OpenAPIのスキーマを取得する */
    get: operations["get_openapi_json"]
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/api/problems/": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** 問題の一覧を取得する */
    get: operations["get_problems"]
    put?: never
    /** 新しい問題を作成する */
    post: operations["create_problem"]
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/api/problems/{id}": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** 問題の詳細を取得する */
    get: operations["get_problem_by_id"]
    /** 問題を更新する */
    put: operations["update_problem_by_id"]
    post?: never
    /** 問題を削除する */
    delete: operations["delete_problem_by_id"]
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/api/problems/{id}/submissions": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** 問題に対する提出一覧を取得する */
    get: operations["get_submissions_by_problem_id"]
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/api/problems/{id}/submit": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** 問題に対してプログラムを提出する */
    post: operations["submit_program_by_problem_id"]
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/api/submissions/": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** 提出一覧を取得する */
    get: operations["get_submissions"]
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  "/api/submissions/{id}": {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** 提出の詳細を取得する */
    get: operations["get_submission_by_id"]
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export type webhooks = Record<string, never>
export interface components {
  schemas: {
    Language: {
      name: string
      version: string
    }
    Problem: {
      body: string
      /** Format: int64 */
      id: number
      supported_languages: components["schemas"]["Language"][]
      test_cases: components["schemas"]["TestCase"][]
      title: string
    }
    ProblemCreate: {
      body: string
      supported_languages: components["schemas"]["Language"][]
      test_cases: components["schemas"]["TestCase"][]
      title: string
    }
    ProblemUpdate: {
      body?: string | null
      supported_languages?: components["schemas"]["Language"][] | null
      test_cases?: components["schemas"]["TestCase"][] | null
      title?: string | null
    }
    Submission: {
      code: string
      /** Format: int64 */
      id: number
      language: components["schemas"]["Language"]
      /** Format: int64 */
      problem_id: number
      result: components["schemas"]["SubmissionResult"]
      /** Format: int64 */
      student_id: number
      test_results: components["schemas"]["TestResult"][]
    }
    SubmissionCreate: {
      /** Format: int64 */
      problem_id: number
    }
    SubmissionResult: {
      message?: string | null
      status: components["schemas"]["SubmissionStatus"]
    }
    /** @enum {string} */
    SubmissionStatus:
      | "Accepted"
      | "WrongAnswer"
      | "RuntimeError"
      | "CompileError"
    TestCase: {
      input: string
      output: string
    }
    TestResult: {
      message?: string | null
      status: components["schemas"]["TestStatus"]
      /** Format: int64 */
      test_case_id: number
    }
    /** @enum {string} */
    TestStatus: "Passed" | "Failed"
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}
export type $defs = Record<string, never>
export interface operations {
  get_openapi_json: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description OpenAPIのスキーマ */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": unknown
        }
      }
    }
  }
  get_problems: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description 問題の一覧 */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Problem"][]
        }
      }
    }
  }
  create_problem: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": components["schemas"]["ProblemCreate"]
      }
    }
    responses: {
      /** @description 作成された問題 */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Problem"]
        }
      }
    }
  }
  get_problem_by_id: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description 問題のID */
        id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description 問題の詳細 */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Problem"]
        }
      }
      /** @description 指定されたIDの問題が見つかりません */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  update_problem_by_id: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description 問題のID */
        id: number
      }
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": components["schemas"]["ProblemUpdate"]
      }
    }
    responses: {
      /** @description 更新された問題 */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Problem"]
        }
      }
      /** @description 指定されたIDの問題が見つかりません */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  delete_problem_by_id: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description 問題のID */
        id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description 問題が削除されました */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description 指定されたIDの問題が見つかりません */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  get_submissions_by_problem_id: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description 問題のID */
        id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description 提出一覧 */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Submission"][]
        }
      }
      /** @description 指定されたIDの問題が見つかりません */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  submit_program_by_problem_id: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description 問題のID */
        id: number
      }
      cookie?: never
    }
    requestBody: {
      content: {
        "application/json": components["schemas"]["SubmissionCreate"]
      }
    }
    responses: {
      /** @description 提出されたプログラム */
      201: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Submission"]
        }
      }
      /** @description 指定されたIDの問題が見つかりません */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  get_submissions: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description 提出一覧 */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Submission"][]
        }
      }
    }
  }
  get_submission_by_id: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description 提出のID */
        id: number
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description 提出の詳細 */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          "application/json": components["schemas"]["Submission"]
        }
      }
      /** @description 指定されたIDの提出が見つかりません */
      404: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
}
