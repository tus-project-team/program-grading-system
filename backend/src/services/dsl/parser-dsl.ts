// src/services/dsl/parseDSL.ts

import type { DSLArg } from './types';
import type { CallNode } from './types';

/**
 * DSL文字列をパースし、CallNode[] に変換する
 * 例: "int(1..100).array(3..5, unique=true)"
 */
export function parseDSL(dsl: string): CallNode[] {
  const parts = dsl.split('.').map((p) => p.trim());
  const result: CallNode[] = [];

  for (const part of parts) {
    // "functionName(args...)" の形式を正規表現で抽出
    const match = part.match(/^([A-Z_a-z]\w*)\(([^)]*)\)$/);
    if (!match) {
      throw new Error(`Syntax error in DSL near: '${part}'`);
    }
    const functionName = match[1];
    const argString = match[2];
    const args = parseArgs(argString);

    result.push({ args, functionName });
  }
  return result;
}

/**
 * カンマ区切りの引数文字列を解析し、
 * range/option/literal のいずれかをDSLArgとして返す
 */
function parseArgs(argString: string): DSLArg[] {
  const trimmed = argString.trim();
  if (!trimmed) return [];

  const tokens = trimmed.split(',').map((t) => t.trim());
  const args: DSLArg[] = [];

  for (const token of tokens) {
    // 1) range: "x..y"
    const rangeMatch = token.match(/^([\d+.-]+)\.\.([\d+.-]+)$/);
    if (rangeMatch) {
      const minVal = Number.parseFloat(rangeMatch[1]);
      const maxVal = Number.parseFloat(rangeMatch[2]);
      args.push({ max: maxVal, min: minVal, type: 'range' });
      continue;
    }

    // 2) option: "key=value"
    const optionMatch = token.match(/^(\w+)\s*=\s*(.+)$/);
    if (optionMatch) {
      const key = optionMatch[1];
      const valStr = optionMatch[2];
      let value: boolean | number | string = valStr;

      if (valStr === 'true') {
        value = true;
      } else if (valStr === 'false') {
        value = false;
      } else if (!Number.isNaN(Number(valStr))) {
        value = Number(valStr);
      }

      args.push({ key, type: 'option', value });
      continue;
    }

    // 3) literal: 数値 or 文字列
    const numVal = Number(token);
    if (Number.isNaN(numVal)) {
      args.push({ type: 'literal', value: token });
    } else {
      args.push({ type: 'literal', value: numVal });
    }
  }

  return args;
}
