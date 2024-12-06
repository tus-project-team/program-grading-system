#[allow(warnings)]
mod bindings;

use bindings::Guest;
use parser::parse;
use tokenizer::tokenize;

struct Component;

impl Guest for Component {
    fn get_tokens(source: String) -> String {
        let tokens = tokenize(source);
        let tokens_str = tokens
            .iter()
            .map(|token| format!("{:?}", token))
            .collect::<Vec<String>>()
            .join(", ");
        tokens_str
    }

    fn get_ast(source: String) -> String {
        let tokens = tokenize(source);
        let ast = parse(tokens);
        format!("{:?}", ast)
    }

    fn hello_world() -> String {
        "Hello, World!".to_string()
    }
}

bindings::export!(Component with_types_in bindings);
