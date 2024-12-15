use super::position::Position;

pub struct Source {
    pub(crate) source: Vec<char>,
    pub(crate) position: Position,
}

impl Source {
    /// Create a new source
    pub fn new(source: String) -> Source {
        Source {
            source: source.chars().collect(),
            position: Position {
                index: 0,
                line: 1,
                column: 1,
            },
        }
    }

    /// Get the current character
    ///
    /// ### Examples
    ///
    /// ```
    /// use tokenizer::source::Source;
    ///
    /// let source = Source::new("abc".to_string());
    /// assert_eq!(source.current_char(), Some(&'a'));
    /// assert_eq!(source.current_char(), Some(&'a'));
    /// ```
    pub fn current_char(&self) -> Option<&char> {
        self.source.get(self.position.index)
    }

    /// Get the character at the given offset
    ///
    /// ### Arguments
    ///
    /// - `offset` is the number of characters to skip
    ///
    /// ### Examples
    ///
    /// ```
    /// use tokenizer::source::Source;
    ///
    /// let source = Source::new("abc".to_string());
    /// assert_eq!(source.peek_char(0), Some(&'a'));
    /// assert_eq!(source.peek_char(1), Some(&'b'));
    /// assert_eq!(source.peek_char(2), Some(&'c'));
    /// assert_eq!(source.peek_char(3), None);
    /// ```
    pub fn peek_char(&self, offset: usize) -> Option<&char> {
        self.source.get(self.position.index + offset)
    }

    /// Advance the position to the next character
    ///
    /// ### Examples
    ///
    /// ```
    /// use tokenizer::source::Source;
    ///
    /// let mut source = Source::new("a\nb".to_string());
    /// assert_eq!(source.current_char(), Some(&'a'));
    /// source.advance();
    /// assert_eq!(source.current_char(), Some(&'\n'));
    /// source.advance();
    /// assert_eq!(source.current_char(), Some(&'b'));
    /// source.advance();
    /// assert_eq!(source.current_char(), None);
    /// ```
    pub fn advance(&mut self) {
        match self.current_char() {
            Some('\n') => {
                self.position.index += 1;
                self.position.line += 1;
                self.position.column = 1;
            }
            Some(_) => {
                self.position.index += 1;
                self.position.column += 1;
            }
            None => {}
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn current_char_returns_none_for_empty_source() {
        let source = Source::new("".to_string());
        assert_eq!(source.current_char(), None);
    }

    #[test]
    fn current_char_returns_first_character() {
        let mut source = Source::new("abc".to_string());
        assert_eq!(source.current_char(), Some(&'a'));
        assert_eq!(source.current_char(), Some(&'a'));

        source.position.index += 1;
        assert_eq!(source.current_char(), Some(&'b'));

        source.position.index += 1;
        assert_eq!(source.current_char(), Some(&'c'));

        source.position.index += 1;
        assert_eq!(source.current_char(), None);
    }

    #[test]
    fn peek_char_returns_none_for_empty_source() {
        let source = Source::new("".to_string());
        assert_eq!(source.peek_char(0), None);
    }

    #[test]
    fn peek_char_returns_character_at_offset() {
        let source = Source::new("abc".to_string());
        assert_eq!(source.peek_char(0), Some(&'a'));
        assert_eq!(source.peek_char(1), Some(&'b'));
        assert_eq!(source.peek_char(2), Some(&'c'));
        assert_eq!(source.peek_char(3), None);
    }

    #[test]
    fn advance_moves_to_next_character() {
        let mut source = Source::new("a\nb".to_string());
        assert_eq!(source.current_char(), Some(&'a'));
        assert_eq!(source.position.index, 0);
        assert_eq!(source.position.line, 1);
        assert_eq!(source.position.column, 1);

        source.advance();
        assert_eq!(source.current_char(), Some(&'\n'));
        assert_eq!(source.position.index, 1);
        assert_eq!(source.position.line, 1);
        assert_eq!(source.position.column, 2);

        source.advance();
        assert_eq!(source.current_char(), Some(&'b'));
        assert_eq!(source.position.index, 2);
        assert_eq!(source.position.line, 2);
        assert_eq!(source.position.column, 1);

        source.advance();
        assert_eq!(source.current_char(), None);
        assert_eq!(source.position.index, 3);
        assert_eq!(source.position.line, 2);
        assert_eq!(source.position.column, 2);
    }
}
