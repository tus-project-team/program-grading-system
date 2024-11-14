# Shuiro Language

## Variables

Variables are declared using the `let` keyword.
The type of the variable must be specified.

```shuiro
let x: i32 = 10;
let y: i64 = 20;
```

## Functions

Functions are declared using the `fn` keyword.

For example, the following code defines a function `add` that takes two arguments `x` and `y` of type `i32` and returns their sum.

```shuiro
fn add(x: i32, y: i32) -> i32 {
    x + y
}
```

## Control Flow

### If

The `if` expression is used to branch the code based on a condition.

For example, the following code prints whether `x` is greater than `y`.

```shuiro
if x > y {
    println("x is greater than y");
} else {
    println("x is less than or equal to y");
}
```

### For

The `for` statement is used to iterate over a range of values.

For example, the following code prints the numbers from 1 to 3.

```shuiro
for i in [1, 2, 3] {
    println(i);
}
```

### While

The `while` statement is used to repeatedly execute a block of code as long as a condition is true.

For example, the following code prints the numbers from 1 to 3.

```shuiro
let i: i32 = 1;
while i <= 3 {
    println(i);
    i = i + 1;
}
```

## Comments

### Single-line Comments

Comments start with `//` and continue until the end of the line.

```shuiro
// This is a comment
```

### Multi-line Comments

Comments start with `/*` and end with `*/`.

```shuiro
/**
 * This is a multi-line comment
 */
```

## Data Types

Shuiro has the following built-in data types:

- `i32`: 32-bit signed integer
- `i64`: 64-bit signed integer
- `f32`: 32-bit floating-point number
- `f64`: 64-bit floating-point number
- `bool`: Boolean value

## Operators

### Arithmetic Operators

- `+`: Addition
- `-`: Subtraction
- `*`: Multiplication
- `/`: Division

```shuiro
let x: i32 = 1 + 2 * 3 / 4 - 5;
```

### Comparison Operators

- `==`: Equal to
- `!=`: Not equal to
- `<`: Less than
- `>`: Greater than
- `<=`: Less than or equal to
- `>=`: Greater than or equal to

```shuiro
let x = 10 > 5;  // true
let y = 10 == 5; // false
```
