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

/// Position of a character in the source
#[derive(Clone, Copy, Debug, PartialEq)]
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

pub struct Source {
    source: Vec<char>,
    position: Position,
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
    /// use language::tokenize::Source;
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
    /// use language::tokenize::Source;
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
    /// use language::tokenize::Source;
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

pub struct Tokenizer {
    source: Source,
}

impl Tokenizer {
    /// Create a new tokenizer
    ///
    /// ### Arguments
    ///
    /// - `source` is the source code to tokenize
    pub fn new(source: String) -> Tokenizer {
        Tokenizer {
            source: Source::new(source),
        }
    }

    /// Tokenize the source code
    pub fn tokenize(&mut self) -> Vec<Token> {
        let mut tokens = Vec::new();
        while let Some(token) = self.next_token() {
            tokens.push(token);
        }
        tokens
    }

    fn skip_whitespace(&mut self) -> Option<()> {
        while let Some(c) = self.source.current_char() {
            if c.is_whitespace() {
                self.source.advance();
            } else {
                break;
            }
        }
        Some(())
    }

    fn next_token(&mut self) -> Option<Token> {
        self.skip_whitespace()?;
        self.tokenize_keyword()
            .or_else(|| self.tokenize_comment())
            .or_else(|| self.tokenize_delimiter())
            .or_else(|| self.tokenize_operator())
            .or_else(|| self.tokenize_integer())
            .or_else(|| self.tokenize_identifier())
    }

    fn tokenize_integer(&mut self) -> Option<Token> {
        if let Some(c) = self.source.current_char() {
            if !c.is_ascii_digit() {
                return None;
            }
        } else {
            return None;
        }

        let start_position = self.source.position;
        while let Some(c) = self.source.current_char() {
            if c.is_ascii_digit() {
                self.source.advance();
            } else {
                break;
            }
        }
        let end_position = self.source.position;

        Some(Token {
            kind: TokenKind::Integer,
            value: {
                let start = start_position.index;
                let end = end_position.index;
                self.source.source[start..end].iter().collect()
            },
            start_position,
            end_position,
        })
    }

    fn tokenize_identifier(&mut self) -> Option<Token> {
        if let Some(c) = self.source.current_char() {
            if !(c.is_ascii_alphabetic() || c == &'_') {
                return None;
            }
        } else {
            return None;
        }

        let start_position = self.source.position;
        while let Some(c) = self.source.current_char() {
            if c.is_ascii_alphanumeric() || c == &'_' {
                self.source.advance();
            } else {
                break;
            }
        }
        let end_position = self.source.position;

        Some(Token {
            kind: TokenKind::Identifier,
            value: {
                let start = start_position.index;
                let end = end_position.index;
                self.source.source[start..end].iter().collect()
            },
            start_position,
            end_position,
        })
    }

    fn tokenize_operator(&mut self) -> Option<Token> {
        match self.source.current_char()? {
            '=' => match self.source.peek_char(1) {
                Some('=') => Some(self.create_token(TokenKind::Operator, 2)),
                _ => Some(self.create_token(TokenKind::Operator, 1)),
            },
            '!' => match self.source.peek_char(1) {
                Some('=') => Some(self.create_token(TokenKind::Operator, 2)),
                _ => Some(self.create_token(TokenKind::Operator, 1)),
            },
            '+' | '-' | '*' | '/' => Some(self.create_token(TokenKind::Operator, 1)),
            _ => None,
        }
    }

    fn tokenize_keyword(&mut self) -> Option<Token> {
        if let Some(c) = self.source.current_char() {
            if !(c.is_ascii_alphabetic() || c == &'_') {
                return None;
            }
        } else {
            return None;
        }

        let start_position = self.source.position;
        let length = {
            let mut length = 0;
            while let Some(c) = self.source.peek_char(length) {
                if c.is_ascii_alphabetic() || c == &'_' {
                    length += 1;
                } else {
                    break;
                }
            }
            length
        };

        let keyword: String = {
            let start = start_position.index;
            let end = start + length;
            self.source.source[start..end].iter().collect()
        };

        match keyword.as_str() {
            "if" | "else" | "while" | "for" | "return" => {
                Some(self.create_token(TokenKind::Keyword, length))
            }
            _ => None,
        }
    }

