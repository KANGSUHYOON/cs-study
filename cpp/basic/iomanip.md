# iomanip 헤더는 무엇일까
입출력 스트림의 서식을 조절하는 매개변수화된 조작자를 제공하여, <br>
**콘솔 출력 등을 보기 좋게 정렬하고 제어할 수 있게** 해준다.
## 왜 쓸까?
- 한 줄로 깔끔하게 쓰고 싶어서
- 체이닝 스타일이 예뻐서

## 예시
만일, 소수점을 고정한다고 해보자.<br>
- `iomanip`을 쓰지 않았을 경우
```cpp
cout << fixed;
cout.precision(소수점 길이);
cout << result;
```

- `iomanip`를 사용하였을 경우
```cpp
cout << fixed << setprecision(소수점 길이) << result;
```
👉 이처럼 가독성이 더 좋아진다.
