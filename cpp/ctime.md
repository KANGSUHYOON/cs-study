# ctime 기본 정리

## time_t
- 1970-01-01 00:00:00(UTC)부터의 초 단위 시간

## time()
'''cpp
time-t t = time(nullptr);

## tm 구조체
- tm_year: 1900년 기준으로 몇 년 지났는지
- tm_mon: 0~11
- tm_mday: 1~31
- tm_yday: 1년 중 경과 일(0~365)
- tm_wday: 현재 요일(0~6, 0: 일요일)
- tm_hour: 현재 시간(0~23)
- tm_min: 현재 분(0~59)
- tm_sec: 초(0~59)
- tm_isdst: 섬머타임 실시 여부(양수(실시), 0, 음수)

## timezone 주의
- 서울 시간은 UTC + 9

## 코드 해부
- #include <iostream> //헤더 파일
- #include <ctime>  //(time, tm, localtime, gmtime)을 쓰려고 포함하는 헤더
- using namespace std; //std 생략

- int main() { 
  - time_t t = time(nullptr); //time(nullptr)는 "현재 시간"을 가져옴, nullptr 자리는 결과를 저장할 포인터를 넣을 수 있음. 안쓸거라서 nullptr 넣음
                            
  - tm *now = localtime(&t); //localtime(&t)는 t를 사람이 쓰기 쉬운 형태로 쪼개서 tm 구조체에 담아준다
  - cout << (now->tm_year + 1900) << '-'; //현재 연도 출력하기 위해 +1900
  
  - cout.width(2); //다음 출력값의 최소 폭을 2칸으로 고정
  - cout.fill('0'); //남는 부분 채울 문자 '0' 설정
  - cout << (now->tm_mon + 1) << '-'; //0~11이라 +1 해줘야 우리가 아는 1월 부터 12월까지의 형태가 됨
  
  - cout.width(2); 
  - cout.fill('0'); 
  - cout << now->tm_mday; 
  
  - return 0; }
