# 사칙연산(Elementary Arithmetic) 문제에서의 실수

## 문제요약 
- 자연수 A, B가 주어졌을 때 다음 연산 결과를 출력한다.
- A + B
- A - B
- A * B
- A / B
- A % B


## 내 코드의 문제점
```cpp
#include <iostream>
using namespace std;

int main() {

	cin >> A >> B;

	double A, B;
	int Plus = (int)A + B;
	int Minus = (int)A - B;
	int Multiple = (int)A * B;
	double Devide = A / B;
	double Remainder = A % B;

	cout << Plus << endl;
	cout << Minus << endl;
	cout << Multiple << endl;
	cout << Devide << endl;
	cout << Remainder << endl;

	return 0;
}

```
> 1. 우선 코드를 더 가독성 좋게 만들수 있었는데 그것이 아쉽다. 굳이 짧은 코드에는 변수로 관리하지 말자.
> 2. 아직 A, B가 선언이 되어지지 않았는데 먼저 입력을 받아버렸다.
> 3. %(나머지) 연산자는 double이 사용 불가하다. 이는 int(정수형) 에서만 사용 가능하다.

## 최종 정답 코드
```cpp
#include <iostream>
using namespace std;

int main() {
  int A, B;
  cin >> A >> B;

  cout << A + B << endl;
  cout << A - B << endl;
  cout << A * B << endl;
  cout << A / B << endl;
  cout << A % B << endl;

  return 0;
}
```
> 코드가 훨씬 간략해지고 정수형으로 A, B를 선언하여 오류가 나지 않았다.

## 배운점
- 변수 선언 순서를 잘 보자
- % 연산자는 int 만 가능하다
- 문제 조건을 잘 보고 불필요한 자료형을 남발하지 말자
