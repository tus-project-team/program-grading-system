use serde::{Deserialize, Serialize};
use tokenizer::position::Position;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Program {
    pub functions: Vec<FunctionDefinition>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct FunctionDefinition {
    pub name: Identifier,
    pub parameters: Parameters,
    pub return_type: Type,
    pub body: Block,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Parameters {
    pub parameters: Vec<Parameter>,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Parameter {
    pub name: Identifier,
    pub parameter_type: Type,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Block {
    pub statements: Statements,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Statements {
    pub statements: Vec<Statement>,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Statement {
    ExpressionStatement(ExpressionStatement),
    VariableDefinition(VariableDefinition),
    Expression(Expression),
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExpressionStatement {
    pub expression: Expression,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct VariableDefinition {
    pub name: Identifier,
    pub mutable: bool,
    pub variable_type: Type,
    pub value: Option<Expression>,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Expression {
    BinaryExpression(BinaryExpression),
    AssignmentExpression(AssignmentExpression),
    Identifier(Identifier),
    IntegerLiteral(IntegerLiteral),
    FunctionCall(FunctionCall),
}

impl Expression {
    pub fn location(&self) -> &Location {
        match self {
            Expression::BinaryExpression(binary_expression) => &binary_expression.location,
            Expression::AssignmentExpression(assignment_expression) => {
                &assignment_expression.location
            }
            Expression::Identifier(identifier) => &identifier.location,
            Expression::IntegerLiteral(integer_literal) => &integer_literal.location,
            Expression::FunctionCall(function_call) => &function_call.location,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum OperatorKind {
    Add,
    Subtract,
    Multiply,
    Divide,
}

impl std::fmt::Display for OperatorKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            OperatorKind::Add => write!(f, "+"),
            OperatorKind::Subtract => write!(f, "-"),
            OperatorKind::Multiply => write!(f, "*"),
            OperatorKind::Divide => write!(f, "/"),
        }
    }
}

impl std::str::FromStr for OperatorKind {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "+" => Ok(OperatorKind::Add),
            "-" => Ok(OperatorKind::Subtract),
            "*" => Ok(OperatorKind::Multiply),
            "/" => Ok(OperatorKind::Divide),
            _ => Err(format!("Invalid operator: {}", s)),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Operator {
    pub operator: OperatorKind,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct BinaryExpression {
    pub left: Box<Expression>,
    pub operator: Operator,
    pub right: Box<Expression>,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssignmentExpression {
    pub name: Identifier,
    pub value: Box<Expression>,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Identifier {
    pub name: String,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct IntegerLiteral {
    pub value: String,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct FunctionCall {
    pub name: Identifier,
    pub arguments: Vec<Expression>,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum TypeKind {
    I32,
    I64,
}

impl std::fmt::Display for TypeKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            TypeKind::I32 => write!(f, "i32"),
            TypeKind::I64 => write!(f, "i64"),
        }
    }
}

impl std::str::FromStr for TypeKind {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "i32" => Ok(TypeKind::I32),
            "i64" => Ok(TypeKind::I64),
            _ => Err(format!("Invalid type: {}", s)),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Type {
    pub name: TypeKind,
    pub location: Location,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Location {
    pub start: Position,
    pub end: Position,
}