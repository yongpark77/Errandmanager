# Errand Manager - Product Requirements Document (PRD)

## 1. 제품 개요

**제품명:** Errand Manager
**버전:** 1.0.0
**태그라인:** "Stay on top of your recurring tasks"
**플랫폼:** 반응형 웹 애플리케이션 (SPA) — 데스크탑 / 태블릿 / 모바일 지원
**기술 스택:**

| 구분 | 기술 | 버전/설명 |
|------|------|-----------|
| Frontend Framework | React 19 | TypeScript 기반 |
| Build Tool | Vite 6 | HMR, 빠른 빌드 |
| UI Framework | Tailwind CSS 4 + shadcn/ui | 반응형 컴포넌트 시스템 |
| 차트/시각화 | Recharts | React 기반 차트 라이브러리 |
| 아이콘 | Lucide React | 일관된 아이콘 시스템 |
| 라우팅 | React Router v7 | SPA 클라이언트 라우팅 |
| 서버 상태 관리 | TanStack Query (React Query) v5 | Supabase 데이터 캐싱/동기화 |
| Backend / Auth / DB | Supabase | PostgreSQL + Auth + Row Level Security |
| 날짜 처리 | date-fns | 경량 날짜 유틸리티 |

Errand Manager는 반복적으로 발생하는 생활 관리 업무(차량 정비, 집 관리, 구독 서비스, 건강 검진 등)를 추적하고, 기한을 놓치지 않도록 관리하는 반응형 웹 애플리케이션이다. 데스크탑, 태블릿, 모바일 등 모든 기기에서 최적화된 UI를 제공하며, Supabase 기반의 사용자 인증과 클라우드 데이터 저장을 통해 어디서든 접근 가능하다.

---

## 2. 타겟 사용자

- 차량, 집, 구독 서비스, 건강 관리 등 다양한 반복 업무를 관리해야 하는 개인 사용자
- 기한 초과로 인한 불필요한 비용이나 리스크를 예방하고 싶은 사용자
- 데스크탑, 태블릿, 모바일 등 다양한 기기에서 생활 관리 업무를 한눈에 파악하고 싶은 사용자
- 반복 업무의 비용 추이와 완료율을 데이터 기반으로 분석하고 싶은 사용자

---

## 3. 인증 및 사용자 관리

### 3.1 Supabase Auth 연동

#### 3.1.1 로그인 페이지 (`/login`)
- 이메일 + 비밀번호 로그인 폼
- "Remember me" 체크박스
- "Forgot password?" 링크
- "Sign up" 링크 → 회원가입 페이지

#### 3.1.2 회원가입 페이지 (`/signup`)
- 이름 (Display Name) 입력
- 이메일 입력
- 비밀번호 입력 (최소 6자)
- 비밀번호 확인 입력
- "Sign Up" 버튼
- 가입 완료 후 자동 로그인 → 대시보드 이동

#### 3.1.3 인증 상태 관리
- 비로그인 사용자는 `/login`으로 리디렉트 (Protected Routes)
- 로그인 사용자는 `/login`, `/signup` 접근 시 `/`로 리디렉트
- Supabase 세션 자동 갱신
- 로그아웃 시 세션 삭제 후 `/login`으로 이동

#### 3.1.4 테스트 계정
| 항목 | 값 |
|------|-----|
| 이메일 | epark@gogogle.com |
| 비밀번호 | demo1234 |
| 이름 | Daniel Kim |
| 샘플 데이터 | 20개 Errand (섹션 10 참조) |

---

## 4. 핵심 기능

### 4.1 홈 대시보드 (`/`)

#### 4.1.1 인사 헤더
- 시간대별 인사 메시지 표시 (예: "Good Morning, Daniel")
- 부제: "Here's your errand overview"

#### 4.1.2 상태 요약 카드
3개의 상태 카드를 가로로 표시 (데스크탑 넓은 화면 활용):
| 상태 | 설명 | 색상 |
|------|------|------|
| **Overdue** | 기한이 지난 항목 수 | 빨간색 계열 |
| **Due Soon** | 곧 기한인 항목 수 | 주황색/노란색 계열 |
| **On Track** | 여유 있는 항목 수 | 초록색 계열 |

