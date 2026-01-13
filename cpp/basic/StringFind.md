# C++ string::find 정리

## 1. string::find란?
`string::find`는 **문자열 안에서 특정 문자나 문자열을 찾는 함수**다.
- 찾았다면 → **시작 인덱스 반환**
- 못 찾으면 → **string::npos 반환**

## 2. 기본 사용법

### 문자열 찾기
```cpp
string s = "hello";
int pos = s.find("e");   // pos == 1
```
### 문자 하나 찾기
```cpp
int pos = s.find('l');    // pos == 2
```

## 3. 찾았는지 확인하는 방법
```cpp
if (s.find("e") != string::npos) {
    // 문자열 안에 "e"가 있음
}
```

## 4. 특정 위치부터 찾기
```cpp
string s = "banana";
int pos = s.find("a", 2);  // 인덱스 2부터 탐색 → 결과 3
```

## 5. 알고리즘 문제에서의 활용
### 예시: 패턴 존재 여부 확인
```cpp
if (s.find("c=") != string::npos) {
    //"c=" 패턴이 존재
}
```
- BOJ 2941 크로아티아 알파벳
- 문자열 패턴 문제에서 자주 사용됨

## 6. 요약
- `find()` → 위치 반환
- 못 찾으면 → `string::npos`
- 조건문에서는 할상
```cpp
!= string::npos
```
- 문자열 패턴 문제에서 중요
