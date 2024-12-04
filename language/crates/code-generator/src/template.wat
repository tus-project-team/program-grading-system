(component
  ;; environment
  (core module $Env
    (memory $memory 17)
    (export "memory" (memory $memory))
  )
  (core instance $core|env (instantiate $Env))
  (alias core export $core|env "memory" (core memory $memory))


  ;; dependencies
  (import "wasi:io/error@0.2.2" (instance $wasi:io/error@0.2.2
    (export (;0;) "error" (type (sub resource)))
  ))
  (alias export $wasi:io/error@0.2.2 "error" (type $error))

  (import "wasi:io/streams@0.2.2" (instance $wasi:io/streams@0.2.2
    (alias outer 1 $error (type $error))

    (type $stream-error-type (variant
      (case "last-operation-failed" (own $error))
      (case "closed")
    ))
    (export $stream-error "stream-error" (type (eq $stream-error-type)))

    (export $output-stream "output-stream" (type (sub resource)))
    (export $output-stream.blocking-write-and-flush "[method]output-stream.blocking-write-and-flush"
      (func
        (param "self" (borrow $output-stream))
        (param "contents" (list u8))
        (result (result (error $stream-error)))
      )
    )
  ))
  (alias export $wasi:io/streams@0.2.2 "output-stream" (type $output-stream))
  (core func $core|output-stream.blocking-write-and-flush (canon lower
    (func $wasi:io/streams@0.2.2 "[method]output-stream.blocking-write-and-flush")
    (memory $memory)
  ))
  (core instance $core|wasi:io/streams@0.2.2
    (export "[method]output-stream.blocking-write-and-flush" (func $core|output-stream.blocking-write-and-flush))
  )

  (import "wasi:cli/stdout@0.2.2" (instance $wasi:cli/stdout@0.2.2
    (alias outer 1 $output-stream (type $output-stream))
    (export $get-stdout "get-stdout"
      (func (result (own $output-stream)))
    )
  ))
  (core func $core|get-stdout (canon lower
    (func $wasi:cli/stdout@0.2.2 "get-stdout")
  ))
  (core instance $core|wasi:cli/stdout@0.2.2
    (export "get-stdout" (func $core|get-stdout))
  )


  ;; std module - Shuiro Standard Library v0
  (core module $Std
    (import "env" "memory" (memory $memory 0))

    (import "wasi:cli/stdout@0.2.2" "get-stdout"
      (func $get-stdout (result i32))
    )
    (import "wasi:io/streams@0.2.2" "[method]output-stream.blocking-write-and-flush"
      (func $output-stream.blocking-write-and-flush (param i32 i32 i32 i32))
    )

    (global $stack_pointer (mut i32) (i32.const 0))

    ;;; Prints an integer to stdout.
    ;;;
    ;;; # Parameters
    ;;; - $value: i32 - The integer to convert to a string.
    ;;; - $ptr: i32 - The pointer to the memory location to write the string to.
    ;;;
    ;;; # Returns
    ;;; - i32 - The length of the string (bytes).
    ;;;
    ;;; # Example
    ;;; ```wat
    ;;; ;; $memory[0..3] = "123";
    ;;; (local.set $length (call $int_to_string (i32.const 123) (i32.const 0)))
    ;;; (local.get $length) ;; 3
    ;;; ```
    (func $int_to_string (export "int_to_string") (param $value i32) (param $ptr i32) (result i32)
      (local $tmp i32)         ;; i32    - temporary variable
      (local $i i32)           ;; i32    - loop variable
      (local $length i32)      ;; i32    - length of the string
      (local $is_negative i32) ;; 0 or 1 - 0: positive, 1: negative

      ;; $is_negative = if $value < 0 { 1 } else { 0 };
      (local.set $is_negative (i32.const 0))
      (if (i32.lt_s (local.get $value) (i32.const 0))
        (then
          (local.set $is_negative (i32.const 1))
          (local.set $value (i32.mul (local.get $value) (i32.const -1)))
        )
      )

      ;; $length = $is_negative;
      ;; $tmp = $value;
      ;; loop {
      ;;   $tmp /= 10;
      ;;   $length += 1;
      ;;   if $tmp != 0 { continue; } else { break; }
      ;; }
      (local.set $length (local.get $is_negative))
      (local.set $tmp (local.get $value))
      (loop $count_digits
        (local.set $tmp (i32.div_u (local.get $tmp) (i32.const 10)))
        (local.set $length (i32.add (local.get $length) (i32.const 1)))
        (br_if $count_digits (i32.ne (local.get $tmp) (i32.const 0)))
      )

      ;; $tmp = $value
      ;; $i = $length - 1
      ;; loop {
      ;;   $memory[$ptr + $i] = ($tmp % 10) + '0';
      ;;   $tmp /= 10;
      ;;   $i -= 1;
      ;;   if $i >= $is_negative { continue; } else { break; }
      ;; }
      ;; if $is_negative { $memory[$ptr] = '-'; }
      (local.set $tmp (local.get $value))
      (local.set $i (i32.sub (local.get $length) (i32.const 1)))
      (loop $write_digits
        (i32.store8
          (i32.add (local.get $ptr) (local.get $i))
          (i32.add (i32.rem_u (local.get $tmp) (i32.const 10)) (i32.const 48))
        )
        (local.set $tmp (i32.div_u (local.get $tmp) (i32.const 10)))
        (local.set $i (i32.sub (local.get $i) (i32.const 1)))
        (br_if $write_digits (i32.ge_s (local.get $i) (local.get $is_negative)))
      )
      (if (i32.eq (local.get $is_negative) (i32.const 1))
        (then
          (i32.store8 (local.get $ptr) (i32.const 45))
        )
      )

      (local.get $length)
    )

    ;;; Prints a character (ASCII code) to stdout.
    ;;;
    ;;; # Parameters
    ;;; - $value: i32 - The ASCII code of the character to print.
    ;;;
    ;;; # Example
    ;;; ```wat
    ;;; (call $print_char (i32.const 33)) ;; print_char('!');
    ;;; ```
    (func $print_char (export "print_char") (param $value i32) (result i32)
      (local $stdout i32)
      (local $offset i32)
      (local $result_ptr i32)

      (local.set $stdout (call $get-stdout))
      (local.set $offset (global.get $stack_pointer))

      ;; $memory[$offset] = $value;
      (i32.store8 (local.get $offset) (local.get $value))

      ;; // print the string to stdout
      ;; $result_ptr = $offset + 1 + (4 - (($offset + 1) % 4));
      ;; $output-stream.blocking-write-and-flush(
      ;;   $stdout,
      ;;   $offset,
      ;;   1,
      ;;   $result_ptr
      ;; );
      (local.set $result_ptr
        (i32.add
          (i32.add (local.get $offset) (i32.const 1))
          (i32.sub
            (i32.const 4)
            (i32.rem_u
              (i32.add (local.get $offset) (i32.const 1))
              (i32.const 4)
            )
          )
        )
      )
      (call $output-stream.blocking-write-and-flush
        (local.get $stdout)
        (local.get $offset)
        (i32.const 1)
        (local.get $result_ptr)
      )

      ;; // cleanup
      ;; $memory[$offset..($result_ptr + 3)] = null;
      (memory.fill
        (local.get $offset)
        (i32.const 0)
        (i32.sub (i32.add (local.get $result_ptr) (i32.const 3)) (local.get $offset))
      )
      (i32.const 0)
    )

    ;;; Prints an integer to stdout.
    ;;;
    ;;; # Parameters
    ;;; - $value: i32 - The integer to print.
    ;;;
    ;;; # Example
    ;;; ```wat
    ;;; (call $print_int (i32.const 123)) ;; print_int(123);
    ;;; ```
    (func $print_int (export "print_int") (param $value i32) (result i32)
      (local $stdout i32)
      (local $offset i32)
      (local $length i32)
      (local $result_ptr i32)

      (local.set $stdout (call $get-stdout))
      (local.set $offset (global.get $stack_pointer))
      (local.set $length (call $int_to_string (local.get $value) (local.get $offset)))

      ;; // print the string to stdout
      ;; $result_ptr = $offset + $length + (4 - (($offset + $length) % 4));
      ;; $output-stream.blocking-write-and-flush(
      ;;   $stdout,
      ;;   $offset,
      ;;   $length,
      ;;   $result_ptr
      ;; );
      (local.set $result_ptr
        (i32.add
          (i32.add (local.get $offset) (local.get $length))
          (i32.sub
            (i32.const 4)
            (i32.rem_u
              (i32.add (local.get $offset) (local.get $length))
              (i32.const 4)
            )
          )
        )
      )
      (call $output-stream.blocking-write-and-flush
        (local.get $stdout)
        (local.get $offset)
        (local.get $length)
        (local.get $result_ptr)
      )

      ;; // cleanup
      ;; $memory[$offset..($result_ptr + 3)] = null;
      (memory.fill
        (local.get $offset)
        (i32.const 0)
        (i32.sub (i32.add (local.get $result_ptr) (i32.const 3)) (local.get $offset))
      )
      (i32.const 0)
    )
  )
  (core instance $core|std (instantiate $Std
    (with "env" (instance $core|env))
    (with "wasi:cli/stdout@0.2.2" (instance $core|wasi:cli/stdout@0.2.2))
    (with "wasi:io/streams@0.2.2" (instance $core|wasi:io/streams@0.2.2))
  ))


  ;; main module
  (core module $Main
    (import "env" "memory" (memory $memory 0))

    (import "shuiro:std@0.0.0" "print_int"
      (func $print_int (param i32) (result i32))
    )
    (import "shuiro:std@0.0.0" "print_char"
      (func $print_char (param i32) (result i32))
    )
  )
  (core instance $core|main (instantiate $Main
    (with "env" (instance $core|env))
    (with "shuiro:std@0.0.0" (instance $core|std))
  ))


  ;; entry point
  (component $MainComponent
    (import "run" (func $run (result (result))))
    (export "run" (func $run))
  )
  (func $run (result (result)) (canon lift
    (core func $core|main "main")
  ))
  (instance $main_component (instantiate $MainComponent
    (with "run" (func $run))
  ))

  (export "wasi:cli/run@0.2.2" (instance $main_component))
)
