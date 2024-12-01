use super::ast::{
    AssignmentExpression, BinaryExpression, Block, Expression, ExpressionStatement,
    FunctionDefinition, Identifier, IntegerLiteral, Location, Operator, OperatorKind, Parameter,
    Parameters, Program, Statement, Statements, Type, TypeKind, VariableDefinition,
};
use crate::tokenize::token::{Token, TokenKind};

pub struct Parser {
    /// The tokens to parse.
    tokens: Vec<Token>,

    /// The current index of the token being parsed.
    current: usize,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Parser {
        Parser { tokens, current: 0 }
    }

    pub fn parse(&mut self) -> Program {
        self.program()
    }

    fn peek_token(&self, offset: usize) -> Option<&Token> {
        self.tokens.get(self.current + offset)
    }

    fn advance_token(&mut self) -> Option<&Token> {
        let token = self.tokens.get(self.current);
        self.current += 1;
        token
    }

    fn consume_token_kind(&mut self, token_kind: TokenKind) -> Option<&Token> {
        if let Some(token) = self.peek_token(0) {
            if token.kind == token_kind {
                self.advance_token()
            } else {
                None
            }
        } else {
            None
        }
    }

    fn consume_token(&mut self, token_kind: TokenKind, value: &str) -> Option<&Token> {
        if let Some(token) = self.peek_token(0) {
            if token.kind == token_kind && token.value == value {
                self.advance_token()
            } else {
                None
            }
        } else {
            None
        }
    }

    /// Rollback the parser to the previous state if the transaction fails
    fn transaction<F, T>(&mut self, transaction: F) -> Option<T>
    where
        F: FnOnce(&mut Self) -> Option<T>,
    {
        let mark = self.current;
        let result = transaction(self);
        if result.is_none() {
            self.current = mark;
        }
        result
    }

    /// ```bnf
    /// program = function_definition*
    /// ```
    fn program(&mut self) -> Program {
        let mut functions: Vec<FunctionDefinition> = Vec::new();
        while let Some(function) = self.function_definition() {
            functions.push(function);
        }
        Program { functions }
    }

    /// ```bnf
    /// function_definition = "fn" identifier parameters "->" type block
    /// ```
    fn function_definition(&mut self) -> Option<FunctionDefinition> {
        self.transaction(|tx| {
            tx.consume_token(TokenKind::Keyword, "fn")?;
            let name = tx.identifier()?;
            let parameters = tx.parameters()?;
            tx.consume_token(TokenKind::Operator, "->")?;
            let return_type = tx.r#type()?;
            let body = tx.block()?;
            Some(FunctionDefinition {
                location: Location {
                    start: name.location.start,
                    end: body.location.end,
                },
                name,
                parameters,
                return_type,
                body,
            })
        })
    }

    /// ```bnf
    /// parameters = "(" parameter ("," parameter)* ")"
    /// ```
    fn parameters(&mut self) -> Option<Parameters> {
        self.transaction(|tx| {
            let start_position = tx.consume_token(TokenKind::Delimiter, "(")?.start_position;
            let mut parameters: Vec<Parameter> = Vec::new();
            while let Some(parameter) = tx.parameter() {
                parameters.push(parameter);
                if tx.consume_token(TokenKind::Delimiter, ",").is_none() {
                    break;
                }
            }
            let end_position = tx.consume_token(TokenKind::Delimiter, ")")?.end_position;
            Some(Parameters {
                location: Location {
                    start: start_position,
                    end: end_position,
                },
                parameters,
            })
        })
    }

    /// ```bnf
    /// parameter = identifier ":" type
    /// ```
    fn parameter(&mut self) -> Option<Parameter> {
        self.transaction(|tx| {
            let name = tx.identifier()?;
            tx.consume_token(TokenKind::Delimiter, ":")?;
            let parameter_type = tx.r#type()?;
            Some(Parameter {
                location: Location {
                    start: name.location.start,
                    end: parameter_type.location.end,
                },
                name,
                parameter_type,
            })
        })
    }

    /// ```bnf
    /// block = "{" statement* expression? "}"
    /// ```
    fn block(&mut self) -> Option<Block> {
        self.transaction(|tx| {
            let start_position = tx.consume_token(TokenKind::Delimiter, "{")?.start_position;
            let mut statements: Vec<Statement> = Vec::new();
            while let Some(statement) = tx.statement() {
                statements.push(statement);
            }
            if let Some(expression) = tx.expression() {
                statements.push(Statement::Expression(expression));
            }
            let end_position = tx.consume_token(TokenKind::Delimiter, "}")?.end_position;
            Some(Block {
                location: Location {
                    start: start_position,
                    end: end_position,
                },
                statements: Statements {
                    location: Location {
                        start: start_position,
                        end: end_position,
                    },
                    statements,
                },
            })
        })
    }

    /// ```bnf
    /// statement =
    ///     variable_definition_statement
    ///   | expression_statement
    /// ```
    fn statement(&mut self) -> Option<Statement> {
        self.transaction(|tx| {
            if let Some(statement) = tx.variable_definition_statement() {
                Some(Statement::VariableDefinition(statement))
            } else {
                tx.expression_statement()
                    .map(Statement::ExpressionStatement)
            }
        })
    }