#### 4.1.3 Upcoming 섹션
- 가장 가까운 기한순으로 errand 목록 표시 (최대 5개)
- "See All" 버튼 → Errands 목록 페이지로 이동
- 각 항목에 표시되는 정보:
  - 카테고리 아이콘
  - Errand 이름
  - 반복 주기 (예: "Every 12 months")
  - 다음 기한 날짜
  - 상태 배지 (예: "30d overdue", "3d left", "Due tomorrow")

#### 4.1.4 Categories 섹션
- 카테고리별 errand 개수를 카드 형태로 가로 배치
- 카테고리 목록:
  - **Vehicle** (차량 아이콘)
  - **Home** (집 아이콘)
  - **Subscriptions** (구독 아이콘)
  - **Health** (건강 아이콘)
  - **Other** (기타 아이콘)
- 각 카드 클릭 시 해당 카테고리의 Errands 목록으로 필터링 이동

#### 4.1.5 대시보드 차트 영역
데스크탑에서는 2열 그리드, 태블릿에서는 1열, 모바일에서는 스택 배치:

**월별 지출 추이 차트 (Bar Chart)**
- 최근 6개월간 월별 총 비용을 수직 바 차트로 표시
- X축: 월 (예: Sep, Oct, Nov, Dec, Jan, Feb)
- Y축: 비용 ($)
- 각 바 hover 시 정확한 금액 툴팁 표시

**카테고리별 비용 분포 (Donut Chart)**
- 전체 비용 중 카테고리별 비중을 도넛 차트로 표시
- 중앙에 총 비용 금액 표시
- 범례: 카테고리명 + 금액 + 비율(%)
- 카테고리 색상: Vehicle(파랑) / Home(초록) / Subscriptions(보라) / Health(빨강) / Other(회색)

**완료율 통계 카드**
- 이번 달 완료율: 완료된 errand 수 / 이번 달 기한 errand 수 (원형 프로그래스)
- 정시 완료율: On Time 완료 수 / 전체 완료 수 (%)
- 평균 지연일: Overdue 상태에서 완료한 건들의 평균 초과 일수

**최근 활동 피드 (Recent Activity)**
- 최근 완료된 errand 5건을 타임라인 형태로 표시
- 각 항목: 완료 날짜, errand 이름, 비용, On Time/Late 배지

#### 4.1.6 Pro Tip 배너
- 하단에 도움말 팁 카드 표시
- 예: "Click the + New Errand button to add a new recurring errand. Stay ahead of deadlines and avoid surprise costs."

---

### 4.2 Errands 목록 (`/errands`)

#### 4.2.1 헤더 영역
- 제목: "Errands"
- 총 errand 수 표시 (예: "20 errands")
- **+ New Errand** 버튼 (Primary 버튼)
- **검색 바**: 인라인 검색 필드 (errand 이름, 카테고리 등으로 필터)
- **카테고리 필터 드롭다운**: 전체 / Vehicle / Home / Subscriptions / Health / Other

#### 4.2.2 보기 모드 전환
두 가지 보기 모드를 탭/토글 버튼으로 전환:

**List 뷰 (기본)**
- 테이블 형식의 errand 목록 (데스크탑 넓은 화면 활용)
- 열 구성:
  - 체크박스 (다중 선택)
  - 카테고리 아이콘
  - Errand 이름
  - 반복 주기
  - 다음 기한 날짜
  - 상태 배지
  - 최근 비용
  - 액션 버튼 (Complete / Edit / Delete) — 행 hover 시 표시
- 열 헤더 클릭으로 정렬 변경 가능 (이름, 기한, 카테고리, 비용)
- 다중 선택 시 상단에 벌크 액션 바 표시 (일괄 완료, 일괄 삭제)

**Calendar 뷰**
- 월간 캘린더 그리드 표시
- 좌/우 화살표로 월 이동
- errand가 있는 날짜에 점(dot) 마커 표시
- 날짜 클릭 시 해당 날짜의 errand 사이드 패널 표시
- 캘린더 우측 또는 하단에 해당 월의 errand 목록:
  - 날짜별 그룹핑 (예: "Thu, Feb 5")
  - 각 항목은 List 뷰와 동일한 카드 UI

---

### 4.3 Errand 상세 (`/errands/:id`)

데스크탑 레이아웃에서는 Errands 목록의 우측 패널(split view) 또는 별도 페이지로 표시.

#### 4.3.1 헤더
- **Back** 버튼 (← 아이콘 + "Back" 텍스트)
- Errand 이름 제목
- **Edit** 버튼 (연필 아이콘)
- **Delete** 버튼 (휴지통 아이콘, 빨간색)

