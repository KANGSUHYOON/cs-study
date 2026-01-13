# `replace`에 대하여 알아보자
```cpp
문자열.replace(시작위치, 바꿀길이, 새문자열)
```
의미:
> **문자열의 일부를 잘라내고 다른 문자열로 교체한다**

## 예시
```cpp
s.replace(2,3,"X");
```
👉 s의 **2번 인덱스부터 3글자를 `"x"`로 바꿔라

## find + replace 같이 쓸 경우
```cpp
string s = "hello world";
int pos = s.find("world");
```
* pos = 6

```cpp
s.replace(pos, 5, "C++");
```
결과:
`hello C++`

### 예제
**🔶 목표**
문자열에서 `"abc"`를 `"X"`로 바꾸기

**CODE**
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
  string s = "zzabczzabc";

  while (s.find("abc") != string::npos) {
    int pos = s.find("abc");
    s.replace(pos, 3, "X");
  }

  cout << s;
  return 0;
}
```
결과:
`zzXzzX`