    /// ```bnf
    /// variable_definition_statement =
    ///     "let" identifier ":" type "=" expression ";"     (* immutable *)
    ///   | "var" identifier ":" type ("=" expression)? ";"  (* mutable *)
    /// ```
    fn variable_definition_statement(&mut self) -> Option<VariableDefinition> {
        self.transaction(|tx| {
            let start_position = tx.peek_token(0)?.start_position;
            let mutable = if tx.consume_token(TokenKind::Keyword, "let").is_some() {
                false
            } else if tx.consume_token(TokenKind::Keyword, "var").is_some() {
                true
            } else {
                return None;
            };
            let name = tx.identifier()?;
            tx.consume_token(TokenKind::Delimiter, ":")?;
            let variable_type = tx.r#type()?;
            let value = if tx.consume_token(TokenKind::Operator, "=").is_some() {
                Some(tx.expression()?)
            } else {
                None
            };
            let end_position = tx.consume_token(TokenKind::Delimiter, ";")?.end_position;
            Some(VariableDefinition {
                location: Location {
                    start: start_position,
                    end: end_position,
                },
                name,
                mutable,
                variable_type,
                value,
            })
        })
    }

    /// ```bnf
    /// expression_statement = expression ";"
    /// ```
    fn expression_statement(&mut self) -> Option<ExpressionStatement> {
        self.transaction(|tx| {
            let expression = tx.expression()?;
            let end_position = tx.consume_token(TokenKind::Delimiter, ";")?.end_position;
            Some(ExpressionStatement {
                location: Location {
                    start: expression.location().start,
                    end: end_position,
                },
                expression,
            })
        })
    }

    /// ```bnf
    /// expression = add_expression
    /// ```
    fn expression(&mut self) -> Option<Expression> {
        self.add_expression()
    }