    fn tokenize_delimiter(&mut self) -> Option<Token> {
        match self.source.current_char()? {
            '(' | ')' | '{' | '}' | '[' | ']' => Some(self.create_token(TokenKind::Delimiter, 1)),
            _ => None,
        }
    }

    fn tokenize_comment(&mut self) -> Option<Token> {
        match self.source.current_char()? {
            '/' => match self.source.peek_char(1)? {
                '/' => {
                    let mut length = 2;
                    while let Some(c) = self.source.peek_char(length) {
                        length += 1;
                        if c == &'\n' {
                            break;
                        }
                    }
                    Some(self.create_token(TokenKind::Comment, length))
                }
                '*' => {
                    let mut length = 2;
                    while let Some(c) = self.source.peek_char(length) {
                        if c == &'*' {
                            if let Some('/') = self.source.peek_char(length + 1) {
                                length += 2;
                                break;
                            }
                        }
                        length += 1;
                    }
                    Some(self.create_token(TokenKind::Comment, length))
                }
                _ => None,
            },
            _ => None,
        }
    }

    /// Create a new token by advancing the source by the given length
    ///
    /// ### Arguments
    ///
    /// - `kind` is the kind of the token to create
    /// - `length` is the number of characters to advance
    fn create_token(&mut self, kind: TokenKind, length: usize) -> Token {
        let start_position = self.source.position;
        for _ in 0..length {
            self.source.advance();
        }
        let end_position = self.source.position;

        Token {
            kind,
            value: self.source.source[(start_position.index)..(end_position.index)]
                .iter()
                .collect(),
            start_position,
            end_position,
        }
    }
}

#[cfg(test)]
mod source_tests {
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

#[cfg(test)]
mod tokenizer_tests {
    use super::*;
    use indoc::indoc;

    #[test]
    fn tokenize_integer_returns_none_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize_integer(), None);
    }

