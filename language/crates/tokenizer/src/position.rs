use serde::{Deserialize, Serialize};

/// Position of a character in the source
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Position {
    /// 0-based index of the character in the source
    pub index: usize,

    /// 1-based line number
    pub line: usize,

    /// 1-based column number
    pub column: usize,
}

impl Position {
    pub fn new(index: usize, line: usize, column: usize) -> Position {
        Position {
            index,
            line,
            column,
        }
    }
}
