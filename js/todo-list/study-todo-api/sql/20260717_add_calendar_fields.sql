-- 캘린더 기능을 위한 todos 테이블 마이그레이션
-- 개발 DB 적용 완료: 2026-07-17
-- 동일한 DB에서 다시 실행하면 중복 컬럼 및 인덱스 오류가 발생할 수 있음
-- scheduled_date가 NULL이면 날짜가 지정되지 않은 기존 Todo를 뜻함.
-- completed_at은 완료 처리 시 UTC 시각으로 기록됨.
-- 완료 체크를 해제하면 completed_at은 NULL로 되돌아 감.

ALTER TABLE todos
ADD COLUMN scheduled_date DATE NULL AFTER completed,
ADD COLUMN completed_at DATETIME NULL AFTER scheduled_date;

CREATE INDEX idx_todos_scheduled_date
ON todos (scheduled_date);