#### 4.3.2 상세 정보 카드
- 카테고리 아이콘 (크게)
- Errand 이름 (h2)
- 카테고리 라벨 + 상태 배지

#### 4.3.3 정보 필드
2열 그리드 레이아웃으로 표시:
| 필드 | 설명 | 예시 |
|------|------|------|
| Interval | 반복 주기 | Every 12 months |
| Next Due | 다음 기한 | Jan 20, 2026 |
| Last Completed | 마지막 완료일 | Jan 20, 2025 |
| Reminders | 알림 상태 | Enabled (토글 가능) |
| Estimated Cost | 예상 비용 | $150.00 |

#### 4.3.4 Notes 섹션
- 메모 아이콘 + "Notes" 라벨
- 자유 형식 메모 표시 (예: "Drain and flush sediment from water heater tank. Check anode rod.")

#### 4.3.5 완료 이력 섹션 (Completion History)
- "History" 탭 또는 섹션으로 표시
- 테이블 형식의 완료 이력 목록:
  | 열 | 설명 |
  |----|------|
  | Completed Date | 완료 날짜 |
  | Scheduled Date | 원래 예정 날짜 |
  | Status | 정시 완료(On Time) / 지연 완료(Late) / 조기 완료(Early) |
  | Cost | 해당 완료 건의 비용 |
  | Notes | 완료 시 메모 |
- 완료 이력이 없으면 "No completion history yet" 메시지
- 이력을 기반으로 평균 비용, 총 비용 요약 표시

#### 4.3.6 액션 버튼
- **Mark as Completed**: 완료 처리 (체크 아이콘 + 텍스트)
  - 클릭 시 모달/다이얼로그 표시:
    - 완료 날짜 (기본: 오늘)
    - 비용 입력 (선택사항)
    - 완료 메모 (선택사항)
    - Confirm / Cancel 버튼
- **Delete Errand**: 삭제 확인 다이얼로그 후 삭제

---

### 4.4 New Errand 생성 (`/add`)

데스크탑에서는 모달 다이얼로그 또는 별도 페이지로 표시.

#### 4.4.1 헤더
- 제목: "New Errand"
- **X (닫기)** 버튼 (모달 방식) 또는 **Cancel** 버튼

#### 4.4.2 입력 폼
2열 그리드 레이아웃:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| Errand name | text input | O | Errand 이름 |
| Description | textarea | X | 선택적 설명/메모 |
| Category | select dropdown | O | Vehicle / Home / Subscriptions / Health / Other |
| Interval Type | radio group | O | Months / Miles |
| Interval Value | number input | O | 반복 주기 숫자 (기본값: 3) |
| Last Completed | date picker | O | 마지막 완료 날짜 |
| Next Due | date picker | O | 다음 기한 날짜 (Last Completed + Interval로 자동 계산 가능) |
| Estimated Cost | currency input | X | 예상 비용 (달러) |
| Reminders | toggle switch | X | 알림 켜기/끄기 |

#### 4.4.3 하단 버튼
- **Create Errand** 버튼 (Primary, 필수 필드 미입력 시 비활성화)
- **Cancel** 버튼 (Secondary)

---

### 4.5 Errand 수정 (`/edit/:id`)

#### 4.5.1 헤더
- 제목: "Edit Errand"
- **X (닫기)** 버튼

#### 4.5.2 입력 폼
- New Errand 폼과 동일한 구조
- 기존 데이터가 미리 채워져 있음
- **Save Changes** 버튼 (Primary)
- **Cancel** 버튼 (Secondary)

---

### 4.6 완료 이력 관리

#### 4.6.1 완료 처리 플로우
1. Errand 상세 또는 목록에서 "Mark as Completed" 클릭
2. 완료 다이얼로그 표시:
   - **Completed Date**: 날짜 선택 (기본: 오늘)
   - **Cost**: 비용 입력 (선택, 숫자 + 통화)
   - **Notes**: 메모 입력 (선택)
3. "Confirm" 클릭 시:
   - `completion_history` 테이블에 새 레코드 삽입
   - errand의 `last_completed`를 완료 날짜로 업데이트
   - errand의 `next_due`를 완료 날짜 + interval로 자동 재계산
   - errand의 `estimated_cost`를 입력 비용으로 업데이트 (입력한 경우)

