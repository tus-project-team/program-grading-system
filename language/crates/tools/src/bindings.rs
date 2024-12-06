#[derive(Clone)]
pub struct Output {
    pub tokens: _rt::String,
    pub ast: _rt::String,
    pub wasm: _rt::Vec<u8>,
}
impl ::core::fmt::Debug for Output {
    fn fmt(&self, f: &mut ::core::fmt::Formatter<'_>) -> ::core::fmt::Result {
        f.debug_struct("Output")
            .field("tokens", &self.tokens)
            .field("ast", &self.ast)
            .field("wasm", &self.wasm)
            .finish()
    }
}
#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn _export_get_tokens_cabi<T: Guest>(arg0: *mut u8, arg1: usize) -> *mut u8 {
    #[cfg(target_arch = "wasm32")] _rt::run_ctors_once();
    let len0 = arg1;
    let bytes0 = _rt::Vec::from_raw_parts(arg0.cast(), len0, len0);
    let result1 = T::get_tokens(_rt::string_lift(bytes0));
    let ptr2 = _RET_AREA.0.as_mut_ptr().cast::<u8>();
    let vec3 = (result1.into_bytes()).into_boxed_slice();
    let ptr3 = vec3.as_ptr().cast::<u8>();
    let len3 = vec3.len();
    ::core::mem::forget(vec3);
    *ptr2.add(4).cast::<usize>() = len3;
    *ptr2.add(0).cast::<*mut u8>() = ptr3.cast_mut();
    ptr2
}
#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn __post_return_get_tokens<T: Guest>(arg0: *mut u8) {
    let l0 = *arg0.add(0).cast::<*mut u8>();
    let l1 = *arg0.add(4).cast::<usize>();
    _rt::cabi_dealloc(l0, l1, 1);
}
#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn _export_get_ast_cabi<T: Guest>(arg0: *mut u8, arg1: usize) -> *mut u8 {
    #[cfg(target_arch = "wasm32")] _rt::run_ctors_once();
    let len0 = arg1;
    let bytes0 = _rt::Vec::from_raw_parts(arg0.cast(), len0, len0);
    let result1 = T::get_ast(_rt::string_lift(bytes0));
    let ptr2 = _RET_AREA.0.as_mut_ptr().cast::<u8>();
    let vec3 = (result1.into_bytes()).into_boxed_slice();
    let ptr3 = vec3.as_ptr().cast::<u8>();
    let len3 = vec3.len();
    ::core::mem::forget(vec3);
    *ptr2.add(4).cast::<usize>() = len3;
    *ptr2.add(0).cast::<*mut u8>() = ptr3.cast_mut();
    ptr2
}
#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn __post_return_get_ast<T: Guest>(arg0: *mut u8) {
    let l0 = *arg0.add(0).cast::<*mut u8>();
    let l1 = *arg0.add(4).cast::<usize>();
    _rt::cabi_dealloc(l0, l1, 1);
}
#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn _export_compile_cabi<T: Guest>(arg0: *mut u8, arg1: usize) -> *mut u8 {
    #[cfg(target_arch = "wasm32")] _rt::run_ctors_once();
    let len0 = arg1;
    let bytes0 = _rt::Vec::from_raw_parts(arg0.cast(), len0, len0);
    let result1 = T::compile(_rt::string_lift(bytes0));
    let ptr2 = _RET_AREA.0.as_mut_ptr().cast::<u8>();
    let Output { tokens: tokens3, ast: ast3, wasm: wasm3 } = result1;
    let vec4 = (tokens3.into_bytes()).into_boxed_slice();
    let ptr4 = vec4.as_ptr().cast::<u8>();
    let len4 = vec4.len();
    ::core::mem::forget(vec4);
    *ptr2.add(4).cast::<usize>() = len4;
    *ptr2.add(0).cast::<*mut u8>() = ptr4.cast_mut();
    let vec5 = (ast3.into_bytes()).into_boxed_slice();
    let ptr5 = vec5.as_ptr().cast::<u8>();
    let len5 = vec5.len();
    ::core::mem::forget(vec5);
    *ptr2.add(12).cast::<usize>() = len5;
    *ptr2.add(8).cast::<*mut u8>() = ptr5.cast_mut();
    let vec6 = (wasm3).into_boxed_slice();
    let ptr6 = vec6.as_ptr().cast::<u8>();
    let len6 = vec6.len();
    ::core::mem::forget(vec6);
    *ptr2.add(20).cast::<usize>() = len6;
    *ptr2.add(16).cast::<*mut u8>() = ptr6.cast_mut();
    ptr2
}
#[doc(hidden)]
#[allow(non_snake_case)]
pub unsafe fn __post_return_compile<T: Guest>(arg0: *mut u8) {
    let l0 = *arg0.add(0).cast::<*mut u8>();
    let l1 = *arg0.add(4).cast::<usize>();
    _rt::cabi_dealloc(l0, l1, 1);
    let l2 = *arg0.add(8).cast::<*mut u8>();
    let l3 = *arg0.add(12).cast::<usize>();
    _rt::cabi_dealloc(l2, l3, 1);
    let l4 = *arg0.add(16).cast::<*mut u8>();
    let l5 = *arg0.add(20).cast::<usize>();
    let base6 = l4;
    let len6 = l5;
    _rt::cabi_dealloc(base6, len6 * 1, 1);
}
pub trait Guest {
    fn get_tokens(source: _rt::String) -> _rt::String;
    fn get_ast(source: _rt::String) -> _rt::String;
    fn compile(source: _rt::String) -> Output;
}
#[doc(hidden)]
macro_rules! __export_world_example_cabi {
    ($ty:ident with_types_in $($path_to_types:tt)*) => {
        const _ : () = { #[export_name = "get-tokens"] unsafe extern "C" fn
        export_get_tokens(arg0 : * mut u8, arg1 : usize,) -> * mut u8 {
        $($path_to_types)*:: _export_get_tokens_cabi::<$ty > (arg0, arg1) } #[export_name
        = "cabi_post_get-tokens"] unsafe extern "C" fn _post_return_get_tokens(arg0 : *
        mut u8,) { $($path_to_types)*:: __post_return_get_tokens::<$ty > (arg0) }
        #[export_name = "get-ast"] unsafe extern "C" fn export_get_ast(arg0 : * mut u8,
        arg1 : usize,) -> * mut u8 { $($path_to_types)*:: _export_get_ast_cabi::<$ty >
        (arg0, arg1) } #[export_name = "cabi_post_get-ast"] unsafe extern "C" fn
        _post_return_get_ast(arg0 : * mut u8,) { $($path_to_types)*::
        __post_return_get_ast::<$ty > (arg0) } #[export_name = "compile"] unsafe extern
        "C" fn export_compile(arg0 : * mut u8, arg1 : usize,) -> * mut u8 {
        $($path_to_types)*:: _export_compile_cabi::<$ty > (arg0, arg1) } #[export_name =
        "cabi_post_compile"] unsafe extern "C" fn _post_return_compile(arg0 : * mut u8,)
        { $($path_to_types)*:: __post_return_compile::<$ty > (arg0) } };
    };
}
#[doc(hidden)]
pub(crate) use __export_world_example_cabi;
#[repr(align(4))]
struct _RetArea([::core::mem::MaybeUninit<u8>; 24]);
static mut _RET_AREA: _RetArea = _RetArea([::core::mem::MaybeUninit::uninit(); 24]);
mod _rt {
    pub use alloc_crate::string::String;
    pub use alloc_crate::vec::Vec;
    #[cfg(target_arch = "wasm32")]
    pub fn run_ctors_once() {
        wit_bindgen_rt::run_ctors_once();
    }
    pub unsafe fn string_lift(bytes: Vec<u8>) -> String {
        if cfg!(debug_assertions) {
            String::from_utf8(bytes).unwrap()
        } else {
            String::from_utf8_unchecked(bytes)
        }
    }
    pub unsafe fn cabi_dealloc(ptr: *mut u8, size: usize, align: usize) {
        if size == 0 {
            return;
        }
        let layout = alloc::Layout::from_size_align_unchecked(size, align);
        alloc::dealloc(ptr, layout);
    }
    extern crate alloc as alloc_crate;
    pub use alloc_crate::alloc;
}
/// Generates `#[no_mangle]` functions to export the specified type as the
/// root implementation of all generated traits.
///
/// For more information see the documentation of `wit_bindgen::generate!`.
///
/// ```rust
/// # macro_rules! export{ ($($t:tt)*) => (); }
/// # trait Guest {}
/// struct MyType;
///
/// impl Guest for MyType {
///     // ...
/// }
///
/// export!(MyType);
/// ```
#[allow(unused_macros)]
#[doc(hidden)]
macro_rules! __export_example_impl {
    ($ty:ident) => {
        self::export!($ty with_types_in self);
    };
    ($ty:ident with_types_in $($path_to_types_root:tt)*) => {
        $($path_to_types_root)*:: __export_world_example_cabi!($ty with_types_in
        $($path_to_types_root)*);
    };
}
#[doc(inline)]
pub(crate) use __export_example_impl as export;
#[cfg(target_arch = "wasm32")]
#[link_section = "component-type:wit-bindgen:0.30.0:example:encoded world"]
#[doc(hidden)]
pub static __WIT_BINDGEN_COMPONENT_TYPE: [u8; 262] = *b"\
\0asm\x0d\0\x01\0\0\x19\x16wit-component-encoding\x04\0\x07\x88\x01\x01A\x02\x01\
A\x08\x01p}\x01r\x03\x06tokenss\x03asts\x04wasm\0\x03\0\x06output\x03\0\x01\x01@\
\x01\x06sources\0s\x04\0\x0aget-tokens\x01\x03\x04\0\x07get-ast\x01\x03\x01@\x01\
\x06sources\0\x02\x04\0\x07compile\x01\x04\x04\x01\x17component:tools/example\x04\
\0\x0b\x0d\x01\0\x07example\x03\0\0\0G\x09producers\x01\x0cprocessed-by\x02\x0dw\
it-component\x070.215.0\x10wit-bindgen-rust\x060.30.0";
#[inline(never)]
#[doc(hidden)]
pub fn __link_custom_section_describing_imports() {
    wit_bindgen_rt::maybe_link_cabi_realloc();
}
