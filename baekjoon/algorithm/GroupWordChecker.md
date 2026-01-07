# 백준 1316 - 그룹 단어 체커(C++)

## 문제 요약
N개의 단어가 주어진다.<br>
각 단어가 그룹 단어인지 판별해서, 그룹 단어의 개수를 출력한다.

### 그룹 단어 조건
같은 문자가 등장할 때, 그 문자는 **연속해서만** 나타나야 한다.<br>
한 번 끊겼다가(다른 문자가 나옴) **다시 등장하면 그룹 단어가 아니다.**

예시)
- aabbbccc ✔️ 그룹 단어
- aabbbcca ✖️ 그룹 단어 아님

## 아이디어
단순히 `s[i]`와 `s[i - 1]`만 비교하면 **떨어져서 재등장** 을 잡을 수 없다.<br>
`s[i]`와 `s[i - 1]`만 비교하는 것은 현재 문자와 그 전 문자를 비교하는 정도일 뿐이다.<br>
따라서 "이 문자가 예전에 나온 적이 있는가"를 판단해야한다. 👉 `visited[26]` 사용.

- `visited[x] = true` : x번째 알파벳이 **이미 등장했다.**
- 현재 문자가 이전 문자와 **다른 순간에만**, `visited`를 확인한다.
  > - 다를 때 `visited`가 이미 true면 → 끊겼다가 재등장한 것이므로 ❌


## 로직 한 줄 요약
> **"문자가 바뀌는 순간에, 그 문자가 과거에 등장한 적 있으면 탈락."**

## 중요 코드

### 1) 알파벳을 인덱스로 바꾸자.
```cpp
idx = s[i] - 'a';
```
- `'a' - 'a' = 0`, `'b' - 'a' = 1`...`'z' - 'a' = 25`

### 2) bool 조건문 문법
```cpp
if (visited[idx])
```
는 아래 코드와 동일하다:
```cpp
if (visited[idx] == true)
```

### 3) break의 의미
`break`는 **현재 for문을 즉시 종료**한다.

## 정답 코드
```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
  int n;
  cin >> n;

  int count = 0;

  for (int t = 0; t < n; t++) {
    string s;
    cin >> s;

    bool visited[26] = { false };
    bool isGroup = true;

    for (int i = 0; i < (int)s.length(); i++) {
      int idx = s[i] - 'a';

      if (i > 0 && s[i] != s[i - 1]) {
        if (visited[idx]) {
          isGroup = false;
          break;
        }
      }
      visited[idx] = true;
    }
    if (isGroup) count++;
  }

  cout << count;
  return 0;
}
```

## 나의 실수 및 깨닳은 점
- `if (visited[idx])`가 `if (visited[idx] == true)`랑 동일한 표현이라는 것을 몰라서 흐름이 보이지 않았음
