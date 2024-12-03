use wast::{
    component,
    core::{self},
    parser::ParseBuffer,
    token::{Id, Span},
    Wat,
};

const TEMPLATE: &str = include_str!("template.wat");

type CoreParameters<'a> = Box<
    [(
        Option<Id<'a>>,
        Option<wast::token::NameAnnotation<'a>>,
        core::ValType<'a>,
    )],
>;

pub struct CodeGenerator<'a> {
    ast: ast::Program,
    buffer: ParseBuffer<'a>,
    span: Span,
}

impl CodeGenerator<'_> {
    pub fn new(ast: ast::Program) -> wast::parser::Result<Self> {
        let buffer = ParseBuffer::new(TEMPLATE)?;
        Ok(Self {
            ast,
            buffer,
            span: Span::from_offset(0),
        })
    }

    pub fn generate(&mut self) -> wast::parser::Result<Wat<'_>> {
        let mut wat = wast::parser::parse::<Wat>(&self.buffer).unwrap();
        match wat {
            Wat::Component(ref mut component) => match component.kind {
                component::ComponentKind::Text(ref mut items) => {
                    if let Some(main_module) = items.iter_mut().find_map(|item| match item {
                        component::ComponentField::CoreModule(module) => {
                            if let Some(id) = module.id {
                                if id.name() == "Main" {
                                    return Some(module);
                                }
                            }
                            None
                        }
                        _ => None,
                    }) {
                        if let component::CoreModuleKind::Inline { ref mut fields } =
                            main_module.kind
                        {
                            fields.append(
                                &mut self
                                    .generate_functions()
                                    .into_iter()
                                    .map(core::ModuleField::Func)
                                    .collect::<Vec<_>>(),
                            );
                        } else {
                            unreachable!("expected the main module to be inline")
                        }
                    } else {
                        unreachable!("unable to find main module in the template")
                    }
                }
                _ => unreachable!("expected the template to be written in text format"),
            },
            _ => unreachable!("expected the template to be component"),
        };
        Ok(wat)
    }

    fn generate_functions(&self) -> Vec<core::Func<'_>> {
        self.ast
            .functions
            .iter()
            .map(|f| self.generate_function(f))
            .collect()
    }

    fn generate_function<'a>(&self, function: &'a ast::FunctionDefinition) -> core::Func<'a> {
        core::Func {
            span: self.span,
            id: Some(self.generate_identifier(&function.name)),
            exports: core::InlineExport {
                names: vec![&function.name.name],
            },
            name: None,
            kind: core::FuncKind::Inline {
                locals: self.generate_locals(&function.body),
                expression: self.generate_body(&function.body),
            },
            ty: core::TypeUse {
                index: None,
                inline: Some(core::FunctionType {
                    params: self.generate_parameters(&function.parameters),
                    results: Box::new([self.generate_type(&function.return_type)]),
                }),
            },
        }
    }

    fn generate_locals<'a>(&self, body: &'a ast::Block) -> Box<[wast::core::Local<'a>]> {
        body.statements
            .statements
            .iter()
            .filter_map(|statement| {
                if let ast::Statement::VariableDefinition(ref variable) = statement {
                    Some(core::Local {
                        id: Some(self.generate_identifier(&variable.name)),
                        name: None,
                        ty: self.generate_type(&variable.variable_type),
                    })
                } else {
                    None
                }
            })
            .collect()
    }

    fn generate_body<'a>(&self, body: &'a ast::Block) -> core::Expression<'a> {
        core::Expression {
            branch_hints: Box::new([]),
            instr_spans: None,
            instrs: self.generate_instructions(body),
        }
    }

    fn generate_instructions<'a>(&self, body: &'a ast::Block) -> Box<[core::Instruction<'a>]> {
        body.statements
            .statements
            .iter()
            .flat_map(|statement| match statement {
                ast::Statement::VariableDefinition(ref variable) => {
                    if let Some(ref initial_value) = variable.value {
                        let mut instructions = self.generate_expression(initial_value);
                        instructions.push(core::Instruction::LocalSet(wast::token::Index::Id(
                            self.generate_identifier(&variable.name),
                        )));
                        instructions
                    } else {
                        vec![]
                    }
                }
                ast::Statement::ExpressionStatement(ref statement) => {
                    let mut instructions = self.generate_expression(&statement.expression);
                    instructions.push(core::Instruction::Drop);
                    instructions
                }
                ast::Statement::Expression(ref expression) => self.generate_expression(expression),
            })
            .collect()
    }

    fn generate_expression<'a>(
        &self,
        expression: &'a ast::Expression,
    ) -> Vec<core::Instruction<'a>> {
        match expression {
            ast::Expression::BinaryExpression(expr) => {
                let lhs = self.generate_expression(&expr.left);
                let rhs = self.generate_expression(&expr.right);
                let mut instructions = Vec::with_capacity(lhs.len() + rhs.len() + 1);
                instructions.extend(lhs);
                instructions.extend(rhs);
                match expr.operator.operator {
                    ast::OperatorKind::Add => instructions.push(core::Instruction::I32Add),
                    ast::OperatorKind::Subtract => instructions.push(core::Instruction::I32Sub),
                    ast::OperatorKind::Multiply => instructions.push(core::Instruction::I32Mul),
                    ast::OperatorKind::Divide => instructions.push(core::Instruction::I32DivS),
                }
                instructions
            }
            ast::Expression::AssignmentExpression(expr) => {
                let value = self.generate_expression(&expr.value);
                let mut instuctions = Vec::with_capacity(value.len() + 2);
                instuctions.extend_from_slice(&value);
                instuctions.push(core::Instruction::LocalSet(wast::token::Index::Id(
                    self.generate_identifier(&expr.name),
                )));
                instuctions.push(core::Instruction::LocalGet(wast::token::Index::Id(
                    self.generate_identifier(&expr.name),
                )));
                instuctions
            }
            ast::Expression::FunctionCall(call) => {
                let mut instructions = Vec::new();
                for arg in &call.arguments {
                    instructions.extend(self.generate_expression(arg));
                }
                instructions.push(core::Instruction::Call(wast::token::Index::Id(
                    self.generate_identifier(&call.name),
                )));
                instructions
            }
            ast::Expression::Identifier(identifier) => {
                vec![core::Instruction::LocalGet(wast::token::Index::Id(
                    self.generate_identifier(identifier),
                ))]
            }
            ast::Expression::IntegerLiteral(literal) => {
                let value: i32 = literal.value.parse().unwrap();
                vec![core::Instruction::I32Const(value)]
            }
        }
    }

    fn generate_parameters<'a>(&self, parameters: &'a ast::Parameters) -> CoreParameters<'a> {
        parameters
            .parameters
            .iter()
            .map(|param| {
                (
                    Some(self.generate_identifier(&param.name)),
                    None,
                    self.generate_type(&param.parameter_type),
                )
            })
            .collect()
    }

    fn generate_identifier<'a>(&self, identifier: &'a ast::Identifier) -> wast::token::Id<'a> {
        wast::token::Id::new(&identifier.name, self.span)
    }

    fn generate_type<'a>(&self, ast_type: &'a ast::Type) -> core::ValType<'a> {
        match ast_type.name {
            ast::TypeKind::I32 => core::ValType::I32,
            ast::TypeKind::I64 => core::ValType::I64,
        }
    }
}

