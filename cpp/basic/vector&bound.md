# 📍`vector` (동적 배열)
## 📘개념
- `vector`는 **크기를 자동으로 관리해주는 배열(동적 배열)** 이다.
- 배열처럼 `v[i]`로 접근 가능하다.
- STL 알고리즘(ex: `sort`, `lower_bound`)과 함께 쓰기 편하다.

## 📝기본 사용
```cpp
#include <vector>
using namespace std;

vector<int> v;      // 빈 벡터
vector<int> a(5);   // 크기 5짜리 벡터 (0으로 초기화)
```

## ✔️값 넣기 / 크기 확인
```cpp
v.push_back(10);  // 뒤에 추가
int n = v.size(); // 현재 원소 개수
```

## ⚠️주의할 점
```cpp
vector<int> v;
v[0] = 10;  // size가 0인데 인덱스로 접근하면 런타임 에러 가능
```
- 인덱스로 접근하려면 `vector<int> v(N);`처럼 **크기부터 만들어야 한다.**

# 📍`begin()` / `end()` (구간 표현)

## 📘개념
- `v.begin()` : 첫 원소 위치
- `v.end()` : 마지막 원소 **다음** 위치
   -> 즉, `(begin, end)` 형태로 **구간**을 나타냄.

## 📎예시
```cpp
sort(v.begin(), v.end());
```
- 벡터 전체를 정렬

# 📍`lower_bound` / `upper_bound` (이진 탐색 기반 위치 찾기)
> 🚫반드시 정렬된 상태에 사용해야 한다!

## ⬇️lower_bound
- `lower_bound(begin, end, x)`
- **x 이상(>= x)** 이 처음 나오는 위치를 반환

## ⬆️upper_bound
- `upper_bound(begin, end, x)`
- **X 초과(> x)** 가 처음 나오는 위치를 반환

## ⭐"개수 세기" 공식 
정렬된 배열에서 값 `x`의 개수는
```cpp
upper_bound(v.begin(), v.end(), x) - lower_bound(v.begin(), v.end(), x)
```
- 같은 값들은 정렬 상태에서 **연속으로 붙어있음**
- `x`가 시작하는 위치 ~ `x`가 끝난 다음 위치 사이의 길이 = 개수

## 📎예시로 이해해보자
```cpp
vector<int> v = {1, 1, 2, 2, 2, 3, 5};
sort(v.begin(), v.end());

int x = 2;
int cnt = upper_bound(v.begin(), v.end(), x) - lower_bound(v.begin(), v.end(), x);
// cnt = 3
```
