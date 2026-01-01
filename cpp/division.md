# 백준 1008번 - a/b

## 문제 요약 
- 두 정수 a와 b가 주어졌을 때 a/b를 출력하는 문제.
- 실수 나눗셈 결과를 정확히 출력(소수점 9자리)

---

## my mistakes

### 1. 입력받기 전에 계산함
```cpp
int a, b;
float result = a / b; 
cin >> a >> b;
```
### 2. 형변환의 부재
```cpp
float result = a / b; => 형변환을 안시킴 
```
## 해결방법
1. 애초에 double로 입력받았으면 되지 않았을까?
  - int a, b; => double a, b;
2. 소수점을 9로 그냥 고정하자
  - precision(9) 이용
  - double 데이터타입이 소수점 15자리까지 나타낸다고 해도 출력은 그 이하로 됨. (소수점 고정 안했다가 문제를 2번 더 틀렸다...)
    ```cpp
    cout << fixed; //소수점 아래부터 유효숫자를 세겠다.
    cout.precision(9); //소수점과 상관 없이 전체 자리 숫자를 9로 고정하겠다.
    ```

## 완성 코드
```cpp
#include <iostream>
using namespcae std;

int main() {
  double a, b;
  cin >> a >> b;

  cout << fixed;
  cout.precision(9);

  cout << a / b << endl;
  return 0;
}
```

## 배운점
- 입력 → 계산 → 출력 순서 중요
- int / int ≠ 실수
- 실수 출력 문제에서는 fixed, precision을 사용하자
- float보단 double이 정밀도가 더 높다.
