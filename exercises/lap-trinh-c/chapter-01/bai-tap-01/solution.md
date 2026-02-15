# Lợi giải

## Phân tích

Bài tập cơ bản để làm quen với cú pháp C. Cần include thư viện, viết hàm main, và dùng printf.

## Code mẫu

```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

## Giải thích

1. `#include <stdio.h>` - Include thư viện chuẩn cho input/output
2. `int main()` - Hàm chính của chương trình
3. `printf()` - Hàm in ra màn hình
4. `\n` - Ký tự xuống dòng
5. `return 0` - Trả về 0 (thành công)

## Cách chạy

```bash
# Compile
gcc hello.c -o hello

# Run
./hello
```

## Output

```
Hello, World!
```
