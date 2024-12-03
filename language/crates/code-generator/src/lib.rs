use wast::{
    component,
    core::{self},
    parser::ParseBuffer,
    token::{Id, Span},
    Wat,
};

const TEMPLATE: &str = include_str!("template.wat");

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
                let mut instuctions = self.generate_expression(&expr.value);
                instuctions.push(core::Instruction::LocalSet(wast::token::Index::Id(
                    self.generate_identifier(&expr.name),
                )));
                instuctions
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

    fn generate_parameters<'a>(
        &self,
        parameters: &'a ast::Parameters,
    ) -> Box<
        [(
            Option<Id<'a>>,
            Option<wast::token::NameAnnotation<'a>>,
            core::ValType<'a>,
        )],
    > {
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
    use super::*;

    #[test]
    fn test_generate() {
        let source = "fn main() -> i32 { let i: i32 = 1; i - 1 }";
        let tokens = tokenizer::tokenize(source.to_string());
        let ast = parser::parse(tokens);
        let mut generator = CodeGenerator::new(ast).unwrap();
        let mut wat = generator.generate().unwrap();
        let wat_str = format!("{:#?}", wat);
        let wasm = wat.encode().unwrap();
        std::fs::write("test.wat", &wat_str).unwrap();
        std::fs::write("test.wasm", &wasm).unwrap();
    }
}