    /// ```bnf
    /// add_expression = mul_expression (("+" | "-") mul_expression)*
    /// ```
    fn add_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let lhs = tx.mul_expression()?;
            let mut expression = lhs;
            while let Some(operator) = tx.consume_add_operator() {
                tx.advance_token();
                let rhs = tx.mul_expression()?;
                let location = Location {
                    start: expression.location().start,
                    end: rhs.location().end,
                };
                expression = Expression::BinaryExpression(BinaryExpression {
                    location,
                    left: Box::new(expression),
                    operator,
                    right: Box::new(rhs),
                });
            }
            Some(expression)
        })
    }

    fn consume_add_operator(&mut self) -> Option<Operator> {
        let token = {
            let token = self.peek_token(0)?;
            if token.kind != TokenKind::Operator {
                return None;
            }
            let location = Location {
                start: token.start_position,
                end: token.end_position,
            };
            match token.value.as_str() {
                "+" => Some(Operator {
                    operator: OperatorKind::Add,
                    location,
                }),
                "-" => Some(Operator {
                    operator: OperatorKind::Subtract,
                    location,
                }),
                _ => None,
            }
        };
        if token.is_some() {
            self.advance_token();
        }
        token
    }

    /// ```bnf
    /// mul_expression = unary_expression (("*" | "/") unary_expression)*
    /// ```
    fn mul_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let lhs = tx.unary_expression()?;
            let mut expression = lhs;
            while let Some(operator) = tx.consume_mul_operator() {
                let rhs = tx.unary_expression()?;
                let location = Location {
                    start: expression.location().start,
                    end: rhs.location().end,
                };
                expression = Expression::BinaryExpression(BinaryExpression {
                    location,
                    left: Box::new(expression),
                    operator,
                    right: Box::new(rhs),
                });
            }
            Some(expression)
        })
    }

    fn consume_mul_operator(&mut self) -> Option<Operator> {
        let token = {
            let token = self.peek_token(0)?;
            if token.kind != TokenKind::Operator {
                return None;
            }
            let location = Location {
                start: token.start_position,
                end: token.end_position,
            };
            match token.value.as_str() {
                "*" => Some(Operator {
                    operator: OperatorKind::Multiply,
                    location,
                }),
                "/" => Some(Operator {
                    operator: OperatorKind::Divide,
                    location,
                }),
                _ => None,
            }
        };
        if token.is_some() {
            self.advance_token();
        }
        token
    }

    /// ```bnf
    /// unary_expression =
    ///     primary_expression
    ///   | "-" primary_expression
    /// ```
    fn unary_expression(&mut self) -> Option<Expression> {
        self.primary_expression().or_else(|| {
            self.transaction(|tx| {
                let (minus_start_position, minus_end_position) = {
                    let token = tx.consume_token(TokenKind::Operator, "-")?;
                    (token.start_position, token.end_position)
                };
                let expression = tx.primary_expression()?;
                Some(Expression::BinaryExpression(BinaryExpression {
                    location: Location {
                        start: minus_start_position,
                        end: expression.location().end,
                    },
                    left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        location: Location {
                            start: minus_start_position,
                            end: minus_start_position,
                        },
                        value: "0".to_string(),
                    })),
                    operator: Operator {
                        operator: OperatorKind::Subtract,
                        location: Location {
                            start: minus_start_position,
                            end: minus_end_position,
                        },
                    },
                    right: Box::new(expression),
                }))
            })
        })
    }

    /// ```bnf
    /// primary_expression =
    ///     literal
    ///   | assignment_expression
    ///   | identifier
    ///   | "(" expression ")"
    /// ```
    fn primary_expression(&mut self) -> Option<Expression> {
        self.literal()
            .or_else(|| self.assignment_expression())
            .or_else(|| self.identifier().map(Expression::Identifier))
            .or_else(|| {
                self.transaction(|tx| {
                    tx.consume_token(TokenKind::Delimiter, "(")?;
                    let expression = tx.expression()?;
                    tx.consume_token(TokenKind::Delimiter, ")")?;
                    Some(expression)
                })
            })
    }

    /// ```bnf
    /// assignment_expression = identifier "=" expression
    /// ```
    fn assignment_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let identifier = tx.identifier()?;
            tx.consume_token(TokenKind::Operator, "=")?;
            let expression = tx.expression()?;
            Some(Expression::AssignmentExpression(AssignmentExpression {
                location: Location {
                    start: identifier.location.start,
                    end: expression.location().end,
                },
                name: identifier,
                value: Box::new(expression),
            }))
        })
    }

    /// ```bnf
    /// literal = INTEGER
    /// ```
    /// where `INTEGER` is a `TokenKind::Integer` token.
    fn literal(&mut self) -> Option<Expression> {
        self.consume_token_kind(TokenKind::Integer).map(|token| {
            Expression::IntegerLiteral(IntegerLiteral {
                location: Location {
                    start: token.start_position,
                    end: token.end_position,
                },
                value: token.value.clone(),
            })
        })
    }

    /// ```bnf
    /// identifier = IDENTIFIER
    /// ```
    /// where `IDENTIFIER` is a `TokenKind::Identifier` token.
    fn identifier(&mut self) -> Option<Identifier> {
        self.consume_token_kind(TokenKind::Identifier)
            .map(|token| Identifier {
                name: token.value.clone(),
                location: Location {
                    start: token.start_position,
                    end: token.end_position,
                },
            })
    }

    /// ```bnf
    /// type = "i32" | "i64"
    /// ```
    fn r#type(&mut self) -> Option<Type> {
        self.transaction(|tx| {
            let token = tx.advance_token()?;
            let location = Location {
                start: token.start_position,
                end: token.end_position,
            };
            match token.kind {
                TokenKind::Identifier => match token.value.as_str() {
                    "i32" => Some(Type {
                        name: TypeKind::I32,
                        location,
                    }),
                    "i64" => Some(Type {
                        name: TypeKind::I64,
                        location,
                    }),
                    _ => None,
                },
                _ => None,
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use indoc::indoc;

    use super::Parser;
    use crate::{
        parse::ast::*,
        tokenize::{position::Position, tokenizer::Tokenizer},
    };

    #[test]
    fn parse_program_returns_function_definition() {
        let source = indoc! {"
            fn main() -> i32 { 0 }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens.clone()).parse();
        assert_eq!(
            ast,
            Program {
                functions: vec![FunctionDefinition {
                    name: Identifier {
                        name: "main".to_string(),
                        location: Location {
                            start: Position {
                                index: 3,
                                line: 1,
                                column: 4,
                            },
                            end: Position {
                                index: 7,
                                line: 1,
                                column: 8,
                            },
                        },
                    },
                    parameters: Parameters {
                        parameters: vec![],
                        location: Location {
                            start: Position {
                                index: 7,
                                line: 1,
                                column: 8,
                            },
                            end: Position {
                                index: 9,
                                line: 1,
                                column: 10,
                            },
                        },
                    },
                    return_type: Type {
                        name: TypeKind::I32,
                        location: Location {
                            start: Position {
                                index: 13,
                                line: 1,
                                column: 14,
                            },
                            end: Position {
                                index: 16,
                                line: 1,
                                column: 17,
                            },
                        },
                    },
                    body: Block {
                        statements: Statements {
                            statements: vec![Statement::Expression(Expression::IntegerLiteral(
                                IntegerLiteral {
                                    value: "0".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 19,
                                            line: 1,
                                            column: 20,
                                        },
                                        end: Position {
                                            index: 20,
                                            line: 1,
                                            column: 21,
                                        },
                                    },
                                },
                            ),),],
                            location: Location {
                                start: Position {
                                    index: 17,
                                    line: 1,
                                    column: 18,
                                },
                                end: Position {
                                    index: 22,
                                    line: 1,
                                    column: 23,
                                },
                            },
                        },
                        location: Location {
                            start: Position {
                                index: 17,
                                line: 1,
                                column: 18,
                            },
                            end: Position {
                                index: 22,
                                line: 1,
                                column: 23,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: Position {
                            index: 22,
                            line: 1,
                            column: 23,
                        },
                    },
                },],
            }
        );
    }
}
