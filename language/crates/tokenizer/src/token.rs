use core::fmt;

use serde::{Deserialize, Serialize};

use super::position::Position;

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub enum TokenKind {
    Integer,
    Identifier,
    Operator,
    Keyword,
    Delimiter, // Parentheses, brackets, braces, etc.
    Comment,   // Single-line or multi-line comments
}

impl fmt::Display for TokenKind {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TokenKind::Integer => write!(f, "integer"),
            TokenKind::Identifier => write!(f, "identifier"),
            TokenKind::Operator => write!(f, "operator"),
            TokenKind::Keyword => write!(f, "keyword"),
            TokenKind::Delimiter => write!(f, "delimiter"),
            TokenKind::Comment => write!(f, "comment"),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
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