#[cfg(test)]
mod tests {
    use ::core::str;

    use super::*;
    use indoc::indoc;
    use wasmtime::{
        component::{Component, Linker, Val},
        Config, Engine, Store,
    };
    use wasmtime_wasi::{pipe::MemoryOutputPipe, ResourceTable, WasiCtx, WasiCtxBuilder, WasiView};

    struct State {
        ctx: WasiCtx,
        table: ResourceTable,
    }

    impl WasiView for State {
        fn ctx(&mut self) -> &mut WasiCtx {
            &mut self.ctx
        }

        fn table(&mut self) -> &mut ResourceTable {
            &mut self.table
        }
    }

    fn compile(source: &str) -> wast::parser::Result<Vec<u8>> {
        let tokens = tokenizer::tokenize(source.to_string());
        let ast = parser::parse(tokens);
        let mut generator = CodeGenerator::new(ast)?;
        let mut wat = generator.generate()?;
        let wasm = wat.encode()?;
        Ok(wasm)
    }

    #[derive(Debug, Clone, PartialEq, Eq)]
    struct RunResult {
        stdout: String,
        stderr: String,
    }

    fn run(source: &str) -> wasmtime::Result<RunResult> {
        let mut config = Config::new();
        config.wasm_component_model(true);

        let engine = Engine::new(&config)?;

        let mut linker = Linker::<State>::new(&engine);
        wasmtime_wasi::add_to_linker_sync(&mut linker)?;

        let stdout_steram = MemoryOutputPipe::new(1024);
        let stderr_stream = MemoryOutputPipe::new(1024);

        let mut builder = WasiCtxBuilder::new();
        builder.stdout(stdout_steram.clone());
        builder.stderr(stderr_stream.clone());
        let wasi_ctx = builder.build();

        let mut store = Store::new(
            &engine,
            State {
                ctx: wasi_ctx,
                table: ResourceTable::new(),
            },
        );

        let wasm = compile(source)?;
        let component = Component::from_binary(&engine, &wasm)?;

        let instance = linker.instantiate(&mut store, &component)?;

        let main_index = instance
            .get_export(&mut store, None, "wasi:cli/run@0.2.2")
            .unwrap();
        let run_index = instance
            .get_export(&mut store, Some(&main_index), "run")
            .unwrap();
        let run = instance.get_func(&mut store, run_index).unwrap();

        let mut results = [Val::Result(Ok(None))];
        run.call(&mut store, &[], &mut results)?;

        let stdout_bytes = stdout_steram.contents();
        let stdout_str = str::from_utf8(&stdout_bytes)?;

        let stderr_bytes = stderr_stream.contents();
        let stderr_str = str::from_utf8(&stderr_bytes)?;

        Ok(RunResult {
            stdout: stdout_str.to_string(),
            stderr: stderr_str.to_string(),
        })
    }

