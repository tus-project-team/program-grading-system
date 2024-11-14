use super::position::Position;

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum TokenKind {
    Integer,
    Identifier,
    Operator,
    Keyword,
    Delimiter, // Parentheses, brackets, braces, etc.
    Comment,   // Single-line or multi-line comments
}

#[derive(Clone, Debug, PartialEq)]
pub struct Token {
    /// Kind of the token
    pub kind: TokenKind,

    /// Value of the token
    pub value: String,

    /// Start position of the token in the source
    pub start_position: Position,

    /// End position of the token in the source
    pub end_position: Position,
}