    #[test]
    fn tokenize_integer_returns_none_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize_integer(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize_integer(), None);
        }
    }

    #[test]
    fn tokenize_integer_returns_none_for_non_digit() {
        {
            let mut tokenizer = Tokenizer::new("abc".to_string());
            assert_eq!(tokenizer.tokenize_integer(), None);
        }
    }

    #[test]
    fn tokenize_integer_returns_integer() {
        let mut tokenizer = Tokenizer::new("123abc".to_string());
        assert_eq!(
            tokenizer.tokenize_integer(),
            Some(Token {
                kind: TokenKind::Integer,
                value: "123".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(3, 1, 4),
            })
        );
    }

    #[test]
    fn tokenize_identifier_returns_none_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize_identifier(), None);
    }

    #[test]
    fn tokenize_identifier_returns_none_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize_identifier(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize_identifier(), None);
        }
    }

    #[test]
    fn tokenize_identifier_returns_none_for_non_alphabetic() {
        let mut tokenizer = Tokenizer::new("123".to_string());
        assert_eq!(tokenizer.tokenize_identifier(), None);
    }

    #[test]
    fn tokenize_identifier_returns_identifier() {
        let mut tokenizer = Tokenizer::new("abc123".to_string());
        assert_eq!(
            tokenizer.tokenize_identifier(),
            Some(Token {
                kind: TokenKind::Identifier,
                value: "abc123".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(6, 1, 7),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_none_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize_operator(), None);
    }

    #[test]
    fn tokenize_operator_returns_none_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize_operator(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize_operator(), None);
        }
    }

    #[test]
    fn tokenize_operator_returns_none_for_non_operator() {
        {
            let mut tokenizer = Tokenizer::new("abc".to_string());
            assert_eq!(tokenizer.tokenize_operator(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("123".to_string());
            assert_eq!(tokenizer.tokenize_operator(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("(".to_string());
            assert_eq!(tokenizer.tokenize_keyword(), None);
        }
    }

    #[test]
    fn tokenize_operator_returns_equal_operator() {
        let mut tokenizer = Tokenizer::new("==".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "==".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_assign_operator() {
        let mut tokenizer = Tokenizer::new("=".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "=".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_not_equal_operator() {
        let mut tokenizer = Tokenizer::new("!=".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "!=".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_not_operator() {
        let mut tokenizer = Tokenizer::new("!".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "!".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_plus_operator() {
        let mut tokenizer = Tokenizer::new("+".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "+".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_minus_operator() {
        let mut tokenizer = Tokenizer::new("-".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "-".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_multiply_operator() {
        let mut tokenizer = Tokenizer::new("*".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "*".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_divide_operator() {
        let mut tokenizer = Tokenizer::new("/".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "/".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_none_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize_keyword(), None);
    }

    #[test]
    fn tokenize_keyword_returns_none_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize_keyword(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize_keyword(), None);
        }
    }

    #[test]
    fn tokenize_keyword_returns_none_for_non_keyword() {
        {
            let mut tokenizer = Tokenizer::new("123".to_string());
            assert_eq!(tokenizer.tokenize_keyword(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("abc".to_string());
            assert_eq!(tokenizer.tokenize_keyword(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("=".to_string());
            assert_eq!(tokenizer.tokenize_keyword(), None);
        }
    }

    #[test]
    fn tokenize_keyword_returns_if_keyword() {
        let mut tokenizer = Tokenizer::new("if".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "if".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_else_keyword() {
        let mut tokenizer = Tokenizer::new("else".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "else".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(4, 1, 5),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_while_keyword() {
        let mut tokenizer = Tokenizer::new("while".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "while".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(5, 1, 6),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_for_keyword() {
        let mut tokenizer = Tokenizer::new("for".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "for".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(3, 1, 4),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_return_keyword() {
        let mut tokenizer = Tokenizer::new("return".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "return".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(6, 1, 7),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_none_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize_delimiter(), None);
    }

    #[test]
    fn tokenize_delimiter_returns_none_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize_delimiter(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize_delimiter(), None);
        }
    }

    #[test]
    fn tokenize_delimiter_returns_none_for_non_delimiter() {
        {
            let mut tokenizer = Tokenizer::new("123".to_string());
            assert_eq!(tokenizer.tokenize_delimiter(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("abc".to_string());
            assert_eq!(tokenizer.tokenize_delimiter(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("=".to_string());
            assert_eq!(tokenizer.tokenize_delimiter(), None);
        }
    }

    #[test]
    fn tokenize_delimiter_returns_open_parentheses() {
        let mut tokenizer = Tokenizer::new("(".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: "(".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_close_parentheses() {
        let mut tokenizer = Tokenizer::new(")".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: ")".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_open_braces() {
        let mut tokenizer = Tokenizer::new("{".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: "{".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_close_braces() {
        let mut tokenizer = Tokenizer::new("}".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: "}".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_open_brackets() {
        let mut tokenizer = Tokenizer::new("[".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: "[".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_close_brackets() {
        let mut tokenizer = Tokenizer::new("]".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: "]".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_comment_returns_none_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize_comment(), None);
    }

    #[test]
    fn tokenize_comment_returns_none_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize_comment(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize_comment(), None);
        }
    }

    #[test]
    fn tokenize_comment_returns_none_for_non_comment() {
        {
            let mut tokenizer = Tokenizer::new("abc".to_string());
            assert_eq!(tokenizer.tokenize_comment(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("123".to_string());
            assert_eq!(tokenizer.tokenize_comment(), None);
        }
        {
            let mut tokenizer = Tokenizer::new("/".to_string());
            assert_eq!(tokenizer.tokenize_comment(), None);
        }
    }

    #[test]
    fn tokenize_comment_returns_single_line_comment() {
        let mut tokenizer = Tokenizer::new("// abc\nlet a = 1".to_string());
        assert_eq!(
            tokenizer.tokenize_comment(),
            Some(Token {
                kind: TokenKind::Comment,
                value: "// abc\n".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(7, 2, 1),
            })
        );
    }

    #[test]
    fn tokenize_comment_returns_multi_line_comment() {
        let mut tokenizer = Tokenizer::new("/* abc */let a = 1".to_string());
        assert_eq!(
            tokenizer.tokenize_comment(),
            Some(Token {
                kind: TokenKind::Comment,
                value: "/* abc */".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(9, 1, 10),
            })
        );
    }

    #[test]
    fn tokenize_comment_returns_multi_line_comment_with_multiple_lines() {
        let mut tokenizer = Tokenizer::new(
            indoc! {"
                /* abc
                def
                ghi */
                let a = 1
            "}
            .to_string(),
        );
        assert_eq!(
            tokenizer.tokenize_comment(),
            Some(Token {
                kind: TokenKind::Comment,
                value: "/* abc\ndef\nghi */".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(17, 3, 7),
            })
        );
    }
}