#### 4.6.2 이력 조회
- Errand 상세 페이지의 "History" 섹션에서 해당 errand의 전체 이력 조회
- 최신 순 정렬
- 각 이력 항목 삭제 가능 (관리자/본인)

---

### 4.7 비용 추적

#### 4.7.1 Errand별 비용
- 각 errand에 `estimated_cost` 필드 (예상 비용)
- 완료 처리 시 실제 발생 비용 기록
- 상세 페이지에서 총 누적 비용 및 평균 비용 표시

#### 4.7.2 대시보드 비용 요약 (홈 화면)
- 최근 30일 총 지출
- 카테고리별 비용 비율 표시
- 월간 비용 추이 (간단한 바 또는 라인)

---

### 4.8 Settings (`/settings`)

#### 4.8.1 프로필 섹션
- 사용자 아바타 (이니셜 기반, 예: "DK")
- 사용자 이름 표시 + 수정 가능
- 이메일 표시 (읽기 전용)
- 추적 중인 errand 수 (예: "20 errands tracked")
- **Logout** 버튼

#### 4.8.2 Notifications 섹션
| 설정 | 타입 | 설명 |
|------|------|------|
| Remind Days Before | select dropdown | 기한 며칠 전에 표시 (1일 / 3일 / 7일 / 14일, 기본: 3일) |

#### 4.8.3 Data 섹션
| 항목 | 설명 |
|------|------|
| Storage | Supabase Cloud |
| Export Data | errand 데이터를 CSV로 내보내기 |
| Clear All Errands | 모든 errand 데이터 삭제 (확인 다이얼로그) |

#### 4.8.4 About 섹션
| 항목 | 설명 |
|------|------|
| Send Feedback | 피드백 이메일 링크 |
| Version | 앱 버전 표시 (1.0.0) |

---

### 4.9 Analytics (`/analytics`)

전용 분석 페이지로, 대시보드의 차트를 더 상세하게 탐색 가능.

#### 4.9.1 기간 선택
- 상단에 기간 필터: Last 30 days / Last 3 months / Last 6 months / Last 12 months / Custom Range
- 기간 변경 시 모든 차트가 동적으로 업데이트

#### 4.9.2 비용 분석 섹션

**월별 지출 추이 (Bar Chart — 확장)**
- 선택 기간 내 월별 총 비용 바 차트
- 각 바를 카테고리별로 스택 (Stacked Bar)하여 구성 비율 표시
- 월 클릭 시 해당 월의 상세 비용 테이블 드릴다운

**카테고리별 비용 분포 (Donut Chart — 확장)**
- 선택 기간 내 카테고리별 비용 비중
- 카테고리 클릭 시 해당 카테고리의 errand별 비용 리스트 표시

**비용 Top 5 Errands (Horizontal Bar)**
- 선택 기간 내 누적 비용 상위 5개 errand
- 가로 바 차트 + 금액 레이블

**월별 비용 비교 테이블**
| 월 | Vehicle | Home | Subscriptions | Health | Other | 합계 |
|----|---------|------|---------------|--------|-------|------|
- 카테고리 x 월 매트릭스 테이블로 상세 수치 확인

#### 4.9.3 완료율 분석 섹션

**월별 완료율 추이 (Line Chart)**
- 선택 기간 내 월별 완료율을 라인 차트로 표시
- Y축: 완료율 (0~100%)
- 목표선: 100% 기준선 표시

**정시/지연/조기 완료 비율 (Donut Chart)**
- On Time / Late / Early 비율을 도넛 차트로 표시
- 중앙에 전체 완료 건수 표시

**카테고리별 완료율 (Grouped Bar Chart)**
- 카테고리별로 정시/지연/조기 완료 건수를 그룹 바 차트로 비교
- 어떤 카테고리가 자주 지연되는지 한눈에 파악

#### 4.9.4 요약 통계 카드 (상단)
4개의 KPI 카드를 가로 배치:
| KPI | 설명 | 예시 |
|-----|------|------|
| Total Spent | 선택 기간 총 지출 | $2,450.00 |
| Avg. Monthly | 월평균 지출 | $408.33 |
| Completion Rate | 정시 완료율 | 78% |
| Avg. Delay | 평균 지연일 | 3.2 days |

- 각 카드에 이전 기간 대비 변화율 표시 (예: +12% ↑, -5% ↓)
- 상승은 초록/빨강 (지표 성격에 따라), 하락은 반대

---

## 5. 네비게이션 구조

