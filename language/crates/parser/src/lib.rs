use ast::{
    AssignmentExpression, BinaryExpression, Block, Expression, ExpressionStatement, FunctionCall,
    FunctionDefinition, Identifier, IfElseExpression, IfStatement, IntegerLiteral, Location,
    Operator, OperatorKind, Parameter, Parameters, Program, Statement, Statements, Type, TypeKind,
    UnaryExpression, VariableDefinition,
};
use tokenizer::{
    position::Position,
    token::{Token, TokenKind},
};

pub fn parse(tokens: Vec<Token>) -> ast::Program {
    Parser::new(tokens).parse()
}

pub struct Parser {
    /// The tokens to parse.
    tokens: Vec<Token>,

    /// The current index of the token being parsed.
    current: usize,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Parser {
        let tokens_without_comments: Vec<Token> = tokens
            .into_iter()
            .filter(|token| token.kind != TokenKind::Comment)
            .collect();
        Parser {
            tokens: tokens_without_comments,
            current: 0,
        }
    }

    /// Parse the tokens into an AST.
    pub fn parse(&mut self) -> Program {
        self.program()
    }

    /// Peek at the token at the specified offset.
    fn peek_token(&self, offset: usize) -> Option<&Token> {
        self.tokens.get(self.current + offset)
    }

    /// Advance the parser to the next token.
    fn advance_token(&mut self) -> Option<&Token> {
        let token = self.tokens.get(self.current);
        self.current += 1;
        token
    }

    /// Consume a token with the specified kind.
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