    #[test]
    fn return_zero() {
        let source = "fn main() -> i32 { 0 }";
        run(source).unwrap();
    }

    #[test]
    fn print_int() {
        let source = "fn main() -> i32 { print_int(1234); 0 }";
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "1234");
    }

    #[test]
    fn print_char() {
        let source = "fn main() -> i32 { print_char(65); 0 }";
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "A");
    }

    #[test]
    fn hello_world() {
        let source = indoc! {"
            fn main() -> i32 {
                print_char(72);  // 'H'
                print_char(101); // 'e'
                print_char(108); // 'l'
                print_char(108); // 'l'
                print_char(111); // 'o'
                print_char(44);  // ','
                print_char(32);  // ' '
                print_char(87);  // 'W'
                print_char(111); // 'o'
                print_char(114); // 'r'
                print_char(108); // 'l'
                print_char(100); // 'd'
                print_char(33);  // '!'
                0
            }
        "};
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "Hello, World!");
    }

    #[test]
    fn immutable_variables() {
        let source = indoc! {"
            fn main() -> i32 {
                let a: i32 = 1234;
                let b: i32 = 5678;
                print_int(a);
                print_char(32); // ' '
                print_int(b);
                print_char(32); // ' '
                print_int(a + b);
                0
            }
        "};
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "1234 5678 6912");
    }

    #[test]
    fn mutable_variables() {
        let source = indoc! {"
            fn main() -> i32 {
                var a: i32 = 1234;
                var b: i32;
                b = 5678;
                a = a + b;
                print_int(a);
                print_char(32); // ' '
                print_int(b);
                0
            }
        "};
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "6912 5678");
    }

    #[test]
    fn functions() {
        let source = indoc! {"
            fn print_space() -> i32 {
                print_char(32); // ' '
                0
            }

            fn add(a: i32, b: i32) -> i32 {
                a + b
            }

            fn sub(a: i32, b: i32) -> i32 {
                a - b
            }

            fn mul(a: i32, b: i32) -> i32 {
                a * b
            }

            fn div(a: i32, b: i32) -> i32 {
                a / b
            }

            fn main() -> i32 {
                print_int(add(1234, 5678));
                print_space();
                print_int(sub(5678, 1234));
                print_space();
                print_int(mul(1234, 5678));
                print_space();
                print_int(div(5678, 1234));
                print_space();
                print_int(1234 + 5678 - 5678 * 1234 / 5678);
                print_space();
                print_int(sub(add(1234, 5678), div(mul(5678, 1234), 5678)));
                0
            }
        "};
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "6912 4444 7006652 4 5678 5678");
    }

    #[test]
    fn calculate() {
        let source = indoc! {"
            fn main() -> i32 {
                let result: i32 = (1 + 2) + 3 * 4 / 5 - -2 + (-2);
                print_int(result);
                0
            }
        "};
        let stdout = run(source).unwrap().stdout;
        assert_eq!(stdout, "5");
    }
}