### 5.1 데스크탑: 사이드바 네비게이션 (Sidebar)
데스크탑/태블릿 레이아웃에 맞춘 좌측 고정 사이드바:

| 메뉴 | 아이콘 | 라우트 | 설명 |
|------|--------|--------|------|
| Dashboard | LayoutDashboard | `/` | 홈 대시보드 |
| Errands | ClipboardList | `/errands` | Errand 목록 |
| Analytics | BarChart3 | `/analytics` | 차트/분석 |
| Settings | Settings | `/settings` | 설정 |

- 사이드바 하단에 **+ New Errand** 버튼 (Primary, 항상 접근 가능)
- 사이드바 최하단에 사용자 프로필 요약 (아바타 + 이름) + Logout 버튼
- 현재 활성 메뉴는 배경색/좌측 바로 강조
- 사이드바 접기/펼치기 토글 지원 (아이콘만 / 아이콘+텍스트)

### 5.2 모바일: 하단 탭 바 (Bottom Navigation)
모바일 레이아웃(`< 768px`)에서는 Figma 원본 디자인의 하단 탭 바를 적용:

| 탭 | 아이콘 | 라우트 | 설명 |
|----|--------|--------|------|
| Home | Home | `/` | 대시보드 |
| Errands | ClipboardList | `/errands` | Errand 목록 |
| + (Add) | PlusCircle | `/add` | 새 errand 생성 (원형 FAB) |
| Analytics | BarChart3 | `/analytics` | 차트/분석 |
| Settings | Settings | `/settings` | 설정 |

- 현재 활성 탭은 아이콘 색상 + 하단 인디케이터로 강조
- Add(+) 버튼은 중앙에 크고 눈에 띄는 원형 디자인 (FAB 스타일)
- 안전 영역(safe area) 하단 패딩 적용

### 5.3 라우팅
| 경로 | 화면 | 인증 필요 |
|------|------|-----------|
| `/login` | 로그인 | X |
| `/signup` | 회원가입 | X |
| `/` | 홈 대시보드 | O |
| `/errands` | Errand 목록 (List/Calendar) | O |
| `/errands/:id` | Errand 상세 | O |
| `/add` | 새 Errand 생성 | O |
| `/edit/:id` | Errand 수정 | O |
| `/analytics` | 분석/차트 | O |
| `/settings` | 설정 | O |

---

## 6. 데이터 모델 (Supabase PostgreSQL)

### 6.1 profiles 테이블
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  remind_days_before INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6.2 errands 테이블
```sql
CREATE TABLE errands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('vehicle', 'home', 'subscriptions', 'health', 'other')),
  interval_type TEXT NOT NULL CHECK (interval_type IN ('months', 'miles')),
  interval_value INTEGER NOT NULL,
  next_due DATE NOT NULL,
  last_completed DATE,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  reminders BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_errands_user_id ON errands(user_id);
CREATE INDEX idx_errands_next_due ON errands(next_due);
CREATE INDEX idx_errands_category ON errands(category);
```

### 6.3 completion_history 테이블
```sql
CREATE TABLE completion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  errand_id UUID NOT NULL REFERENCES errands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  scheduled_date DATE NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_completion_history_errand_id ON completion_history(errand_id);
CREATE INDEX idx_completion_history_user_id ON completion_history(user_id);
```

### 6.4 Row Level Security (RLS) 정책
```sql
-- profiles: 본인 데이터만 조회/수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- errands: 본인 데이터만 CRUD
ALTER TABLE errands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own errands" ON errands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own errands" ON errands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own errands" ON errands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own errands" ON errands FOR DELETE USING (auth.uid() = user_id);

-- completion_history: 본인 데이터만 CRUD
ALTER TABLE completion_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON completion_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON completion_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON completion_history FOR DELETE USING (auth.uid() = user_id);
```

### 6.5 Category Enum
| 값 | 표시명 | 아이콘 (Lucide) |
|----|--------|-----------------|
| `vehicle` | Vehicle | Car |
| `home` | Home | Home |
| `subscriptions` | Subscriptions | CreditCard |
| `health` | Health | Heart |
| `other` | Other | MoreHorizontal |

---

## 7. 비즈니스 로직

### 7.1 상태 계산
각 errand의 상태는 `next_due` 날짜와 현재 날짜를 비교하여 동적으로 계산:

| 조건 | 상태 | 배지 텍스트 | 색상 |
|------|------|-------------|------|
| `next_due < today` | Overdue | "Xd overdue" | 빨간색 |
| `next_due == today` | Due Today | "Due today" | 주황색 |
| `next_due == today + 1` | Due Tomorrow | "Due tomorrow" | 주황색 |
| `next_due <= today + remind_days_before` | Due Soon | "Xd left" | 주황색 |
| `next_due > today + remind_days_before` | On Track | "Xd left" | 초록색 |

### 7.2 완료 처리 (Mark as Completed)
1. 완료 다이얼로그에서 날짜, 비용, 메모 입력
2. `completion_history`에 새 레코드 삽입 (completed_date, scheduled_date = 기존 next_due, cost, notes)
3. errand의 `last_completed`를 completed_date로 업데이트
4. errand의 `next_due`를 completed_date + `interval_value` (months)로 자동 계산
5. 마일리지 기반인 경우 `next_due`는 사용자가 수동 지정
6. 상태가 자동으로 재계산됨

### 7.3 비용 계산 로직
- **Errand별 총 비용**: 해당 errand의 `completion_history` cost 합산
- **Errand별 평균 비용**: 총 비용 / 완료 횟수
- **월별 비용**: 해당 월에 완료된 모든 errand의 cost 합산
- **카테고리별 비용**: 카테고리에 속한 모든 errand의 cost 합산

### 7.4 정렬 규칙
- Errands 목록: `next_due` 오름차순 (가장 급한 항목이 상단)
- Overdue 항목이 항상 최상단

### 7.5 Upcoming 로직 (홈 화면)
- 모든 errand를 `next_due` 오름차순 정렬
- 상위 5개만 표시
- Overdue 항목 우선 포함

---

## 8. UI/UX 가이드라인 (반응형 다중 기기)

### 8.1 디자인 원칙
- **반응형 우선 (Responsive First)**: 데스크탑, 태블릿, 모바일 모두 최적화된 레이아웃 제공
- **적응형 네비게이션**: 데스크탑은 사이드바, 모바일은 하단 탭 바로 자동 전환
- **카드 + 테이블 혼합**: 대시보드는 카드 기반, 목록은 데스크탑 테이블 / 모바일 카드 리스트
- **직관적 색상 코딩**: 빨강(overdue) / 주황(due soon) / 초록(on track)
- **기기별 인터랙션**: 데스크탑은 호버/우클릭, 모바일은 탭/스와이프
- **모달 / 시트 전환**: 데스크탑은 모달 다이얼로그, 모바일은 바텀 시트
- **밝은 테마**: 깨끗한 화이트 배경 + 서브틀한 그림자와 보더

### 8.2 반응형 브레이크포인트
| 브레이크포인트 | 기기 | 네비게이션 | 레이아웃 |
|---------------|------|-----------|---------|
| >= 1280px (xl) | 데스크탑 | 사이드바 펼침 (240px) | 다단 그리드 (2~3열) |
| 1024px ~ 1279px (lg) | 소형 데스크탑 | 사이드바 축소 (아이콘만, 64px) | 2열 그리드 |
| 768px ~ 1023px (md) | 태블릿 | 사이드바 숨김 (햄버거로 토글) | 2열 그리드 |
| < 768px (sm) | 모바일 | 하단 탭 바 (고정) | 1열 스택 |

### 8.3 기기별 레이아웃 구조

**데스크탑 (>= 1024px)**
```
+------------------+---------------------------------------------+
|                  |                                             |
|    Sidebar       |           Main Content Area                 |
|    (240px)       |           (나머지 전체 너비)                  |
|                  |                                             |
|  - Dashboard     |   +-------------------------------------+   |
|  - Errands       |   |  Page Header + Actions              |   |
|  - Analytics     |   +-------------------------------------+   |
|  - Settings      |   |                                     |   |
|                  |   |  Page Content                       |   |
|  + New Errand    |   |  (카드, 테이블, 차트 등)               |   |
|                  |   |                                     |   |
|  [User Profile]  |   +-------------------------------------+   |
+------------------+---------------------------------------------+
```

**모바일 (< 768px)**
```
+---------------------------------------------+
|  Header (페이지 제목 + 액션 버튼)             |
+---------------------------------------------+
|                                             |
|  Page Content                               |
|  (카드 리스트, 차트, 폼 등 — 세로 스택)       |
|                                             |
+---------------------------------------------+
| Home | Errands | (+) | Analytics | Settings |
+---------------------------------------------+
```

