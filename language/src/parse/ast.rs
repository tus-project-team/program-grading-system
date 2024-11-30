use crate::tokenize::position::Position;

pub struct Program {
    pub functions: Vec<FunctionDefinition>,
}

pub struct FunctionDefinition {
    pub name: Identifier,
    pub parameters: Parameters,
    pub return_type: Type,
    pub body: Block,
    pub location: Location,
}

pub struct Parameters {
    pub parameters: Vec<Parameter>,
    pub location: Location,
}

pub struct Parameter {
    pub name: Identifier,
    pub parameter_type: Type,
    pub location: Location,
}

pub struct Block {
    pub statements: Statements,
    pub location: Location,
}

pub struct Statements {
    pub statements: Vec<Statement>,
    pub location: Location,
}

pub enum Statement {
    Expression(Expression),
}

pub enum Expression {
    BinaryExpression(BinaryExpression),
    IntegerLiteral(IntegerLiteral),
}

pub enum Operator {
    Add,
    Subtract,
    Multiply,
    Divide,
}

impl std::fmt::Display for Operator {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Operator::Add => write!(f, "+"),
            Operator::Subtract => write!(f, "-"),
            Operator::Multiply => write!(f, "*"),
            Operator::Divide => write!(f, "/"),
        }
    }
}

impl std::str::FromStr for Operator {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "+" => Ok(Operator::Add),
            "-" => Ok(Operator::Subtract),
            "*" => Ok(Operator::Multiply),
            "/" => Ok(Operator::Divide),
            _ => Err(format!("Invalid operator: {}", s)),
        }
    }
}

pub struct BinaryExpression {
    pub left: Box<Expression>,
    pub operator: Operator,
    pub right: Box<Expression>,
    pub location: Location,
}

pub struct Identifier {
    pub name: String,
    pub location: Location,
}

pub struct IntegerLiteral {
    pub value: String,
    pub location: Location,
}

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

pub struct Type {
    pub name: TypeKind,
    pub location: Location,
}

pub struct Location {
    pub start: Position,
    pub end: Position,
}
