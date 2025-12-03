#[test_only]
module suience::utils_tests;

use suience::utils;

#[test]
fun test_is_prefix_empty_prefix() {
    let prefix = vector::empty<u8>();
    let word = b"hello";
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_same_vectors() {
    let prefix = b"hello";
    let word = b"hello";
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_valid_prefix() {
    let prefix = b"hel";
    let word = b"hello";
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_single_character() {
    let prefix = b"h";
    let word = b"hello";
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_full_match() {
    let prefix = b"hello world";
    let word = b"hello world";
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_not_matching() {
    let prefix = b"world";
    let word = b"hello";
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_longer_than_word() {
    let prefix = b"hello world";
    let word = b"hello";
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_partial_mismatch() {
    let prefix = b"help";
    let word = b"hello";
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_first_char_mismatch() {
    let prefix = b"a";
    let word = b"hello";
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_middle_char_mismatch() {
    let prefix = b"hex";
    let word = b"hello";
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_empty_word() {
    let prefix = b"h";
    let word = vector::empty<u8>();
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_both_empty() {
    let prefix = vector::empty<u8>();
    let word = vector::empty<u8>();
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_hex_values() {
    let prefix = vector[0x01, 0x02, 0x03];
    let word = vector[0x01, 0x02, 0x03, 0x04, 0x05];
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_hex_values_mismatch() {
    let prefix = vector[0x01, 0x02, 0xFF];
    let word = vector[0x01, 0x02, 0x03, 0x04, 0x05];
    assert!(!utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_special_characters() {
    let prefix = b"test@123";
    let word = b"test@123456";
    assert!(utils::is_prefix(prefix, word), 0);
}

#[test]
fun test_is_prefix_unicode_bytes() {
    let prefix = vector[0xE2, 0x9C, 0x93]; // UTF-8 checkmark
    let word = vector[0xE2, 0x9C, 0x93, 0x20, 0x64, 0x6F, 0x6E, 0x65];
    assert!(utils::is_prefix(prefix, word), 0);
}