### 8.4 기기별 컴포넌트 적응

| 컴포넌트 | 데스크탑 (>= 1024px) | 모바일 (< 768px) |
|---------|---------------------|-----------------|
| Errand 목록 | 데이터 테이블 (열 정렬, 체크박스) | 카드 리스트 (스와이프 액션) |
| Errand 상세 | 사이드 패널 또는 별도 페이지 | 전체 화면 페이지 |
| 생성/수정 폼 | 모달 다이얼로그 (2열 그리드) | 전체 화면 페이지 (1열 스택) |
| 완료 처리 | 모달 다이얼로그 | 바텀 시트 |
| 삭제 확인 | 모달 다이얼로그 | 바텀 시트 |
| 차트 | 2열 그리드 배치 | 1열 세로 스택 (가로 스크롤 바 차트) |
| 검색/필터 | 인라인 검색 바 + 드롭다운 | 상단 검색 아이콘 → 풀스크린 검색 |
| 캘린더 뷰 | 우측 사이드 패널에 상세 목록 | 캘린더 아래 목록 (세로 스택) |
| 대시보드 카드 | 가로 3열 배치 | 가로 스크롤 또는 세로 스택 |
| Analytics KPI | 가로 4열 배치 | 가로 스크롤 또는 2x2 그리드 |

### 8.5 인터랙션 패턴

**데스크탑 인터랙션:**
- **행 클릭** → Errand 상세 사이드 패널 또는 페이지 이동
- **행 호버** → 우측에 Quick Action 아이콘 표시 (Complete, Edit, Delete)
- **모달 다이얼로그** → Errand 생성/수정/완료 처리
- **키보드 단축키**: `N` = 새 Errand, `Esc` = 모달 닫기
- **차트 호버** → 툴팁으로 상세 데이터 표시

**모바일 인터랙션:**
- **카드 탭** → Errand 상세 전체 화면 이동
- **좌측 스와이프** → Quick Action 노출 (Complete, Delete)
- **풀다운 새로고침** → 데이터 동기화
- **FAB(+) 탭** → 새 Errand 생성 페이지 이동
- **차트 탭** → 툴팁 표시 (hover 없음 대응)

**공통 인터랙션:**
- **토글 스위치** → 즉시 on/off 반영
- **드롭다운 셀렉트** → shadcn/ui Select 컴포넌트
- **Date Picker** → shadcn/ui Calendar 팝오버
- **Toast 알림** → 성공/에러 피드백 (데스크탑: 우측 하단, 모바일: 상단)
- **확인 다이얼로그** → 삭제 등 위험 액션 전 확인

### 8.6 상태 표시
- 카테고리별 컬러 아이콘
- 구독 항목에 자동갱신 배지
- 마일리지 기반 항목에 별도 아이콘 표시
- 비용 금액은 통화 포맷 ($X,XXX.XX)
- 차트 색상 팔레트: 카테고리별 일관된 색상 시스템 유지

---

## 9. 데이터 저장 및 백엔드

### 9.1 Supabase 구성
- **인증**: Supabase Auth (이메일/비밀번호)
- **데이터베이스**: PostgreSQL (profiles, errands, completion_history)
- **보안**: Row Level Security (RLS)로 사용자 데이터 격리
- **실시간**: 선택적 Supabase Realtime 구독 (향후 확장)

### 9.2 API 패턴
- Supabase JS Client (`@supabase/supabase-js`) 사용
- TanStack Query로 서버 상태 캐싱 및 자동 동기화
- Optimistic Updates 적용 (완료 처리, 삭제 등 즉시 UI 반영)

---

## 10. 샘플 데이터 (20개 Errands — 테스트 계정)