    /// Consume a token with the specified kind and value.
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
    /// block_without_expression = "{" statement* "}"
    /// ```
    fn block_without_expression(&mut self) -> Option<Block> {
        self.transaction(|tx| {
            let start_position = tx.consume_token(TokenKind::Delimiter, "{")?.start_position;
            let mut statements: Vec<Statement> = Vec::new();
            while let Some(statement) = tx.statement() {
                statements.push(statement);
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
    /// block_with_expression = "{" statement* expression "}"
    /// ```
    fn block_with_expression(&mut self) -> Option<Block> {
        self.transaction(|tx| {
            let start_position = tx.consume_token(TokenKind::Delimiter, "{")?.start_position;
            let mut statements: Vec<Statement> = Vec::new();
            while let Some(statement) = tx.statement() {
                statements.push(statement);
            }
            let expression = tx.expression()?;
            statements.push(Statement::Expression(expression));
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
    ///   | if_statement
    ///   | expression_statement
    /// ```
    fn statement(&mut self) -> Option<Statement> {
        self.transaction(|tx| {
            tx.variable_definition_statement()
                .map(Statement::VariableDefinition)
                .or_else(|| tx.if_statement().map(Statement::IfStatement))
                .or_else(|| {
                    tx.expression_statement()
                        .map(Statement::ExpressionStatement)
                })
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
    /// if_statement = "if" expression block_without_expression ("else" if_statement | block_without_expression)?
    /// ```
    fn if_statement(&mut self) -> Option<IfStatement> {
        self.transaction(|tx| {
            let start_position = tx.consume_token(TokenKind::Keyword, "if")?.start_position;
            let condition = tx.expression()?;
            let then_block = tx.block_without_expression()?;
            let else_block = if tx.consume_token(TokenKind::Keyword, "else").is_some() {
                if let Some(if_statement) = tx.if_statement() {
                    let location = if_statement.location.clone();
                    Some(Block {
                        statements: Statements {
                            statements: vec![Statement::IfStatement(if_statement)],
                            location: location.clone(),
                        },
                        location,
                    })
                } else {
                    Some(tx.block_without_expression()?)
                }
            } else {
                None
            };
            let end_position = else_block
                .as_ref()
                .map(|block| block.location.end)
                .unwrap_or(then_block.location.end);
            Some(IfStatement {
                location: Location {
                    start: start_position,
                    end: end_position,
                },
                condition,
                then_block,
                else_block,
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
    /// expression = logical_expression
    /// ```
    fn expression(&mut self) -> Option<Expression> {
        self.logical_expression()
    }

    /// ```bnf
    /// logical_expression = comparison_expression (("&&" | "||") comparison_expression)*
    /// ```
    fn logical_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let lhs = tx.comparison_expression()?;
            let mut expression = lhs;
            while let Some(operator) = tx.consume_logical_operator() {
                let rhs = tx.comparison_expression()?;
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

    /// Consume a logical operator.
    fn consume_logical_operator(&mut self) -> Option<Operator> {
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
                "&&" => Some(Operator {
                    operator: OperatorKind::LogicalAnd,
                    location,
                }),
                "||" => Some(Operator {
                    operator: OperatorKind::LogicalOr,
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
    /// comparison_expression = add_expression (("<" | "<=" | ">" | ">=" | "==" | "!=") add_expression)*
    /// ```
    fn comparison_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let lhs = tx.add_expression()?;
            let mut expression = lhs;
            while let Some(operator) = tx.consume_comparison_operator() {
                let rhs = tx.add_expression()?;
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

    /// Consume a comparison operator.
    fn consume_comparison_operator(&mut self) -> Option<Operator> {
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
                "<" => Some(Operator {
                    operator: OperatorKind::LessThan,
                    location,
                }),
                "<=" => Some(Operator {
                    operator: OperatorKind::LessThanOrEqual,
                    location,
                }),
                ">" => Some(Operator {
                    operator: OperatorKind::GreaterThan,
                    location,
                }),
                ">=" => Some(Operator {
                    operator: OperatorKind::GreaterThanOrEqual,
                    location,
                }),
                "==" => Some(Operator {
                    operator: OperatorKind::Equal,
                    location,
                }),
                "!=" => Some(Operator {
                    operator: OperatorKind::NotEqual,
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
    /// add_expression = mul_expression (("+" | "-") mul_expression)*
    /// ```
    fn add_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let lhs = tx.mul_expression()?;
            let mut expression = lhs;
            while let Some(operator) = tx.consume_add_operator() {
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

    /// Consume an add operator.
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

    /// Consume a mul operator.
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
    ///     "-" unary_expression
    ///   | "!" unary_expression
    ///   | primary_expression
    /// ```
    fn unary_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            if let Some(minus_location) =
                tx.consume_token(TokenKind::Operator, "-")
                    .map(|token| Location {
                        start: token.start_position,
                        end: token.end_position,
                    })
            {
                let operand = tx.unary_expression()?;
                Some(Expression::BinaryExpression(BinaryExpression {
                    location: Location {
                        start: minus_location.start,
                        end: operand.location().end,
                    },
                    left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "0".to_string(),
                        location: Location {
                            start: minus_location.start,
                            end: minus_location.start,
                        },
                    })),
                    operator: Operator {
                        operator: OperatorKind::Subtract,
                        location: minus_location,
                    },
                    right: Box::new(operand),
                }))
            } else if let Some(not_location) =
                tx.consume_token(TokenKind::Operator, "!")
                    .map(|token| Location {
                        start: token.start_position,
                        end: token.end_position,
                    })
            {
                let operand = tx.unary_expression()?;
                Some(Expression::UnaryExpression(UnaryExpression {
                    location: Location {
                        start: not_location.start,
                        end: operand.location().end,
                    },
                    operand: Box::new(operand),
                    operator: Operator {
                        operator: OperatorKind::LogicalNot,
                        location: not_location,
                    },
                }))
            } else {
                tx.primary_expression()
            }
        })
    }

    /// ```bnf
    /// primary_expression =
    ///     literal
    ///   | assignment_expression
    ///   | if_else_expression
    ///   | function_call
    ///   | identifier
    ///   | "(" expression ")"
    /// ```
    fn primary_expression(&mut self) -> Option<Expression> {
        self.literal()
            .or_else(|| self.assignment_expression())
            .or_else(|| self.if_else_expression())
            .or_else(|| self.function_call())
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
    /// // TODO: remove `"as" type` and instead use a type inference algorithm
    /// if_else_expression = "if" expression block_with_expression "else" else_if_expression "as" type
    /// ```
    fn if_else_expression(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let start_position = tx.consume_token(TokenKind::Keyword, "if")?.start_position;
            let condition = tx.expression()?;
            let then_block = tx.block_with_expression()?;
            tx.consume_token(TokenKind::Keyword, "else")?;
            let mut else_block = tx.else_if_expression(Type {
                name: TypeKind::I32,
                location: Location {
                    start: Position {
                        index: 0,
                        line: 0,
                        column: 0,
                    },
                    end: Position {
                        index: 0,
                        line: 0,
                        column: 0,
                    },
                },
            })?;
            tx.consume_token(TokenKind::Keyword, "as")?;
            let return_type = tx.r#type()?;
            else_block
                .statements
                .statements
                .iter_mut()
                .for_each(|statement| {
                    if let Statement::Expression(Expression::IfElseExpression(if_else_expression)) =
                        statement
                    {
                        if_else_expression.return_type = return_type.clone();
                    }
                });
            let end_position = return_type.location.end;
            Some(Expression::IfElseExpression(IfElseExpression {
                location: Location {
                    start: start_position,
                    end: end_position,
                },
                condition: Box::new(condition),
                then_block,
                else_block,
                return_type,
            }))
        })
    }

    /// ```bnf
    /// else_if_expression =
    ///     "if" expression block_with_expression "else" else_if_expression
    ///   | block_with_expression
    /// ```
    fn else_if_expression(&mut self, return_type: Type) -> Option<Block> {
        self.transaction(|tx| {
            if let Some(start_position) = tx
                .consume_token(TokenKind::Keyword, "if")
                .map(|token| token.start_position)
            {
                let condition = tx.expression()?;
                let then_block = tx.block_with_expression()?;
                tx.consume_token(TokenKind::Keyword, "else")?;
                let else_block = tx.else_if_expression(return_type.clone())?;
                let location = Location {
                    start: start_position,
                    end: else_block.location.end,
                };
                let expression = Expression::IfElseExpression(IfElseExpression {
                    location: location.clone(),
                    condition: Box::new(condition),
                    then_block,
                    else_block,
                    return_type,
                });
                Some(Block {
                    statements: Statements {
                        statements: vec![Statement::Expression(expression)],
                        location: location.clone(),
                    },
                    location,
                })
            } else {
                Some(tx.block_with_expression()?)
            }
        })
    }

    /// ```bnf
    /// function_call = identifier "(" expression* ")"
    /// ```
    fn function_call(&mut self) -> Option<Expression> {
        self.transaction(|tx| {
            let identifier = tx.identifier()?;
            tx.consume_token(TokenKind::Delimiter, "(")?;
            let mut arguments: Vec<Expression> = Vec::new();
            while let Some(expression) = tx.expression() {
                arguments.push(expression);
                if tx.consume_token(TokenKind::Delimiter, ",").is_none() {
                    break;
                }
            }
            let end_position = tx.consume_token(TokenKind::Delimiter, ")")?.end_position;
            Some(Expression::FunctionCall(FunctionCall {
                location: Location {
                    start: identifier.location.start,
                    end: end_position,
                },
                name: identifier,
                arguments,
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
    use super::Parser;
    use ast::*;
    use indoc::indoc;
    use pretty_assertions::assert_eq;
    use tokenizer::{position::Position, Tokenizer};

    #[test]
    fn expression_returns_integer_literal() {
        let source = "234849";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::IntegerLiteral(IntegerLiteral {
                value: "234849".to_string(),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7,
                    },
                },
            }))
        );
    }

    #[test]
    fn expression_returns_identifier() {
        let source = "abc";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::Identifier(Identifier {
                name: "abc".to_string(),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 3,
                        line: 1,
                        column: 4,
                    },
                },
            }))
        )
    }

    #[test]
    fn expression_returns_assignment_expression() {
        let source = "x = 123";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::AssignmentExpression(AssignmentExpression {
                name: Identifier {
                    name: "x".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                },
                value: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "123".to_string(),
                    location: Location {
                        start: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        },
                        end: Position {
                            index: 7,
                            line: 1,
                            column: 8
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 7,
                        line: 1,
                        column: 8
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_returns_if_else_expression() {
        let source = "if condition { 1 } else { 0 } as i32";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::IfElseExpression(IfElseExpression {
                condition: Box::new(Expression::Identifier(Identifier {
                    name: "condition".to_string(),
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: Position {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                    },
                },)),
                then_block: Block {
                    statements: Statements {
                        statements: vec![Statement::Expression(Expression::IntegerLiteral(
                            IntegerLiteral {
                                value: "1".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 15,
                                        line: 1,
                                        column: 16,
                                    },
                                    end: Position {
                                        index: 16,
                                        line: 1,
                                        column: 17,
                                    },
                                },
                            },
                        ),),],
                        location: Location {
                            start: Position {
                                index: 13,
                                line: 1,
                                column: 14,
                            },
                            end: Position {
                                index: 18,
                                line: 1,
                                column: 19,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 13,
                            line: 1,
                            column: 14,
                        },
                        end: Position {
                            index: 18,
                            line: 1,
                            column: 19,
                        },
                    },
                },
                else_block: Block {
                    statements: Statements {
                        statements: vec![Statement::Expression(Expression::IntegerLiteral(
                            IntegerLiteral {
                                value: "0".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 26,
                                        line: 1,
                                        column: 27,
                                    },
                                    end: Position {
                                        index: 27,
                                        line: 1,
                                        column: 28,
                                    },
                                },
                            },
                        ),),],
                        location: Location {
                            start: Position {
                                index: 24,
                                line: 1,
                                column: 25,
                            },
                            end: Position {
                                index: 29,
                                line: 1,
                                column: 30,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 24,
                            line: 1,
                            column: 25,
                        },
                        end: Position {
                            index: 29,
                            line: 1,
                            column: 30,
                        },
                    },
                },
                return_type: Type {
                    name: TypeKind::I32,
                    location: Location {
                        start: Position {
                            index: 33,
                            line: 1,
                            column: 34,
                        },
                        end: Position {
                            index: 36,
                            line: 1,
                            column: 37,
                        },
                    },
                },
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 36,
                        line: 1,
                        column: 37,
                    },
                },
            },),)
        );
    }

    #[test]
    fn expression_returns_if_else_if_expression() {
        let source = "if condition { 1 } else if condition { 2 } else { 0 } as i32";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::IfElseExpression(IfElseExpression {
                condition: Box::new(Expression::Identifier(Identifier {
                    name: "condition".to_string(),
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: Position {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                    },
                },)),
                then_block: Block {
                    statements: Statements {
                        statements: vec![Statement::Expression(Expression::IntegerLiteral(
                            IntegerLiteral {
                                value: "1".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 15,
                                        line: 1,
                                        column: 16,
                                    },
                                    end: Position {
                                        index: 16,
                                        line: 1,
                                        column: 17,
                                    },
                                },
                            },
                        ),),],
                        location: Location {
                            start: Position {
                                index: 13,
                                line: 1,
                                column: 14,
                            },
                            end: Position {
                                index: 18,
                                line: 1,
                                column: 19,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 13,
                            line: 1,
                            column: 14,
                        },
                        end: Position {
                            index: 18,
                            line: 1,
                            column: 19,
                        },
                    },
                },
                else_block: Block {
                    statements: Statements {
                        statements: vec![Statement::Expression(Expression::IfElseExpression(
                            IfElseExpression {
                                condition: Box::new(Expression::Identifier(Identifier {
                                    name: "condition".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 27,
                                            line: 1,
                                            column: 28,
                                        },
                                        end: Position {
                                            index: 36,
                                            line: 1,
                                            column: 37,
                                        },
                                    },
                                },)),
                                then_block: Block {
                                    statements: Statements {
                                        statements: vec![Statement::Expression(
                                            Expression::IntegerLiteral(IntegerLiteral {
                                                value: "2".to_string(),
                                                location: Location {
                                                    start: Position {
                                                        index: 39,
                                                        line: 1,
                                                        column: 40,
                                                    },
                                                    end: Position {
                                                        index: 40,
                                                        line: 1,
                                                        column: 41,
                                                    },
                                                },
                                            },),
                                        ),],
                                        location: Location {
                                            start: Position {
                                                index: 37,
                                                line: 1,
                                                column: 38,
                                            },
                                            end: Position {
                                                index: 42,
                                                line: 1,
                                                column: 43,
                                            },
                                        },
                                    },
                                    location: Location {
                                        start: Position {
                                            index: 37,
                                            line: 1,
                                            column: 38,
                                        },
                                        end: Position {
                                            index: 42,
                                            line: 1,
                                            column: 43,
                                        },
                                    },
                                },
                                else_block: Block {
                                    statements: Statements {
                                        statements: vec![Statement::Expression(
                                            Expression::IntegerLiteral(IntegerLiteral {
                                                value: "0".to_string(),
                                                location: Location {
                                                    start: Position {
                                                        index: 50,
                                                        line: 1,
                                                        column: 51,
                                                    },
                                                    end: Position {
                                                        index: 51,
                                                        line: 1,
                                                        column: 52,
                                                    },
                                                },
                                            },),
                                        ),],
                                        location: Location {
                                            start: Position {
                                                index: 48,
                                                line: 1,
                                                column: 49,
                                            },
                                            end: Position {
                                                index: 53,
                                                line: 1,
                                                column: 54,
                                            },
                                        },
                                    },
                                    location: Location {
                                        start: Position {
                                            index: 48,
                                            line: 1,
                                            column: 49,
                                        },
                                        end: Position {
                                            index: 53,
                                            line: 1,
                                            column: 54,
                                        },
                                    },
                                },
                                return_type: Type {
                                    name: TypeKind::I32,
                                    location: Location {
                                        start: Position {
                                            index: 57,
                                            line: 1,
                                            column: 58,
                                        },
                                        end: Position {
                                            index: 60,
                                            line: 1,
                                            column: 61,
                                        },
                                    },
                                },
                                location: Location {
                                    start: Position {
                                        index: 24,
                                        line: 1,
                                        column: 25,
                                    },
                                    end: Position {
                                        index: 53,
                                        line: 1,
                                        column: 54,
                                    },
                                },
                            },
                        ),),],
                        location: Location {
                            start: Position {
                                index: 24,
                                line: 1,
                                column: 25,
                            },
                            end: Position {
                                index: 53,
                                line: 1,
                                column: 54,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 24,
                            line: 1,
                            column: 25,
                        },
                        end: Position {
                            index: 53,
                            line: 1,
                            column: 54,
                        },
                    },
                },
                return_type: Type {
                    name: TypeKind::I32,
                    location: Location {
                        start: Position {
                            index: 57,
                            line: 1,
                            column: 58,
                        },
                        end: Position {
                            index: 60,
                            line: 1,
                            column: 61,
                        },
                    },
                },
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 60,
                        line: 1,
                        column: 61,
                    },
                },
            },),)
        );
    }

    #[test]
    fn expression_returns_binary_expression() {
        let source = "1 + 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },)),
                operator: Operator {
                    operator: OperatorKind::Add,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3,
                        },
                        end: Position {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                    },
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 4,
                            line: 1,
                            column: 5,
                        },
                        end: Position {
                            index: 5,
                            line: 1,
                            column: 6,
                        },
                    },
                },)),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 5,
                        line: 1,
                        column: 6,
                    },
                },
            },),)
        );
    }

    #[test]
    fn expression_returns_binary_expression_with_unary_minus() {
        let source = "-1 - -2 * 3";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::BinaryExpression(BinaryExpression {
                    left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "0".to_string(),
                        location: Location {
                            start: Position {
                                index: 0,
                                line: 1,
                                column: 1
                            },
                            end: Position {
                                index: 0,
                                line: 1,
                                column: 1
                            }
                        }
                    })),
                    operator: Operator {
                        operator: OperatorKind::Subtract,
                        location: Location {
                            start: Position {
                                index: 0,
                                line: 1,
                                column: 1
                            },
                            end: Position {
                                index: 1,
                                line: 1,
                                column: 2
                            }
                        }
                    },
                    right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "1".to_string(),
                        location: Location {
                            start: Position {
                                index: 1,
                                line: 1,
                                column: 2
                            },
                            end: Position {
                                index: 2,
                                line: 1,
                                column: 3
                            }
                        }
                    })),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::Subtract,
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::BinaryExpression(BinaryExpression {
                    left: Box::new(Expression::BinaryExpression(BinaryExpression {
                        left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "0".to_string(),
                            location: Location {
                                start: Position {
                                    index: 5,
                                    line: 1,
                                    column: 6
                                },
                                end: Position {
                                    index: 5,
                                    line: 1,
                                    column: 6
                                }
                            }
                        })),
                        operator: Operator {
                            operator: OperatorKind::Subtract,
                            location: Location {
                                start: Position {
                                    index: 5,
                                    line: 1,
                                    column: 6
                                },
                                end: Position {
                                    index: 6,
                                    line: 1,
                                    column: 7
                                }
                            }
                        },
                        right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "2".to_string(),
                            location: Location {
                                start: Position {
                                    index: 6,
                                    line: 1,
                                    column: 7
                                },
                                end: Position {
                                    index: 7,
                                    line: 1,
                                    column: 8
                                }
                            }
                        })),
                        location: Location {
                            start: Position {
                                index: 5,
                                line: 1,
                                column: 6
                            },
                            end: Position {
                                index: 7,
                                line: 1,
                                column: 8
                            }
                        }
                    })),
                    operator: Operator {
                        operator: OperatorKind::Multiply,
                        location: Location {
                            start: Position {
                                index: 8,
                                line: 1,
                                column: 9
                            },
                            end: Position {
                                index: 9,
                                line: 1,
                                column: 10
                            }
                        }
                    },
                    right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "3".to_string(),
                        location: Location {
                            start: Position {
                                index: 10,
                                line: 1,
                                column: 11
                            },
                            end: Position {
                                index: 11,
                                line: 1,
                                column: 12
                            }
                        }
                    })),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 11,
                            line: 1,
                            column: 12
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 11,
                        line: 1,
                        column: 12
                    }
                }
            }))
        )
    }

    #[test]
    fn expression_returns_complicated_binary_expression() {
        let source = "100 + 2 * x - (abc + 12 / 2)";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::BinaryExpression(BinaryExpression {
                    left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "100".to_string(),
                        location: Location {
                            start: Position {
                                index: 0,
                                line: 1,
                                column: 1
                            },
                            end: Position {
                                index: 3,
                                line: 1,
                                column: 4
                            }
                        }
                    })),
                    operator: Operator {
                        operator: OperatorKind::Add,
                        location: Location {
                            start: Position {
                                index: 4,
                                line: 1,
                                column: 5
                            },
                            end: Position {
                                index: 5,
                                line: 1,
                                column: 6
                            }
                        }
                    },
                    right: Box::new(Expression::BinaryExpression(BinaryExpression {
                        left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "2".to_string(),
                            location: Location {
                                start: Position {
                                    index: 6,
                                    line: 1,
                                    column: 7
                                },
                                end: Position {
                                    index: 7,
                                    line: 1,
                                    column: 8
                                }
                            }
                        })),
                        operator: Operator {
                            operator: OperatorKind::Multiply,
                            location: Location {
                                start: Position {
                                    index: 8,
                                    line: 1,
                                    column: 9
                                },
                                end: Position {
                                    index: 9,
                                    line: 1,
                                    column: 10
                                }
                            }
                        },
                        right: Box::new(Expression::Identifier(Identifier {
                            name: "x".to_string(),
                            location: Location {
                                start: Position {
                                    index: 10,
                                    line: 1,
                                    column: 11
                                },
                                end: Position {
                                    index: 11,
                                    line: 1,
                                    column: 12
                                }
                            }
                        })),
                        location: Location {
                            start: Position {
                                index: 6,
                                line: 1,
                                column: 7
                            },
                            end: Position {
                                index: 11,
                                line: 1,
                                column: 12
                            }
                        }
                    })),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 11,
                            line: 1,
                            column: 12
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::Subtract,
                    location: Location {
                        start: Position {
                            index: 12,
                            line: 1,
                            column: 13
                        },
                        end: Position {
                            index: 13,
                            line: 1,
                            column: 14
                        }
                    }
                },
                right: Box::new(Expression::BinaryExpression(BinaryExpression {
                    left: Box::new(Expression::Identifier(Identifier {
                        name: "abc".to_string(),
                        location: Location {
                            start: Position {
                                index: 15,
                                line: 1,
                                column: 16
                            },
                            end: Position {
                                index: 18,
                                line: 1,
                                column: 19
                            }
                        }
                    })),
                    operator: Operator {
                        operator: OperatorKind::Add,
                        location: Location {
                            start: Position {
                                index: 19,
                                line: 1,
                                column: 20
                            },
                            end: Position {
                                index: 20,
                                line: 1,
                                column: 21
                            }
                        }
                    },
                    right: Box::new(Expression::BinaryExpression(BinaryExpression {
                        left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "12".to_string(),
                            location: Location {
                                start: Position {
                                    index: 21,
                                    line: 1,
                                    column: 22
                                },
                                end: Position {
                                    index: 23,
                                    line: 1,
                                    column: 24
                                }
                            }
                        })),
                        operator: Operator {
                            operator: OperatorKind::Divide,
                            location: Location {
                                start: Position {
                                    index: 24,
                                    line: 1,
                                    column: 25
                                },
                                end: Position {
                                    index: 25,
                                    line: 1,
                                    column: 26
                                }
                            }
                        },
                        right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "2".to_string(),
                            location: Location {
                                start: Position {
                                    index: 26,
                                    line: 1,
                                    column: 27
                                },
                                end: Position {
                                    index: 27,
                                    line: 1,
                                    column: 28
                                }
                            }
                        })),
                        location: Location {
                            start: Position {
                                index: 21,
                                line: 1,
                                column: 22
                            },
                            end: Position {
                                index: 27,
                                line: 1,
                                column: 28
                            }
                        }
                    })),
                    location: Location {
                        start: Position {
                            index: 15,
                            line: 1,
                            column: 16
                        },
                        end: Position {
                            index: 27,
                            line: 1,
                            column: 28
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 27,
                        line: 1,
                        column: 28
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_returns_less_than_expression() {
        let source = "1 < 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::LessThan,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 3,
                            line: 1,
                            column: 4
                        }
                    }
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        },
                        end: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 5,
                        line: 1,
                        column: 6
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_returns_less_than_or_equal_expression() {
        let source = "1 <= 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::LessThanOrEqual,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 6,
                            line: 1,
                            column: 7
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7
                    }
                }
            }))
        )
    }

    #[test]
    fn expression_returns_greater_than() {
        let source = "1 > 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::GreaterThan,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 3,
                            line: 1,
                            column: 4
                        }
                    }
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        },
                        end: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 5,
                        line: 1,
                        column: 6
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_returns_greater_than_or_equal() {
        let source = "1 >= 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::GreaterThanOrEqual,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 6,
                            line: 1,
                            column: 7
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_return_equal_expression() {
        let source = "1 == 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::Equal,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 6,
                            line: 1,
                            column: 7
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_return_not_equal_expression() {
        let source = "1 != 2";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "1".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::NotEqual,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                    value: "2".to_string(),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 6,
                            line: 1,
                            column: 7
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_return_comparison_expression_with_calculation() {
        let source = "1 + 2 == 3 * 4 != 5 / 6";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::BinaryExpression(BinaryExpression {
                    left: Box::new(Expression::BinaryExpression(BinaryExpression {
                        left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "1".to_string(),
                            location: Location {
                                start: Position {
                                    index: 0,
                                    line: 1,
                                    column: 1
                                },
                                end: Position {
                                    index: 1,
                                    line: 1,
                                    column: 2
                                }
                            }
                        })),
                        operator: Operator {
                            operator: OperatorKind::Add,
                            location: Location {
                                start: Position {
                                    index: 2,
                                    line: 1,
                                    column: 3
                                },
                                end: Position {
                                    index: 3,
                                    line: 1,
                                    column: 4
                                }
                            }
                        },
                        right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "2".to_string(),
                            location: Location {
                                start: Position {
                                    index: 4,
                                    line: 1,
                                    column: 5
                                },
                                end: Position {
                                    index: 5,
                                    line: 1,
                                    column: 6
                                }
                            }
                        })),
                        location: Location {
                            start: Position {
                                index: 0,
                                line: 1,
                                column: 1
                            },
                            end: Position {
                                index: 5,
                                line: 1,
                                column: 6
                            }
                        }
                    })),
                    operator: Operator {
                        operator: OperatorKind::Equal,
                        location: Location {
                            start: Position {
                                index: 6,
                                line: 1,
                                column: 7
                            },
                            end: Position {
                                index: 8,
                                line: 1,
                                column: 9
                            }
                        }
                    },
                    right: Box::new(Expression::BinaryExpression(BinaryExpression {
                        left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "3".to_string(),
                            location: Location {
                                start: Position {
                                    index: 9,
                                    line: 1,
                                    column: 10
                                },
                                end: Position {
                                    index: 10,
                                    line: 1,
                                    column: 11
                                }
                            }
                        })),
                        operator: Operator {
                            operator: OperatorKind::Multiply,
                            location: Location {
                                start: Position {
                                    index: 11,
                                    line: 1,
                                    column: 12
                                },
                                end: Position {
                                    index: 12,
                                    line: 1,
                                    column: 13
                                }
                            }
                        },
                        right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "4".to_string(),
                            location: Location {
                                start: Position {
                                    index: 13,
                                    line: 1,
                                    column: 14
                                },
                                end: Position {
                                    index: 14,
                                    line: 1,
                                    column: 15
                                }
                            }
                        })),
                        location: Location {
                            start: Position {
                                index: 9,
                                line: 1,
                                column: 10
                            },
                            end: Position {
                                index: 14,
                                line: 1,
                                column: 15
                            }
                        }
                    })),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 14,
                            line: 1,
                            column: 15
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::NotEqual,
                    location: Location {
                        start: Position {
                            index: 15,
                            line: 1,
                            column: 16
                        },
                        end: Position {
                            index: 17,
                            line: 1,
                            column: 18
                        }
                    }
                },
                right: Box::new(Expression::BinaryExpression(BinaryExpression {
                    left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "5".to_string(),
                        location: Location {
                            start: Position {
                                index: 18,
                                line: 1,
                                column: 19
                            },
                            end: Position {
                                index: 19,
                                line: 1,
                                column: 20
                            }
                        }
                    })),
                    operator: Operator {
                        operator: OperatorKind::Divide,
                        location: Location {
                            start: Position {
                                index: 20,
                                line: 1,
                                column: 21
                            },
                            end: Position {
                                index: 21,
                                line: 1,
                                column: 22
                            }
                        }
                    },
                    right: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                        value: "6".to_string(),
                        location: Location {
                            start: Position {
                                index: 22,
                                line: 1,
                                column: 23
                            },
                            end: Position {
                                index: 23,
                                line: 1,
                                column: 24
                            }
                        }
                    })),
                    location: Location {
                        start: Position {
                            index: 18,
                            line: 1,
                            column: 19
                        },
                        end: Position {
                            index: 23,
                            line: 1,
                            column: 24
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 23,
                        line: 1,
                        column: 24
                    }
                }
            }))
        )
    }

    #[test]
    fn expression_return_logical_and_expression() {
        let source = "a && b";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::Identifier(Identifier {
                    name: "a".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::LogicalAnd,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::Identifier(Identifier {
                    name: "b".to_string(),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 6,
                            line: 1,
                            column: 7
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7
                    }
                }
            }))
        )
    }

    #[test]
    fn expression_return_logical_or_expression() {
        let source = "a || b";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::BinaryExpression(BinaryExpression {
                left: Box::new(Expression::Identifier(Identifier {
                    name: "a".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                })),
                operator: Operator {
                    operator: OperatorKind::LogicalOr,
                    location: Location {
                        start: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        },
                        end: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        }
                    }
                },
                right: Box::new(Expression::Identifier(Identifier {
                    name: "b".to_string(),
                    location: Location {
                        start: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        },
                        end: Position {
                            index: 6,
                            line: 1,
                            column: 7
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 6,
                        line: 1,
                        column: 7
                    }
                }
            }))
        )
    }

    #[test]
    fn expression_return_logical_not_expression() {
        let source = "!a";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::UnaryExpression(UnaryExpression {
                operator: Operator {
                    operator: OperatorKind::LogicalNot,
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                },
                operand: Box::new(Expression::Identifier(Identifier {
                    name: "a".to_string(),
                    location: Location {
                        start: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        },
                        end: Position {
                            index: 2,
                            line: 1,
                            column: 3
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 2,
                        line: 1,
                        column: 3
                    }
                }
            }))
        );
    }

    #[test]
    fn expression_return_repeated_unary_expression() {
        let source = "!!- -!  !a";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).expression();
        assert_eq!(
            ast,
            Some(Expression::UnaryExpression(UnaryExpression {
                operator: Operator {
                    operator: OperatorKind::LogicalNot,
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1,
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                    },
                },
                operand: Box::new(Expression::UnaryExpression(UnaryExpression {
                    operator: Operator {
                        operator: OperatorKind::LogicalNot,
                        location: Location {
                            start: Position {
                                index: 1,
                                line: 1,
                                column: 2,
                            },
                            end: Position {
                                index: 2,
                                line: 1,
                                column: 3,
                            },
                        },
                    },
                    operand: Box::new(Expression::BinaryExpression(BinaryExpression {
                        left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                            value: "0".to_string(),
                            location: Location {
                                start: Position {
                                    index: 2,
                                    line: 1,
                                    column: 3,
                                },
                                end: Position {
                                    index: 2,
                                    line: 1,
                                    column: 3,
                                },
                            },
                        },)),
                        operator: Operator {
                            operator: OperatorKind::Subtract,
                            location: Location {
                                start: Position {
                                    index: 2,
                                    line: 1,
                                    column: 3,
                                },
                                end: Position {
                                    index: 3,
                                    line: 1,
                                    column: 4,
                                },
                            },
                        },
                        right: Box::new(Expression::BinaryExpression(BinaryExpression {
                            left: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                                value: "0".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 4,
                                        line: 1,
                                        column: 5,
                                    },
                                    end: Position {
                                        index: 4,
                                        line: 1,
                                        column: 5,
                                    },
                                },
                            },)),
                            operator: Operator {
                                operator: OperatorKind::Subtract,
                                location: Location {
                                    start: Position {
                                        index: 4,
                                        line: 1,
                                        column: 5,
                                    },
                                    end: Position {
                                        index: 5,
                                        line: 1,
                                        column: 6,
                                    },
                                },
                            },
                            right: Box::new(Expression::UnaryExpression(UnaryExpression {
                                operator: Operator {
                                    operator: OperatorKind::LogicalNot,
                                    location: Location {
                                        start: Position {
                                            index: 5,
                                            line: 1,
                                            column: 6,
                                        },
                                        end: Position {
                                            index: 6,
                                            line: 1,
                                            column: 7,
                                        },
                                    },
                                },
                                operand: Box::new(Expression::UnaryExpression(UnaryExpression {
                                    operator: Operator {
                                        operator: OperatorKind::LogicalNot,
                                        location: Location {
                                            start: Position {
                                                index: 8,
                                                line: 1,
                                                column: 9,
                                            },
                                            end: Position {
                                                index: 9,
                                                line: 1,
                                                column: 10,
                                            },
                                        },
                                    },
                                    operand: Box::new(Expression::Identifier(Identifier {
                                        name: "a".to_string(),
                                        location: Location {
                                            start: Position {
                                                index: 9,
                                                line: 1,
                                                column: 10,
                                            },
                                            end: Position {
                                                index: 10,
                                                line: 1,
                                                column: 11,
                                            },
                                        },
                                    },)),
                                    location: Location {
                                        start: Position {
                                            index: 8,
                                            line: 1,
                                            column: 9,
                                        },
                                        end: Position {
                                            index: 10,
                                            line: 1,
                                            column: 11,
                                        },
                                    },
                                },)),
                                location: Location {
                                    start: Position {
                                        index: 5,
                                        line: 1,
                                        column: 6,
                                    },
                                    end: Position {
                                        index: 10,
                                        line: 1,
                                        column: 11,
                                    },
                                },
                            },)),
                            location: Location {
                                start: Position {
                                    index: 4,
                                    line: 1,
                                    column: 5,
                                },
                                end: Position {
                                    index: 10,
                                    line: 1,
                                    column: 11,
                                },
                            },
                        },)),
                        location: Location {
                            start: Position {
                                index: 2,
                                line: 1,
                                column: 3,
                            },
                            end: Position {
                                index: 10,
                                line: 1,
                                column: 11,
                            },
                        },
                    },)),
                    location: Location {
                        start: Position {
                            index: 1,
                            line: 1,
                            column: 2,
                        },
                        end: Position {
                            index: 10,
                            line: 1,
                            column: 11,
                        },
                    },
                },)),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 10,
                        line: 1,
                        column: 11,
                    },
                },
            },),)
        )
    }

    #[test]
    fn statement_returns_expression_statement() {
        let source = "x;";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).statement();
        assert_eq!(
            ast,
            Some(Statement::ExpressionStatement(ExpressionStatement {
                expression: Expression::Identifier(Identifier {
                    name: "x".to_string(),
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 1,
                            line: 1,
                            column: 2
                        }
                    }
                }),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 2,
                        line: 1,
                        column: 3
                    }
                }
            }))
        );
    }

    #[test]
    fn statement_returns_none_when_expression() {
        let source = "x";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).statement();
        assert_eq!(ast, None);
    }

    #[test]
    fn statement_returns_mutable_variable_definition_statement() {
        let source = "var x: i32 = 0;";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).statement();
        assert_eq!(
            ast,
            Some(Statement::VariableDefinition(VariableDefinition {
                name: Identifier {
                    name: "x".to_string(),
                    location: Location {
                        start: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        },
                        end: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        }
                    }
                },
                mutable: true,
                variable_type: Type {
                    name: TypeKind::I32,
                    location: Location {
                        start: Position {
                            index: 7,
                            line: 1,
                            column: 8
                        },
                        end: Position {
                            index: 10,
                            line: 1,
                            column: 11
                        }
                    }
                },
                value: Some(Expression::IntegerLiteral(IntegerLiteral {
                    value: "0".to_string(),
                    location: Location {
                        start: Position {
                            index: 13,
                            line: 1,
                            column: 14
                        },
                        end: Position {
                            index: 14,
                            line: 1,
                            column: 15
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 15,
                        line: 1,
                        column: 16
                    }
                }
            }))
        );
    }

    #[test]
    fn statement_returns_immutable_variable_definition_statement() {
        let source = "let x: i32 = 0;";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).statement();
        assert_eq!(
            ast,
            Some(Statement::VariableDefinition(VariableDefinition {
                name: Identifier {
                    name: "x".to_string(),
                    location: Location {
                        start: Position {
                            index: 4,
                            line: 1,
                            column: 5
                        },
                        end: Position {
                            index: 5,
                            line: 1,
                            column: 6
                        }
                    }
                },
                mutable: false,
                variable_type: Type {
                    name: TypeKind::I32,
                    location: Location {
                        start: Position {
                            index: 7,
                            line: 1,
                            column: 8
                        },
                        end: Position {
                            index: 10,
                            line: 1,
                            column: 11
                        }
                    }
                },
                value: Some(Expression::IntegerLiteral(IntegerLiteral {
                    value: "0".to_string(),
                    location: Location {
                        start: Position {
                            index: 13,
                            line: 1,
                            column: 14
                        },
                        end: Position {
                            index: 14,
                            line: 1,
                            column: 15
                        }
                    }
                })),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 15,
                        line: 1,
                        column: 16
                    }
                }
            }))
        );
    }

    #[test]
    fn statement_returns_if_statement() {
        let source = "if condition { 1; } else { 0; }";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).statement();
        assert_eq!(
            ast,
            Some(Statement::IfStatement(IfStatement {
                condition: Expression::Identifier(Identifier {
                    name: "condition".to_string(),
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: Position {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                    },
                },),
                then_block: Block {
                    statements: Statements {
                        statements: vec![Statement::ExpressionStatement(ExpressionStatement {
                            expression: Expression::IntegerLiteral(IntegerLiteral {
                                value: "1".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 15,
                                        line: 1,
                                        column: 16,
                                    },
                                    end: Position {
                                        index: 16,
                                        line: 1,
                                        column: 17,
                                    },
                                },
                            },),
                            location: Location {
                                start: Position {
                                    index: 15,
                                    line: 1,
                                    column: 16,
                                },
                                end: Position {
                                    index: 17,
                                    line: 1,
                                    column: 18,
                                },
                            },
                        },),],
                        location: Location {
                            start: Position {
                                index: 13,
                                line: 1,
                                column: 14,
                            },
                            end: Position {
                                index: 19,
                                line: 1,
                                column: 20,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 13,
                            line: 1,
                            column: 14,
                        },
                        end: Position {
                            index: 19,
                            line: 1,
                            column: 20,
                        },
                    },
                },
                else_block: Some(Block {
                    statements: Statements {
                        statements: vec![Statement::ExpressionStatement(ExpressionStatement {
                            expression: Expression::IntegerLiteral(IntegerLiteral {
                                value: "0".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 27,
                                        line: 1,
                                        column: 28,
                                    },
                                    end: Position {
                                        index: 28,
                                        line: 1,
                                        column: 29,
                                    },
                                },
                            },),
                            location: Location {
                                start: Position {
                                    index: 27,
                                    line: 1,
                                    column: 28,
                                },
                                end: Position {
                                    index: 29,
                                    line: 1,
                                    column: 30,
                                },
                            },
                        },),],
                        location: Location {
                            start: Position {
                                index: 25,
                                line: 1,
                                column: 26,
                            },
                            end: Position {
                                index: 31,
                                line: 1,
                                column: 32,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 25,
                            line: 1,
                            column: 26,
                        },
                        end: Position {
                            index: 31,
                            line: 1,
                            column: 32,
                        },
                    },
                },),
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 31,
                        line: 1,
                        column: 32,
                    },
                },
            },),)
        )
    }

    #[test]
    fn statement_returns_if_statement_without_else() {
        let source = "if condition { 1; }";
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).statement();
        assert_eq!(
            ast,
            Some(Statement::IfStatement(IfStatement {
                condition: Expression::Identifier(Identifier {
                    name: "condition".to_string(),
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4,
                        },
                        end: Position {
                            index: 12,
                            line: 1,
                            column: 13,
                        },
                    },
                },),
                then_block: Block {
                    statements: Statements {
                        statements: vec![Statement::ExpressionStatement(ExpressionStatement {
                            expression: Expression::IntegerLiteral(IntegerLiteral {
                                value: "1".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 15,
                                        line: 1,
                                        column: 16,
                                    },
                                    end: Position {
                                        index: 16,
                                        line: 1,
                                        column: 17,
                                    },
                                },
                            },),
                            location: Location {
                                start: Position {
                                    index: 15,
                                    line: 1,
                                    column: 16,
                                },
                                end: Position {
                                    index: 17,
                                    line: 1,
                                    column: 18,
                                },
                            },
                        },),],
                        location: Location {
                            start: Position {
                                index: 13,
                                line: 1,
                                column: 14,
                            },
                            end: Position {
                                index: 19,
                                line: 1,
                                column: 20,
                            },
                        },
                    },
                    location: Location {
                        start: Position {
                            index: 13,
                            line: 1,
                            column: 14,
                        },
                        end: Position {
                            index: 19,
                            line: 1,
                            column: 20,
                        },
                    },
                },
                else_block: None,
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1,
                    },
                    end: Position {
                        index: 19,
                        line: 1,
                        column: 20,
                    },
                },
            },),)
        )
    }

    #[test]
    fn block_returns_none_when_multiple_expressions() {
        let source = indoc! {"
            {
                1
                2
            }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).block();
        assert_eq!(ast, None);
    }

    #[test]
    fn block_returns_statements() {
        let source = indoc! {"
            {
                var x: i32;
                x = 0;
                x
            }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).block();
        assert_eq!(
            ast,
            Some(Block {
                statements: Statements {
                    statements: vec![
                        Statement::VariableDefinition(VariableDefinition {
                            name: Identifier {
                                name: "x".to_string(),
                                location: Location {
                                    start: Position {
                                        index: 10,
                                        line: 2,
                                        column: 9
                                    },
                                    end: Position {
                                        index: 11,
                                        line: 2,
                                        column: 10
                                    }
                                }
                            },
                            mutable: true,
                            variable_type: Type {
                                name: TypeKind::I32,
                                location: Location {
                                    start: Position {
                                        index: 13,
                                        line: 2,
                                        column: 12
                                    },
                                    end: Position {
                                        index: 16,
                                        line: 2,
                                        column: 15
                                    }
                                }
                            },
                            value: None,
                            location: Location {
                                start: Position {
                                    index: 6,
                                    line: 2,
                                    column: 5
                                },
                                end: Position {
                                    index: 17,
                                    line: 2,
                                    column: 16
                                }
                            }
                        }),
                        Statement::ExpressionStatement(ExpressionStatement {
                            expression: Expression::AssignmentExpression(AssignmentExpression {
                                name: Identifier {
                                    name: "x".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 22,
                                            line: 3,
                                            column: 5
                                        },
                                        end: Position {
                                            index: 23,
                                            line: 3,
                                            column: 6
                                        }
                                    }
                                },
                                value: Box::new(Expression::IntegerLiteral(IntegerLiteral {
                                    value: "0".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 26,
                                            line: 3,
                                            column: 9
                                        },
                                        end: Position {
                                            index: 27,
                                            line: 3,
                                            column: 10
                                        }
                                    }
                                })),
                                location: Location {
                                    start: Position {
                                        index: 22,
                                        line: 3,
                                        column: 5
                                    },
                                    end: Position {
                                        index: 27,
                                        line: 3,
                                        column: 10
                                    }
                                }
                            }),
                            location: Location {
                                start: Position {
                                    index: 22,
                                    line: 3,
                                    column: 5
                                },
                                end: Position {
                                    index: 28,
                                    line: 3,
                                    column: 11
                                }
                            }
                        }),
                        Statement::Expression(Expression::Identifier(Identifier {
                            name: "x".to_string(),
                            location: Location {
                                start: Position {
                                    index: 33,
                                    line: 4,
                                    column: 5
                                },
                                end: Position {
                                    index: 34,
                                    line: 4,
                                    column: 6
                                }
                            }
                        }))
                    ],
                    location: Location {
                        start: Position {
                            index: 0,
                            line: 1,
                            column: 1
                        },
                        end: Position {
                            index: 36,
                            line: 5,
                            column: 2
                        }
                    }
                },
                location: Location {
                    start: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end: Position {
                        index: 36,
                        line: 5,
                        column: 2
                    }
                }
            })
        )
    }

    #[test]
    fn parse_returns_function_definition_without_parameters() {
        let source = indoc! {"
            fn main() -> i32 { 0 }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).parse();
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

    #[test]
    fn parse_returns_function_definition_with_parameters() {
        let source = indoc! {"
            fn add(x: i64, y: i64) -> i64 {
                x + y
            }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).parse();
        assert_eq!(
            ast,
            Program {
                functions: vec![FunctionDefinition {
                    name: Identifier {
                        name: "add".to_string(),
                        location: Location {
                            start: Position {
                                index: 3,
                                line: 1,
                                column: 4
                            },
                            end: Position {
                                index: 6,
                                line: 1,
                                column: 7
                            }
                        }
                    },
                    parameters: Parameters {
                        parameters: vec![
                            Parameter {
                                name: Identifier {
                                    name: "x".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 7,
                                            line: 1,
                                            column: 8
                                        },
                                        end: Position {
                                            index: 8,
                                            line: 1,
                                            column: 9
                                        }
                                    }
                                },
                                parameter_type: Type {
                                    name: TypeKind::I64,
                                    location: Location {
                                        start: Position {
                                            index: 10,
                                            line: 1,
                                            column: 11
                                        },
                                        end: Position {
                                            index: 13,
                                            line: 1,
                                            column: 14
                                        }
                                    }
                                },
                                location: Location {
                                    start: Position {
                                        index: 7,
                                        line: 1,
                                        column: 8
                                    },
                                    end: Position {
                                        index: 13,
                                        line: 1,
                                        column: 14
                                    }
                                }
                            },
                            Parameter {
                                name: Identifier {
                                    name: "y".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 15,
                                            line: 1,
                                            column: 16
                                        },
                                        end: Position {
                                            index: 16,
                                            line: 1,
                                            column: 17
                                        }
                                    }
                                },
                                parameter_type: Type {
                                    name: TypeKind::I64,
                                    location: Location {
                                        start: Position {
                                            index: 18,
                                            line: 1,
                                            column: 19
                                        },
                                        end: Position {
                                            index: 21,
                                            line: 1,
                                            column: 22
                                        }
                                    }
                                },
                                location: Location {
                                    start: Position {
                                        index: 15,
                                        line: 1,
                                        column: 16
                                    },
                                    end: Position {
                                        index: 21,
                                        line: 1,
                                        column: 22
                                    }
                                }
                            }
                        ],
                        location: Location {
                            start: Position {
                                index: 6,
                                line: 1,
                                column: 7
                            },
                            end: Position {
                                index: 22,
                                line: 1,
                                column: 23
                            }
                        }
                    },
                    return_type: Type {
                        name: TypeKind::I64,
                        location: Location {
                            start: Position {
                                index: 26,
                                line: 1,
                                column: 27
                            },
                            end: Position {
                                index: 29,
                                line: 1,
                                column: 30
                            }
                        }
                    },
                    body: Block {
                        statements: Statements {
                            statements: vec![Statement::Expression(Expression::BinaryExpression(
                                BinaryExpression {
                                    left: Box::new(Expression::Identifier(Identifier {
                                        name: "x".to_string(),
                                        location: Location {
                                            start: Position {
                                                index: 36,
                                                line: 2,
                                                column: 5
                                            },
                                            end: Position {
                                                index: 37,
                                                line: 2,
                                                column: 6
                                            }
                                        }
                                    })),
                                    operator: Operator {
                                        operator: OperatorKind::Add,
                                        location: Location {
                                            start: Position {
                                                index: 38,
                                                line: 2,
                                                column: 7
                                            },
                                            end: Position {
                                                index: 39,
                                                line: 2,
                                                column: 8
                                            }
                                        }
                                    },
                                    right: Box::new(Expression::Identifier(Identifier {
                                        name: "y".to_string(),
                                        location: Location {
                                            start: Position {
                                                index: 40,
                                                line: 2,
                                                column: 9
                                            },
                                            end: Position {
                                                index: 41,
                                                line: 2,
                                                column: 10
                                            }
                                        }
                                    })),
                                    location: Location {
                                        start: Position {
                                            index: 36,
                                            line: 2,
                                            column: 5
                                        },
                                        end: Position {
                                            index: 41,
                                            line: 2,
                                            column: 10
                                        }
                                    }
                                }
                            ))],
                            location: Location {
                                start: Position {
                                    index: 30,
                                    line: 1,
                                    column: 31
                                },
                                end: Position {
                                    index: 43,
                                    line: 3,
                                    column: 2
                                }
                            }
                        },
                        location: Location {
                            start: Position {
                                index: 30,
                                line: 1,
                                column: 31
                            },
                            end: Position {
                                index: 43,
                                line: 3,
                                column: 2
                            }
                        }
                    },
                    location: Location {
                        start: Position {
                            index: 3,
                            line: 1,
                            column: 4
                        },
                        end: Position {
                            index: 43,
                            line: 3,
                            column: 2
                        }
                    }
                }]
            }
        )
    }

    #[test]
    fn parse_returns_function_definitions() {
        let source = indoc! {"
            fn foo() -> i64 { 0 }
            fn bar() -> i32 { 1 }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).parse();
        assert_eq!(
            ast,
            Program {
                functions: vec![
                    FunctionDefinition {
                        name: Identifier {
                            name: "foo".to_string(),
                            location: Location {
                                start: Position {
                                    index: 3,
                                    line: 1,
                                    column: 4
                                },
                                end: Position {
                                    index: 6,
                                    line: 1,
                                    column: 7
                                }
                            }
                        },
                        parameters: Parameters {
                            parameters: vec![],
                            location: Location {
                                start: Position {
                                    index: 6,
                                    line: 1,
                                    column: 7
                                },
                                end: Position {
                                    index: 8,
                                    line: 1,
                                    column: 9
                                }
                            }
                        },
                        return_type: Type {
                            name: TypeKind::I64,
                            location: Location {
                                start: Position {
                                    index: 12,
                                    line: 1,
                                    column: 13
                                },
                                end: Position {
                                    index: 15,
                                    line: 1,
                                    column: 16
                                }
                            }
                        },
                        body: Block {
                            statements: Statements {
                                statements: vec![Statement::Expression(
                                    Expression::IntegerLiteral(IntegerLiteral {
                                        value: "0".to_string(),
                                        location: Location {
                                            start: Position {
                                                index: 18,
                                                line: 1,
                                                column: 19
                                            },
                                            end: Position {
                                                index: 19,
                                                line: 1,
                                                column: 20
                                            }
                                        }
                                    })
                                )],
                                location: Location {
                                    start: Position {
                                        index: 16,
                                        line: 1,
                                        column: 17
                                    },
                                    end: Position {
                                        index: 21,
                                        line: 1,
                                        column: 22
                                    }
                                }
                            },
                            location: Location {
                                start: Position {
                                    index: 16,
                                    line: 1,
                                    column: 17
                                },
                                end: Position {
                                    index: 21,
                                    line: 1,
                                    column: 22
                                }
                            }
                        },
                        location: Location {
                            start: Position {
                                index: 3,
                                line: 1,
                                column: 4
                            },
                            end: Position {
                                index: 21,
                                line: 1,
                                column: 22
                            }
                        }
                    },
                    FunctionDefinition {
                        name: Identifier {
                            name: "bar".to_string(),
                            location: Location {
                                start: Position {
                                    index: 25,
                                    line: 2,
                                    column: 4
                                },
                                end: Position {
                                    index: 28,
                                    line: 2,
                                    column: 7
                                }
                            }
                        },
                        parameters: Parameters {
                            parameters: vec![],
                            location: Location {
                                start: Position {
                                    index: 28,
                                    line: 2,
                                    column: 7
                                },
                                end: Position {
                                    index: 30,
                                    line: 2,
                                    column: 9
                                }
                            }
                        },
                        return_type: Type {
                            name: TypeKind::I32,
                            location: Location {
                                start: Position {
                                    index: 34,
                                    line: 2,
                                    column: 13
                                },
                                end: Position {
                                    index: 37,
                                    line: 2,
                                    column: 16
                                }
                            }
                        },
                        body: Block {
                            statements: Statements {
                                statements: vec![Statement::Expression(
                                    Expression::IntegerLiteral(IntegerLiteral {
                                        value: "1".to_string(),
                                        location: Location {
                                            start: Position {
                                                index: 40,
                                                line: 2,
                                                column: 19
                                            },
                                            end: Position {
                                                index: 41,
                                                line: 2,
                                                column: 20
                                            }
                                        }
                                    })
                                )],
                                location: Location {
                                    start: Position {
                                        index: 38,
                                        line: 2,
                                        column: 17
                                    },
                                    end: Position {
                                        index: 43,
                                        line: 2,
                                        column: 22
                                    }
                                }
                            },
                            location: Location {
                                start: Position {
                                    index: 38,
                                    line: 2,
                                    column: 17
                                },
                                end: Position {
                                    index: 43,
                                    line: 2,
                                    column: 22
                                }
                            }
                        },
                        location: Location {
                            start: Position {
                                index: 25,
                                line: 2,
                                column: 4
                            },
                            end: Position {
                                index: 43,
                                line: 2,
                                column: 22
                            }
                        }
                    }
                ]
            }
        )
    }

    #[test]
    fn parse_returns_function_when_comments() {
        let source = indoc! {"
            /// Main function
            fn main(/* empty */) -> i32 /* 0 or 1 */ {
                /* return */ 0 // return 0
            }
        "};
        let tokens = Tokenizer::new(source.to_string()).tokenize();
        let ast = Parser::new(tokens).parse();
        assert_eq!(
            ast,
            Program {
                functions: vec![FunctionDefinition {
                    name: Identifier {
                        name: "main".to_string(),
                        location: Location {
                            start: Position {
                                index: 21,
                                line: 2,
                                column: 4
                            },
                            end: Position {
                                index: 25,
                                line: 2,
                                column: 8
                            }
                        }
                    },
                    parameters: Parameters {
                        parameters: vec![],
                        location: Location {
                            start: Position {
                                index: 25,
                                line: 2,
                                column: 8
                            },
                            end: Position {
                                index: 38,
                                line: 2,
                                column: 21
                            }
                        }
                    },
                    return_type: Type {
                        name: TypeKind::I32,
                        location: Location {
                            start: Position {
                                index: 42,
                                line: 2,
                                column: 25
                            },
                            end: Position {
                                index: 45,
                                line: 2,
                                column: 28
                            }
                        }
                    },
                    body: Block {
                        statements: Statements {
                            statements: vec![Statement::Expression(Expression::IntegerLiteral(
                                IntegerLiteral {
                                    value: "0".to_string(),
                                    location: Location {
                                        start: Position {
                                            index: 78,
                                            line: 3,
                                            column: 18
                                        },
                                        end: Position {
                                            index: 79,
                                            line: 3,
                                            column: 19
                                        }
                                    }
                                }
                            ))],
                            location: Location {
                                start: Position {
                                    index: 59,
                                    line: 2,
                                    column: 42
                                },
                                end: Position {
                                    index: 93,
                                    line: 4,
                                    column: 2
                                }
                            }
                        },
                        location: Location {
                            start: Position {
                                index: 59,
                                line: 2,
                                column: 42
                            },
                            end: Position {
                                index: 93,
                                line: 4,
                                column: 2
                            }
                        }
                    },
                    location: Location {
                        start: Position {
                            index: 21,
                            line: 2,
                            column: 4
                        },
                        end: Position {
                            index: 93,
                            line: 4,
                            column: 2
                        }
                    }
                }]
            }
        );
    }
}
