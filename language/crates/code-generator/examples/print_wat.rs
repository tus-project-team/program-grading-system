use std::env::args;

use wast::{
    parser::{self, ParseBuffer},
    Wat,
};

fn main() {
    let input_file = args().nth(1).expect("Expected input wat file");
    let input = std::fs::read_to_string(input_file).expect("Failed to read input wat file");
    let buffer = ParseBuffer::new(&input).expect("Failed to parse input wat file");
    let module = parser::parse::<Wat>(&buffer).expect("Failed to parse wast file");
    println!("{:#?}", module);
}