| # | 이름 | 카테고리 | 주기 | 다음 기한 | 마지막 완료 | 예상 비용 | 메모 |
|---|------|----------|------|-----------|-------------|-----------|------|
| 1 | Water Heater Flush | Home | Every 12 months | 2026-01-20 | 2025-01-20 | $150 | Drain and flush sediment from water heater tank. Check anode rod. |
| 2 | Windshield Wiper Replacement | Vehicle | Every 6 months | 2026-01-30 | 2025-07-30 | $35 | Replace front and rear wiper blades. |
| 3 | Eye Exam | Health | Every 12 months | 2026-02-05 | 2025-02-05 | $200 | Annual comprehensive eye exam. Update prescription if needed. |
| 4 | Netflix Subscription | Subscriptions | Every 1 month | 2026-02-10 | 2026-01-10 | $15.49 | Standard plan auto-renewal. |
| 5 | Gym Membership Renewal | Health | Every 12 months | 2026-02-18 | 2025-02-18 | $480 | Annual gym membership fee. |
| 6 | Lawn Mower Service | Home | Every 12 months | 2026-02-20 | 2025-02-20 | $120 | Blade sharpening, oil change, air filter. |
| 7 | Domain Name Renewal | Subscriptions | Every 12 months | 2026-02-22 | 2025-02-22 | $12 | Personal domain renewal. |
| 8 | Spotify Premium | Subscriptions | Every 1 month | 2026-03-01 | 2026-02-01 | $10.99 | Individual plan. |
| 9 | Brake Inspection | Vehicle | Every 15,000 mi | 2026-03-01 | 2025-09-01 | $50 | Check brake pads, rotors, and fluid. |
| 10 | iCloud Storage | Subscriptions | Every 1 month | 2026-03-01 | 2026-02-01 | $2.99 | 200GB plan. |
| 11 | Pet Vaccination | Health | Every 12 months | 2026-03-15 | 2025-03-15 | $180 | Annual shots and checkup for dog. |
| 12 | Gutter Cleaning | Home | Every 6 months | 2026-04-01 | 2025-10-01 | $200 | Clean gutters and downspouts. Check for damage. |
| 13 | HVAC Filter Replacement | Home | Every 3 months | 2026-04-10 | 2026-01-10 | $25 | Replace air filters in all units. |
| 14 | Oil Change | Vehicle | Every 5,000 mi | 2026-04-15 | 2025-10-15 | $75 | Full synthetic oil change. |
| 15 | Dryer Vent Cleaning | Home | Every 12 months | 2026-04-20 | 2025-04-20 | $130 | Professional dryer vent cleaning to prevent fire hazard. |
| 16 | Dental Checkup | Health | Every 6 months | 2026-05-20 | 2025-11-20 | $250 | Routine cleaning and examination. |
| 17 | Smoke Detector Batteries | Home | Every 6 months | 2026-06-01 | 2025-12-01 | $15 | Replace batteries in all smoke and CO detectors. |
| 18 | Car Registration Renewal | Vehicle | Every 12 months | 2026-06-15 | 2025-06-15 | $120 | Annual vehicle registration renewal. |
| 19 | Tire Rotation | Vehicle | Every 7,500 mi | 2026-06-20 | 2025-12-20 | $40 | Rotate all four tires. Check tire pressure. |
| 20 | Adobe Creative Cloud | Subscriptions | Every 12 months | 2026-08-15 | 2025-08-15 | $659.88 | All Apps annual subscription. |

---

## 11. 향후 확장 고려사항 (v2.0+)

- 공유 기능 (가족/팀과 errand 공유)
- 이메일/브라우저 알림 (Supabase Edge Functions)
- 다크 모드
- 다국어 지원
- Errand 템플릿 (자주 쓰는 errand 빠른 추가)
- 첨부파일 (영수증 사진, 문서 등 — Supabase Storage)
- PWA 지원 (모바일 홈 화면 설치, 오프라인 캐시)

---

## 12. Figma 디자인 참조

- **원본 모바일 디자인 URL:** https://ruler-radius-23969231.figma.site
- 원본은 모바일 UI 기준이며, 본 PRD는 데스크탑으로 재해석한 버전
- 핵심 기능(대시보드, Errands 목록/캘린더, 상세, 생성/수정, 설정)은 동일하게 유지
- 반응형 다중 기기 전환 시 주요 변경점:
  - 데스크탑: 사이드바 네비게이션 + 데이터 테이블 + 호버 액션 + 모달 다이얼로그
  - 모바일: 하단 탭 바 + 카드 리스트 + 스와이프 액션 + 바텀 시트 / 전체 화면
  - 태블릿: 데스크탑과 모바일의 중간 — 햄버거 사이드바 + 2열 그리드
- 신규 추가 기능:
  - Analytics 전용 페이지 (비용 추이, 완료율, 카테고리별 분석 차트)
  - 대시보드 차트 위젯 (월별 지출 바 차트, 카테고리 도넛 차트, 완료율 통계)
  - Recharts 기반 인터랙티브 차트 시스템
