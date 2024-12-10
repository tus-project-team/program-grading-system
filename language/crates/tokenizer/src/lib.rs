pub mod position;
pub mod source;
pub mod token;

use crate::{source::Source, token::Token, token::TokenKind};

pub fn tokenize(source: String) -> Vec<Token> {
    Tokenizer::new(source).tokenize()
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
            '+' | '*' | '/' => Some(self.create_token(TokenKind::Operator, 1)),
            '-' => match self.source.peek_char(1) {
                Some('>') => Some(self.create_token(TokenKind::Operator, 2)),
                _ => Some(self.create_token(TokenKind::Operator, 1)),
            },
            '>' | '<' => match self.source.peek_char(1) {
                Some('=') => Some(self.create_token(TokenKind::Operator, 2)),
                _ => Some(self.create_token(TokenKind::Operator, 1)),
            },
            '&' => match self.source.peek_char(1) {
                Some('&') => Some(self.create_token(TokenKind::Operator, 2)),
                _ => None,
            },
            '|' => match self.source.peek_char(1) {
                Some('|') => Some(self.create_token(TokenKind::Operator, 2)),
                _ => None,
            },
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
            "fn" | "let" | "var" | "if" | "else" | "while" | "for" | "return" | "as" => {
                Some(self.create_token(TokenKind::Keyword, length))
            }
            _ => None,
        }
    }

    fn tokenize_delimiter(&mut self) -> Option<Token> {
        match self.source.current_char()? {
            '(' | ')' | '{' | '}' | '[' | ']' | ',' | ';' | ':' => {
                Some(self.create_token(TokenKind::Delimiter, 1))
            }
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
mod tests {
    use super::*;
    use crate::position::Position;
    use indoc::indoc;
    use pretty_assertions::assert_eq;

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
    fn tokenize_operator_returns_return_operator() {
        let mut tokenizer = Tokenizer::new("->".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "->".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_less_than_operator() {
        let mut tokenizer = Tokenizer::new("<".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "<".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_less_than_or_equal_operator() {
        let mut tokenizer = Tokenizer::new("<=".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "<=".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_greater_than_operator() {
        let mut tokenizer = Tokenizer::new(">".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: ">".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_greater_than_or_equal_operator() {
        let mut tokenizer = Tokenizer::new(">=".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: ">=".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_and_operator() {
        let mut tokenizer = Tokenizer::new("&&".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "&&".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_operator_returns_or_operator() {
        let mut tokenizer = Tokenizer::new("||".to_string());
        assert_eq!(
            tokenizer.tokenize_operator(),
            Some(Token {
                kind: TokenKind::Operator,
                value: "||".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
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
    fn tokenize_keyword_returns_fn_keyword() {
        let mut tokenizer = Tokenizer::new("fn".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "fn".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_let_keyword() {
        let mut tokenizer = Tokenizer::new("let".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "let".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(3, 1, 4),
            })
        );
    }

    #[test]
    fn tokenize_keyword_returns_var_keyword() {
        let mut tokenizer = Tokenizer::new("var".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "var".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(3, 1, 4),
            })
        );
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
    fn tokenize_keyword_returns_as_keyword() {
        let mut tokenizer = Tokenizer::new("as".to_string());
        assert_eq!(
            tokenizer.tokenize_keyword(),
            Some(Token {
                kind: TokenKind::Keyword,
                value: "as".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(2, 1, 3),
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
    fn tokenize_delimiter_returns_comma() {
        let mut tokenizer = Tokenizer::new(",".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: ",".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_semicolon() {
        let mut tokenizer = Tokenizer::new(";".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: ";".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(1, 1, 2),
            })
        );
    }

    #[test]
    fn tokenize_delimiter_returns_colon() {
        let mut tokenizer = Tokenizer::new(":".to_string());
        assert_eq!(
            tokenizer.tokenize_delimiter(),
            Some(Token {
                kind: TokenKind::Delimiter,
                value: ":".to_string(),
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

    #[test]
    fn tokenize_returns_empty_for_empty_source() {
        let mut tokenizer = Tokenizer::new("".to_string());
        assert_eq!(tokenizer.tokenize(), vec![]);
    }

    #[test]
    fn tokenize_returns_empty_for_whitespace() {
        {
            let mut tokenizer = Tokenizer::new(" ".to_string());
            assert_eq!(tokenizer.tokenize(), vec![]);
        }
        {
            let mut tokenizer = Tokenizer::new("\t".to_string());
            assert_eq!(tokenizer.tokenize(), vec![]);
        }
        {
            let mut tokenizer = Tokenizer::new("\n".to_string());
            assert_eq!(tokenizer.tokenize(), vec![]);
        }
    }

    #[test]
    fn tokenize_returns_integer() {
        let integers = ["0", "123", "1234567890"];
        for integer in integers.iter() {
            let mut tokenizer = Tokenizer::new(integer.to_string());
            assert_eq!(
                tokenizer.tokenize(),
                vec![Token {
                    kind: TokenKind::Integer,
                    value: integer.to_string(),
                    start_position: Position::new(0, 1, 1),
                    end_position: Position::new(integer.len(), 1, integer.len() + 1),
                }],
                "Failed for integer '{}'",
                integer
            );
        }
    }

    #[test]
    fn tokenize_returns_identifier() {
        let identifiers = ["abc", "abc123", "_abc", "_abc123"];
        for identifier in identifiers.iter() {
            let mut tokenizer = Tokenizer::new(identifier.to_string());
            assert_eq!(
                tokenizer.tokenize(),
                vec![Token {
                    kind: TokenKind::Identifier,
                    value: identifier.to_string(),
                    start_position: Position::new(0, 1, 1),
                    end_position: Position::new(identifier.len(), 1, identifier.len() + 1),
                }],
                "Failed for identifier '{}'",
                identifier
            );
        }
    }

    #[test]
    fn tokenize_returns_operator() {
        let operators = [
            "==", "!=", "=", "!", "+", "-", "*", "/", "->", "<", "<=", ">", ">=", "&&", "||",
        ];
        for operator in operators.iter() {
            let mut tokenizer = Tokenizer::new(operator.to_string());
            assert_eq!(
                tokenizer.tokenize(),
                vec![Token {
                    kind: TokenKind::Operator,
                    value: operator.to_string(),
                    start_position: Position::new(0, 1, 1),
                    end_position: Position::new(operator.len(), 1, operator.len() + 1),
                }],
                "Failed for operator '{}'",
                operator
            );
        }
    }

    #[test]
    fn tokenize_returns_keyword() {
        let keywords = [
            "fn", "let", "var", "if", "else", "while", "for", "return", "as",
        ];
        for keyword in keywords.iter() {
            let mut tokenizer = Tokenizer::new(keyword.to_string());
            assert_eq!(
                tokenizer.tokenize(),
                vec![Token {
                    kind: TokenKind::Keyword,
                    value: keyword.to_string(),
                    start_position: Position::new(0, 1, 1),
                    end_position: Position::new(keyword.len(), 1, keyword.len() + 1),
                }],
                "Failed for keyword '{}'",
                keyword
            );
        }
    }

    #[test]
    fn tokenize_returns_delimiter() {
        let delimiters = ["(", ")", "{", "}", "[", "]", ",", ";", ":"];
        for delimiter in delimiters.iter() {
            let mut tokenizer = Tokenizer::new(delimiter.to_string());
            assert_eq!(
                tokenizer.tokenize(),
                vec![Token {
                    kind: TokenKind::Delimiter,
                    value: delimiter.to_string(),
                    start_position: Position::new(0, 1, 1),
                    end_position: Position::new(delimiter.len(), 1, delimiter.len() + 1),
                }],
                "Failed for delimiter '{}'",
                delimiter
            );
        }
    }

    #[test]
    fn tokenize_returns_single_line_comment() {
        let mut tokenizer = Tokenizer::new("// abc\n".to_string());
        assert_eq!(
            tokenizer.tokenize(),
            vec![Token {
                kind: TokenKind::Comment,
                value: "// abc\n".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(7, 2, 1),
            },]
        )
    }

    #[test]
    fn tokenize_returns_multi_line_comment() {
        let mut tokenizer = Tokenizer::new("/* abc */".to_string());
        assert_eq!(
            tokenizer.tokenize(),
            vec![Token {
                kind: TokenKind::Comment,
                value: "/* abc */".to_string(),
                start_position: Position::new(0, 1, 1),
                end_position: Position::new(9, 1, 10),
            },]
        )
    }

    #[test]
    fn tokenize_returns_tokens() {
        let source = indoc! {"
            // Single-line comment
            /* Multi-line comment */
            let a = 1;
            let b = a + 1 * 3 / 2 - 1234;
            if (a == 1) {
                return a;
            }
            for (let i = 0; i < 10; i++) {
                a = a + i;
            }
            while (a < 100) {
                a = a * 2;
            }
        "};
        let mut tokenizer = Tokenizer::new(source.to_string());
        assert_eq!(
            tokenizer.tokenize(),
            vec![
                Token {
                    kind: TokenKind::Comment,
                    value: "// Single-line comment\n".to_string(),
                    start_position: Position {
                        index: 0,
                        line: 1,
                        column: 1
                    },
                    end_position: Position {
                        index: 23,
                        line: 2,
                        column: 1
                    }
                },
                Token {
                    kind: TokenKind::Comment,
                    value: "/* Multi-line comment */".to_string(),
                    start_position: Position {
                        index: 23,
                        line: 2,
                        column: 1
                    },
                    end_position: Position {
                        index: 47,
                        line: 2,
                        column: 25
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "let".to_string(),
                    start_position: Position {
                        index: 48,
                        line: 3,
                        column: 1
                    },
                    end_position: Position {
                        index: 51,
                        line: 3,
                        column: 4
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 52,
                        line: 3,
                        column: 5
                    },
                    end_position: Position {
                        index: 53,
                        line: 3,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "=".to_string(),
                    start_position: Position {
                        index: 54,
                        line: 3,
                        column: 7
                    },
                    end_position: Position {
                        index: 55,
                        line: 3,
                        column: 8
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "1".to_string(),
                    start_position: Position {
                        index: 56,
                        line: 3,
                        column: 9
                    },
                    end_position: Position {
                        index: 57,
                        line: 3,
                        column: 10
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 57,
                        line: 3,
                        column: 10
                    },
                    end_position: Position {
                        index: 58,
                        line: 3,
                        column: 11
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "let".to_string(),
                    start_position: Position {
                        index: 59,
                        line: 4,
                        column: 1
                    },
                    end_position: Position {
                        index: 62,
                        line: 4,
                        column: 4
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "b".to_string(),
                    start_position: Position {
                        index: 63,
                        line: 4,
                        column: 5
                    },
                    end_position: Position {
                        index: 64,
                        line: 4,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "=".to_string(),
                    start_position: Position {
                        index: 65,
                        line: 4,
                        column: 7
                    },
                    end_position: Position {
                        index: 66,
                        line: 4,
                        column: 8
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 67,
                        line: 4,
                        column: 9
                    },
                    end_position: Position {
                        index: 68,
                        line: 4,
                        column: 10
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "+".to_string(),
                    start_position: Position {
                        index: 69,
                        line: 4,
                        column: 11
                    },
                    end_position: Position {
                        index: 70,
                        line: 4,
                        column: 12
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "1".to_string(),
                    start_position: Position {
                        index: 71,
                        line: 4,
                        column: 13
                    },
                    end_position: Position {
                        index: 72,
                        line: 4,
                        column: 14
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "*".to_string(),
                    start_position: Position {
                        index: 73,
                        line: 4,
                        column: 15
                    },
                    end_position: Position {
                        index: 74,
                        line: 4,
                        column: 16
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "3".to_string(),
                    start_position: Position {
                        index: 75,
                        line: 4,
                        column: 17
                    },
                    end_position: Position {
                        index: 76,
                        line: 4,
                        column: 18
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "/".to_string(),
                    start_position: Position {
                        index: 77,
                        line: 4,
                        column: 19
                    },
                    end_position: Position {
                        index: 78,
                        line: 4,
                        column: 20
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "2".to_string(),
                    start_position: Position {
                        index: 79,
                        line: 4,
                        column: 21
                    },
                    end_position: Position {
                        index: 80,
                        line: 4,
                        column: 22
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "-".to_string(),
                    start_position: Position {
                        index: 81,
                        line: 4,
                        column: 23
                    },
                    end_position: Position {
                        index: 82,
                        line: 4,
                        column: 24
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "1234".to_string(),
                    start_position: Position {
                        index: 83,
                        line: 4,
                        column: 25
                    },
                    end_position: Position {
                        index: 87,
                        line: 4,
                        column: 29
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 87,
                        line: 4,
                        column: 29
                    },
                    end_position: Position {
                        index: 88,
                        line: 4,
                        column: 30
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "if".to_string(),
                    start_position: Position {
                        index: 89,
                        line: 5,
                        column: 1
                    },
                    end_position: Position {
                        index: 91,
                        line: 5,
                        column: 3
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "(".to_string(),
                    start_position: Position {
                        index: 92,
                        line: 5,
                        column: 4
                    },
                    end_position: Position {
                        index: 93,
                        line: 5,
                        column: 5
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 93,
                        line: 5,
                        column: 5
                    },
                    end_position: Position {
                        index: 94,
                        line: 5,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "==".to_string(),
                    start_position: Position {
                        index: 95,
                        line: 5,
                        column: 7
                    },
                    end_position: Position {
                        index: 97,
                        line: 5,
                        column: 9
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "1".to_string(),
                    start_position: Position {
                        index: 98,
                        line: 5,
                        column: 10
                    },
                    end_position: Position {
                        index: 99,
                        line: 5,
                        column: 11
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ")".to_string(),
                    start_position: Position {
                        index: 99,
                        line: 5,
                        column: 11
                    },
                    end_position: Position {
                        index: 100,
                        line: 5,
                        column: 12
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "{".to_string(),
                    start_position: Position {
                        index: 101,
                        line: 5,
                        column: 13
                    },
                    end_position: Position {
                        index: 102,
                        line: 5,
                        column: 14
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "return".to_string(),
                    start_position: Position {
                        index: 107,
                        line: 6,
                        column: 5
                    },
                    end_position: Position {
                        index: 113,
                        line: 6,
                        column: 11
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 114,
                        line: 6,
                        column: 12
                    },
                    end_position: Position {
                        index: 115,
                        line: 6,
                        column: 13
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 115,
                        line: 6,
                        column: 13
                    },
                    end_position: Position {
                        index: 116,
                        line: 6,
                        column: 14
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "}".to_string(),
                    start_position: Position {
                        index: 117,
                        line: 7,
                        column: 1
                    },
                    end_position: Position {
                        index: 118,
                        line: 7,
                        column: 2
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "for".to_string(),
                    start_position: Position {
                        index: 119,
                        line: 8,
                        column: 1
                    },
                    end_position: Position {
                        index: 122,
                        line: 8,
                        column: 4
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "(".to_string(),
                    start_position: Position {
                        index: 123,
                        line: 8,
                        column: 5
                    },
                    end_position: Position {
                        index: 124,
                        line: 8,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "let".to_string(),
                    start_position: Position {
                        index: 124,
                        line: 8,
                        column: 6
                    },
                    end_position: Position {
                        index: 127,
                        line: 8,
                        column: 9
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "i".to_string(),
                    start_position: Position {
                        index: 128,
                        line: 8,
                        column: 10
                    },
                    end_position: Position {
                        index: 129,
                        line: 8,
                        column: 11
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "=".to_string(),
                    start_position: Position {
                        index: 130,
                        line: 8,
                        column: 12
                    },
                    end_position: Position {
                        index: 131,
                        line: 8,
                        column: 13
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "0".to_string(),
                    start_position: Position {
                        index: 132,
                        line: 8,
                        column: 14
                    },
                    end_position: Position {
                        index: 133,
                        line: 8,
                        column: 15
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 133,
                        line: 8,
                        column: 15
                    },
                    end_position: Position {
                        index: 134,
                        line: 8,
                        column: 16
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "i".to_string(),
                    start_position: Position {
                        index: 135,
                        line: 8,
                        column: 17
                    },
                    end_position: Position {
                        index: 136,
                        line: 8,
                        column: 18
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "<".to_string(),
                    start_position: Position {
                        index: 137,
                        line: 8,
                        column: 19
                    },
                    end_position: Position {
                        index: 138,
                        line: 8,
                        column: 20
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "10".to_string(),
                    start_position: Position {
                        index: 139,
                        line: 8,
                        column: 21
                    },
                    end_position: Position {
                        index: 141,
                        line: 8,
                        column: 23
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 141,
                        line: 8,
                        column: 23
                    },
                    end_position: Position {
                        index: 142,
                        line: 8,
                        column: 24
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "i".to_string(),
                    start_position: Position {
                        index: 143,
                        line: 8,
                        column: 25
                    },
                    end_position: Position {
                        index: 144,
                        line: 8,
                        column: 26
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "+".to_string(),
                    start_position: Position {
                        index: 144,
                        line: 8,
                        column: 26
                    },
                    end_position: Position {
                        index: 145,
                        line: 8,
                        column: 27
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "+".to_string(),
                    start_position: Position {
                        index: 145,
                        line: 8,
                        column: 27
                    },
                    end_position: Position {
                        index: 146,
                        line: 8,
                        column: 28
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ")".to_string(),
                    start_position: Position {
                        index: 146,
                        line: 8,
                        column: 28
                    },
                    end_position: Position {
                        index: 147,
                        line: 8,
                        column: 29
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "{".to_string(),
                    start_position: Position {
                        index: 148,
                        line: 8,
                        column: 30
                    },
                    end_position: Position {
                        index: 149,
                        line: 8,
                        column: 31
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 154,
                        line: 9,
                        column: 5
                    },
                    end_position: Position {
                        index: 155,
                        line: 9,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "=".to_string(),
                    start_position: Position {
                        index: 156,
                        line: 9,
                        column: 7
                    },
                    end_position: Position {
                        index: 157,
                        line: 9,
                        column: 8
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 158,
                        line: 9,
                        column: 9
                    },
                    end_position: Position {
                        index: 159,
                        line: 9,
                        column: 10
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "+".to_string(),
                    start_position: Position {
                        index: 160,
                        line: 9,
                        column: 11
                    },
                    end_position: Position {
                        index: 161,
                        line: 9,
                        column: 12
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "i".to_string(),
                    start_position: Position {
                        index: 162,
                        line: 9,
                        column: 13
                    },
                    end_position: Position {
                        index: 163,
                        line: 9,
                        column: 14
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 163,
                        line: 9,
                        column: 14
                    },
                    end_position: Position {
                        index: 164,
                        line: 9,
                        column: 15
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "}".to_string(),
                    start_position: Position {
                        index: 165,
                        line: 10,
                        column: 1
                    },
                    end_position: Position {
                        index: 166,
                        line: 10,
                        column: 2
                    }
                },
                Token {
                    kind: TokenKind::Keyword,
                    value: "while".to_string(),
                    start_position: Position {
                        index: 167,
                        line: 11,
                        column: 1
                    },
                    end_position: Position {
                        index: 172,
                        line: 11,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "(".to_string(),
                    start_position: Position {
                        index: 173,
                        line: 11,
                        column: 7
                    },
                    end_position: Position {
                        index: 174,
                        line: 11,
                        column: 8
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 174,
                        line: 11,
                        column: 8
                    },
                    end_position: Position {
                        index: 175,
                        line: 11,
                        column: 9
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "<".to_string(),
                    start_position: Position {
                        index: 176,
                        line: 11,
                        column: 10
                    },
                    end_position: Position {
                        index: 177,
                        line: 11,
                        column: 11
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "100".to_string(),
                    start_position: Position {
                        index: 178,
                        line: 11,
                        column: 12
                    },
                    end_position: Position {
                        index: 181,
                        line: 11,
                        column: 15
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ")".to_string(),
                    start_position: Position {
                        index: 181,
                        line: 11,
                        column: 15
                    },
                    end_position: Position {
                        index: 182,
                        line: 11,
                        column: 16
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "{".to_string(),
                    start_position: Position {
                        index: 183,
                        line: 11,
                        column: 17
                    },
                    end_position: Position {
                        index: 184,
                        line: 11,
                        column: 18
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 189,
                        line: 12,
                        column: 5
                    },
                    end_position: Position {
                        index: 190,
                        line: 12,
                        column: 6
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "=".to_string(),
                    start_position: Position {
                        index: 191,
                        line: 12,
                        column: 7
                    },
                    end_position: Position {
                        index: 192,
                        line: 12,
                        column: 8
                    }
                },
                Token {
                    kind: TokenKind::Identifier,
                    value: "a".to_string(),
                    start_position: Position {
                        index: 193,
                        line: 12,
                        column: 9
                    },
                    end_position: Position {
                        index: 194,
                        line: 12,
                        column: 10
                    }
                },
                Token {
                    kind: TokenKind::Operator,
                    value: "*".to_string(),
                    start_position: Position {
                        index: 195,
                        line: 12,
                        column: 11
                    },
                    end_position: Position {
                        index: 196,
                        line: 12,
                        column: 12
                    }
                },
                Token {
                    kind: TokenKind::Integer,
                    value: "2".to_string(),
                    start_position: Position {
                        index: 197,
                        line: 12,
                        column: 13
                    },
                    end_position: Position {
                        index: 198,
                        line: 12,
                        column: 14
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: ";".to_string(),
                    start_position: Position {
                        index: 198,
                        line: 12,
                        column: 14
                    },
                    end_position: Position {
                        index: 199,
                        line: 12,
                        column: 15
                    }
                },
                Token {
                    kind: TokenKind::Delimiter,
                    value: "}".to_string(),
                    start_position: Position {
                        index: 200,
                        line: 13,
                        column: 1
                    },
                    end_position: Position {
                        index: 201,
                        line: 13,
                        column: 2
                    }
                }
            ]
        )
    }
}
