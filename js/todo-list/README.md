# JS Todo List (DOM Practice)

## ⭐목표
- JavaScript DOM 조작 연습
- 이벤트 처리(addEventListner) 연습
- 체크 상태 기반 진행률 계산

---

## ⚙️구현 기능

### 1) 진행률 표시 (Progress)
- 체크된 항목 수 / 전체 항목 수로 퍼센트 계산
- `Math.round()`로 반올림하여 표시

**핵심 로직**
- checked 개수 세기 -> percent 계산 -> 텍스트 업데이트

---
### 2) 체크박스 변경 시 자동 업데이트
- 각 체크박스에 `change` 이벤트 연결
- 체크/해제 할 때마다 진행률 자동 갱신

---

### 3) 할 일 추가 (Add Task)
- input에서 텍스트를 읽어옴
- label + checkbox를 만들어 DOM에 추가

---

## 📘배운 점 / ⚠️주의할 점

### NodeList는 "고정"일 수 있다
- `querySelectorAll()` 결과가 새로 생긴 요소를 자동 반영하지 않을 수 있다.
- 해결:
- - `updateProgress()` 내부에서 매번 `.task`를 다시 선택하거나
  - 새로 생성한 체크박스에 이벤트를 직접 붙이기


---

## ⏭️다음에 추가할 기능 (TODO)
- [ ] Enter 키로 할 일 추가
- [ ] 추가 후 input 자동 비우기
- [ ] 완료 항목 줄긋기 스타일 적용
- [ ] LocalStorage 저장/불러오기
