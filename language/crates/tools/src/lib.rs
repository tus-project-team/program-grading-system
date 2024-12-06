#[allow(warnings)]
mod bindings;

use bindings::Guest;
use code_generator::CodeGenerator;
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

    fn compile(source: String) -> bindings::Output {
        let tokens = tokenize(source);
        let ast = parse(tokens.clone());
        let mut generator = CodeGenerator::new(ast.clone()).unwrap();
        let mut wat = generator.generate().unwrap();
        let wasm = wat.encode().unwrap();
        bindings::Output {
            tokens: tokens
                .iter()
                .map(|token| format!("{:?}", token))
                .collect::<Vec<String>>()
                .join(", "),
            ast: format!("{:?}", ast),
            wasm,
        }
    }
}

bindings::export!(Component with_types_in bindings);
