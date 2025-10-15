---
description: "Task list for Blog Post Management System implementation"
---

# Tasks: Blog Post Management System

**Input**: Design documents from `/specs/006-build-a-blog/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: This project follows Test-Driven Development (TDD) as mandated by Constitution Principle IV (NON-NEGOTIABLE). All test tasks MUST be completed BEFORE implementing the corresponding functionality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `blog_post_manager_app/src/`, `blog_post_manager_app/tests/` at repository root
- Paths shown below follow FastAPI project structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project root directory structure: `blog_post_manager_app/src/`, `blog_post_manager_app/tests/`, `blog_post_manager_app/alembic/`, `blog_post_manager_app/docker/`, `blog_post_manager_app/k8s/`
- [ ] T002 Initialize Python project with uv: create `pyproject.toml` with FastAPI, SQLAlchemy 2.0+, Pydantic V2, python-jose, passlib[bcrypt], pytest, pytest-asyncio, uvicorn dependencies
- [ ] T003 [P] Create `blog_post_manager_app/.env.example` with DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, CORS_ORIGINS, ENVIRONMENT, LOG_LEVEL templates
- [ ] T004 [P] Create `blog_post_manager_app/.gitignore` excluding .env, __pycache__, *.pyc, .venv, alembic/versions/__pycache__, .pytest_cache
- [ ] T005 [P] Configure linting (ruff) and type checking (mypy) in `pyproject.toml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create `blog_post_manager_app/src/__init__.py` (empty module marker)
- [ ] T007 Create `blog_post_manager_app/src/config.py` with Settings class using pydantic-settings for environment variable management (DATABASE_URL, JWT_SECRET_KEY, etc.)
- [ ] T008 Create `blog_post_manager_app/src/database.py` with async SQLAlchemy engine, AsyncSession factory, Base declarative base, and get_db dependency function
- [ ] T009 Initialize Alembic: run `alembic init alembic` in blog_post_manager_app/, configure `alembic/env.py` to use async engine and import Base from src.database
- [ ] T010 [P] Create `blog_post_manager_app/src/models/__init__.py` (empty module marker)
- [ ] T011 Create `blog_post_manager_app/src/models/user.py` with User model (id, email, username, hashed_password, full_name, is_active, created_at, updated_at) per data-model.md:273-293
- [ ] T012 Create `blog_post_manager_app/src/models/post.py` with Post model (id, author_id FK, title, content, excerpt, status ENUM, publication_date, created_at, updated_at, search_vector) and PostStatus enum per data-model.md:298-346
- [ ] T013 Create `blog_post_manager_app/src/models/tag.py` with Tag model (id, name UNIQUE, created_at) per data-model.md:351-371
- [ ] T014 Create `blog_post_manager_app/src/models/post_tag.py` with PostTag junction model (post_id FK, tag_id FK, created_at, composite PK) per data-model.md:376-392
- [ ] T015 Create Alembic migration `001_create_tables`: users table with indexes, post_status ENUM, posts table with indexes and check constraints, tags table, post_tags junction table per data-model.md:400-410
- [ ] T016 Create Alembic migration `002_add_triggers`: posts_search_trigger for search_vector auto-update, posts_updated_at trigger, post_tags_max_check trigger for 10-tag limit per data-model.md:400-410
- [ ] T017 Run migrations: `alembic upgrade head` to create database schema
- [ ] T018 [P] Create `blog_post_manager_app/src/utils/__init__.py` (empty module marker)
- [ ] T019 Create `blog_post_manager_app/src/utils/security.py` with password hashing functions (hash_password using bcrypt, verify_password) per research.md section 4
- [ ] T020 Create `blog_post_manager_app/src/utils/logging.py` with structured JSON logging setup (correlation ID support, stdout/stderr output) per research.md section 9
- [ ] T021 [P] Create `blog_post_manager_app/src/services/__init__.py` (empty module marker)
- [ ] T022 Create `blog_post_manager_app/src/services/auth_service.py` with JWT token creation/validation functions (create_access_token, create_refresh_token, decode_token) per research.md section 4
- [ ] T023 [P] Create `blog_post_manager_app/src/middleware/__init__.py` (empty module marker)
- [ ] T024 Create `blog_post_manager_app/src/middleware/correlation_id.py` middleware to add request_id to context per plan.md:172
- [ ] T025 Create `blog_post_manager_app/src/middleware/error_handler.py` global exception handler returning consistent error schema {error, details, request_id} per contracts/auth.yaml error response
- [ ] T026 Create `blog_post_manager_app/src/middleware/rate_limit.py` rate limiting middleware (100 requests/min per user) per research.md section 10
- [ ] T027 [P] Create `blog_post_manager_app/src/schemas/__init__.py` (empty module marker)
- [ ] T028 Create `blog_post_manager_app/src/schemas/common.py` with PaginationInfo, ErrorResponse, ValidationError Pydantic schemas per contracts/posts.yaml components
- [ ] T029 Create `blog_post_manager_app/src/schemas/auth.py` with LoginRequest, RegisterRequest, RefreshRequest, TokenResponse, UserResponse Pydantic schemas per contracts/auth.yaml
- [ ] T030 [P] Create `blog_post_manager_app/src/api/__init__.py` (empty module marker)
- [ ] T031 Create `blog_post_manager_app/src/api/deps.py` with get_db async dependency, get_current_user dependency (JWT validation), oauth2_scheme for bearer token extraction per plan.md:157
- [ ] T032 [P] Create `blog_post_manager_app/src/api/v1/__init__.py` (empty module marker)
- [ ] T033 Create `blog_post_manager_app/src/api/v1/router.py` that aggregates all v1 routers (auth, posts, tags, search) per plan.md:160
- [ ] T034 Create `blog_post_manager_app/src/main.py` FastAPI app initialization with middleware (CORS, correlation_id, rate_limit, error_handler), include v1 router, add /health and /metrics endpoints per plan.md:140
- [ ] T035 [P] Create `blog_post_manager_app/tests/__init__.py` (empty module marker)
- [ ] T036 Create `blog_post_manager_app/tests/conftest.py` with pytest fixtures: test database session (with transaction rollback), async test client, authenticated user fixture, sample data factories per quickstart.md test database setup
- [ ] T037 [P] Create `blog_post_manager_app/tests/unit/__init__.py` (empty module marker)
- [ ] T038 [P] Create `blog_post_manager_app/tests/integration/__init__.py` (empty module marker)
- [ ] T039 [P] Create `blog_post_manager_app/tests/contract/__init__.py` (empty module marker)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: Authentication System (Prerequisite for User Stories 2+)

**Purpose**: User registration and authentication (required before author-specific features)

**Why separate from Phase 2**: While authentication is foundational, User Story 1 (Public Post Reading) can technically work with seeded data. Authentication is required starting with User Story 2.

### Tests for Authentication (TDD: Write tests FIRST, ensure they FAIL)

- [ ] T040 [P] Create `blog_post_manager_app/tests/integration/test_auth_flow.py` with test_register_new_user (POST /api/v1/auth/register with valid data returns 201 and user object)
- [ ] T041 [P] Create test_register_duplicate_email in test_auth_flow.py (POST /api/v1/auth/register with existing email returns 409 conflict)
- [ ] T042 [P] Create test_login_success in test_auth_flow.py (POST /api/v1/auth/login with valid credentials returns 200 with access_token, refresh_token)
- [ ] T043 [P] Create test_login_invalid_credentials in test_auth_flow.py (POST /api/v1/auth/login with wrong password returns 401)
- [ ] T044 [P] Create test_refresh_token in test_auth_flow.py (POST /api/v1/auth/refresh with valid refresh_token returns new access_token)

### Implementation for Authentication

- [ ] T045 Create `blog_post_manager_app/src/api/v1/auth.py` router with POST /login endpoint (validate credentials, call auth_service, return TokenResponse) per contracts/auth.yaml:7-50
- [ ] T046 Add POST /register endpoint to src/api/v1/auth.py (validate email uniqueness, hash password, create user, return UserResponse) per contracts/auth.yaml:52-95
- [ ] T047 Add POST /refresh endpoint to src/api/v1/auth.py (validate refresh token, generate new access token, return TokenResponse) per contracts/auth.yaml:97-115
- [ ] T048 Update src/api/v1/router.py to include auth router

**Checkpoint**: Run `pytest tests/integration/test_auth_flow.py -v` - all tests should PASS. Authentication system is complete and can be used by subsequent user stories.

---

## Phase 4: User Story 1 - Public Post Reading (Priority: P1) 🎯 MVP

**Goal**: Readers can browse and read published blog posts without authentication, filter by tags, and navigate paginated results

**Independent Test**: Create sample published posts (with tags and authors), verify unauthenticated GET /posts returns only published posts with pagination, verify GET /posts/{id} shows full post details, verify tag filtering works

### Tests for User Story 1 (TDD: Write tests FIRST, ensure they FAIL before implementation)

- [ ] T049 [P] [US1] Create `blog_post_manager_app/tests/integration/test_post_crud.py` with test_list_published_posts_public (unauthenticated GET /api/v1/posts returns only published posts, not drafts/archived)
- [ ] T050 [P] [US1] Create test_get_post_detail_public in test_post_crud.py (unauthenticated GET /api/v1/posts/{id} for published post returns full content with author info and tags)
- [ ] T051 [P] [US1] Create test_get_draft_post_fails_public in test_post_crud.py (unauthenticated GET /api/v1/posts/{draft_id} returns 403 or 404)
- [ ] T052 [P] [US1] Create `blog_post_manager_app/tests/integration/test_pagination.py` with test_posts_paginated_default (GET /posts returns pagination metadata, default 20 items per page)
- [ ] T053 [P] [US1] Create test_posts_pagination_navigation in test_pagination.py (GET /posts?page=2 returns page 2, has_next/has_previous correct)
- [ ] T054 [P] [US1] Create `blog_post_manager_app/tests/integration/test_tag_management.py` with test_filter_posts_by_tag (GET /posts?tags=python returns only posts with 'python' tag)
- [ ] T055 [P] [US1] Create test_filter_posts_by_multiple_tags in test_tag_management.py (GET /posts with comma-separated tags returns posts matching ALL tags)
- [ ] T056 [P] [US1] Create `blog_post_manager_app/tests/contract/test_openapi_compliance.py` with test_posts_list_matches_contract (GET /posts response validates against contracts/posts.yaml PostListResponse schema)

### Implementation for User Story 1

- [ ] T057 [P] [US1] Create `blog_post_manager_app/src/schemas/user.py` with UserResponse, AuthorInfo Pydantic schemas per contracts/posts.yaml:167-175
- [ ] T058 [P] [US1] Create `blog_post_manager_app/src/schemas/tag.py` with TagInfo, TagResponse Pydantic schemas per contracts/tags.yaml and contracts/posts.yaml:177-184
- [ ] T059 [US1] Create `blog_post_manager_app/src/schemas/post.py` with PostCreateRequest, PostUpdateRequest, PostResponse, PostSummary, PostListResponse Pydantic schemas per contracts/posts.yaml:117-165
- [ ] T060 [US1] Create `blog_post_manager_app/src/services/post_service.py` with get_published_posts(db, page, page_size, tag_ids) function using selectinload for author/tags to prevent N+1 queries per data-model.md:444-455
- [ ] T061 [US1] Add get_post_by_id(db, post_id, current_user) function to src/services/post_service.py with authorization logic (published posts public, drafts only for author)
- [ ] T062 [US1] Add apply_pagination(query, page, page_size) helper function to src/services/post_service.py returning PaginationInfo
- [ ] T063 [US1] Create `blog_post_manager_app/src/api/v1/posts.py` router with GET /posts endpoint (query params: page, page_size, status, sort_by, optional auth) per contracts/posts.yaml:7-63
- [ ] T064 [US1] Add GET /posts/{post_id} endpoint to src/api/v1/posts.py (fetch post, check visibility rules, return PostResponse) per contracts/posts.yaml:65-103
- [ ] T065 [US1] Create `blog_post_manager_app/src/api/v1/tags.py` router with GET /tags endpoint (optional include_count param) per contracts/tags.yaml:7-35
- [ ] T066 [US1] Add GET /tags/{tag_id}/posts endpoint to src/api/v1/tags.py (paginated posts with specific tag) per contracts/tags.yaml:63-98
- [ ] T067 [US1] Update src/api/v1/router.py to include posts and tags routers
- [ ] T068 [US1] Add sorting logic to src/services/post_service.py for publication_date and title (asc/desc) per spec.md:FR-027,FR-028

**Checkpoint**: Run `pytest tests/integration/test_post_crud.py tests/integration/test_pagination.py tests/integration/test_tag_management.py -v` - all US1 tests should PASS. At this point, User Story 1 is fully functional: readers can browse and filter published posts without authentication. This is a viable MVP!

---

## Phase 5: User Story 2 - Author Post Management (Priority: P2)

**Goal**: Authenticated authors can create posts, manage them through editing/deletion, with author-based authorization enforced

**Independent Test**: Authenticate as author A, create draft post, publish it, edit it, verify author B cannot edit author A's post, delete own post

### Tests for User Story 2 (TDD: Write tests FIRST, ensure they FAIL before implementation)

- [ ] T069 [P] [US2] Create test_create_post_authenticated in test_post_crud.py (authenticated POST /api/v1/posts with valid data returns 201, post saved as draft with creation timestamp)
- [ ] T070 [P] [US2] Create test_create_post_unauthenticated_fails in test_post_crud.py (unauthenticated POST /api/v1/posts returns 401)
- [ ] T071 [P] [US2] Create test_create_post_validation_errors in test_post_crud.py (POST /posts with title > 200 chars returns 422 with field-level errors)
- [ ] T072 [P] [US2] Create test_create_post_with_tags in test_post_crud.py (POST /posts with tags array creates post and reuses/creates tags with normalization)
- [ ] T073 [P] [US2] Create test_create_post_exceeding_tag_limit in test_post_crud.py (POST /posts with >10 tags returns 422 validation error)
- [ ] T074 [P] [US2] Create `blog_post_manager_app/tests/integration/test_post_authorization.py` with test_update_own_post (authenticated PATCH /posts/{id} for own post succeeds)
- [ ] T075 [P] [US2] Create test_update_other_author_post_fails in test_post_authorization.py (authenticated PATCH /posts/{other_author_id} returns 403)
- [ ] T076 [P] [US2] Create test_delete_own_post in test_post_authorization.py (authenticated DELETE /posts/{id} for own post returns 204)
- [ ] T077 [P] [US2] Create test_delete_other_author_post_fails in test_post_authorization.py (authenticated DELETE /posts/{other_author_id} returns 403)
- [ ] T078 [P] [US2] Create test_publish_post_sets_publication_date in test_post_crud.py (PATCH /posts/{id} changing status to 'published' sets publication_date to current timestamp)

### Implementation for User Story 2

- [ ] T079 [US2] Add create_post(db, post_data, current_user) function to src/services/post_service.py (create post with author_id, handle tag creation/reuse with normalization, enforce 10-tag limit)
- [ ] T080 [US2] Add update_post(db, post_id, post_data, current_user) function to src/services/post_service.py (check ownership, update fields, handle status change to 'published' sets publication_date, update tags)
- [ ] T081 [US2] Add delete_post(db, post_id, current_user) function to src/services/post_service.py (check ownership, delete post with CASCADE to post_tags)
- [ ] T082 [US2] Add POST /posts endpoint to src/api/v1/posts.py (Depends on get_current_user, call create_post service, return 201 with PostResponse) per contracts/posts.yaml:102-155
- [ ] T083 [US2] Add PATCH /posts/{post_id} endpoint to src/api/v1/posts.py (Depends on get_current_user, call update_post service, handle 403 for non-owners, return PostResponse) per contracts/posts.yaml:157-199
- [ ] T084 [US2] Add DELETE /posts/{post_id} endpoint to src/api/v1/posts.py (Depends on get_current_user, call delete_post service, return 204 on success) per contracts/posts.yaml:201-222
- [ ] T085 [US2] Implement tag normalization utility in src/services/post_service.py (strip whitespace, lowercase) per data-model.md:209-211
- [ ] T086 [US2] Implement tag reuse logic in src/services/post_service.py (query existing tags by normalized name, create only if new) per spec.md:FR-013,FR-014

**Checkpoint**: Run `pytest tests/integration/test_post_crud.py tests/integration/test_post_authorization.py -v` - all US2 tests should PASS. At this point, User Stories 1 AND 2 both work independently: readers can browse, authors can create/manage posts.

---

## Phase 6: User Story 3 - Advanced Search and Discovery (Priority: P3)

**Goal**: Full-text search across posts, advanced filtering (status, tags, author), sorting, with pagination preserving query parameters

**Independent Test**: Create posts with varied content and tags, search for keyword, verify relevant results returned ranked by relevance, apply multiple filters simultaneously, verify sorting changes order

### Tests for User Story 3 (TDD: Write tests FIRST, ensure they FAIL before implementation)

- [ ] T087 [P] [US3] Create `blog_post_manager_app/tests/integration/test_search_filter.py` with test_search_posts_by_keyword (GET /api/v1/posts/search?q=fastapi returns posts containing 'fastapi' in title or content)
- [ ] T088 [P] [US3] Create test_search_posts_ranked_by_relevance in test_search_filter.py (search results ordered by ts_rank relevance score when sort_by=relevance)
- [ ] T089 [P] [US3] Create test_filter_posts_by_status_authenticated in test_search_filter.py (authenticated GET /posts/search?status=draft returns only own drafts, not other authors')
- [ ] T090 [P] [US3] Create test_filter_posts_by_author in test_search_filter.py (GET /posts/search?author_id=5 returns only posts by author 5)
- [ ] T091 [P] [US3] Create test_filter_posts_by_multiple_dimensions in test_search_filter.py (GET /posts/search?tags=python,fastapi&author_id=5 returns posts matching ALL criteria)
- [ ] T092 [P] [US3] Create test_sort_posts_by_publication_date_desc in test_search_filter.py (GET /posts/search?sort_by=publication_date_desc returns newest first)
- [ ] T093 [P] [US3] Create test_sort_posts_by_title_asc in test_search_filter.py (GET /posts/search?sort_by=title_asc returns alphabetical A-Z)
- [ ] T094 [P] [US3] Create test_search_pagination_preserves_params in test_search_filter.py (GET /posts/search?q=test&page=2 preserves 'q=test' in pagination)

### Implementation for User Story 3

- [ ] T095 [P] [US3] Create `blog_post_manager_app/src/schemas/search.py` with SearchResultsResponse, SearchResultItem Pydantic schemas per contracts/search.yaml:35-87
- [ ] T096 [US3] Create `blog_post_manager_app/src/services/search_service.py` with search_posts(db, query_string, filters, sort_by, page, page_size) function using PostgreSQL full-text search per data-model.md:433 and research.md section 5
- [ ] T097 [US3] Add build_search_query(query_string) function to src/services/search_service.py using plainto_tsquery and ts_rank for relevance scoring per research.md section 5 code examples
- [ ] T098 [US3] Add apply_filters(query, status, author_id, tag_ids, current_user) function to src/services/search_service.py enforcing authorization rules (own drafts only)
- [ ] T099 [US3] Add apply_sorting(query, sort_by) function to src/services/search_service.py supporting publication_date_desc/asc, title_asc/desc, relevance
- [ ] T100 [US3] Create `blog_post_manager_app/src/api/v1/search.py` router with GET /posts/search endpoint (query params: q, author_id, tags, status, sort_by, page, page_size) per contracts/search.yaml:7-77
- [ ] T101 [US3] Update src/api/v1/router.py to include search router

**Checkpoint**: Run `pytest tests/integration/test_search_filter.py -v` - all US3 tests should PASS. At this point, all three user stories (1, 2, 3) work independently: readers browse, authors manage, users search and filter.

---

## Phase 7: User Story 4 - Post Archival and Lifecycle (Priority: P4)

**Goal**: Authors can archive published posts (hidden from listings but accessible via direct URL), with ability to restore

**Independent Test**: Publish post, archive it, verify it disappears from public listings, verify direct URL access still works with archived indicator

### Tests for User Story 4 (TDD: Write tests FIRST, ensure they FAIL before implementation)

- [ ] T102 [P] [US4] Create test_archive_post in test_post_crud.py (authenticated PATCH /posts/{id} changing status to 'archived' succeeds for own post)
- [ ] T103 [P] [US4] Create test_archived_post_hidden_from_listings in test_post_crud.py (archived post does not appear in GET /posts public listing)
- [ ] T104 [P] [US4] Create test_archived_post_accessible_via_direct_url in test_post_crud.py (GET /posts/{archived_id} returns full content for unauthenticated user)
- [ ] T105 [P] [US4] Create test_filter_own_archived_posts in test_search_filter.py (authenticated GET /posts/search?status=archived returns own archived posts only)
- [ ] T106 [P] [US4] Create test_restore_archived_post in test_post_crud.py (PATCH /posts/{archived_id} changing status back to 'published' restores to public listings)

### Implementation for User Story 4

- [ ] T107 [US4] Update get_published_posts in src/services/post_service.py to exclude archived posts from listings (filter status != 'archived') per spec.md:US4 acceptance scenario 1
- [ ] T108 [US4] Update get_post_by_id in src/services/post_service.py to allow direct access to archived posts (no status filter on single post fetch) per spec.md:US4 acceptance scenario 2
- [ ] T109 [US4] Update apply_filters in src/services/search_service.py to support status='archived' filter for authenticated authors viewing own archived posts per spec.md:US4 acceptance scenario 3

**Checkpoint**: Run `pytest tests/integration/test_post_crud.py tests/integration/test_search_filter.py -v` - all US4 tests should PASS. All four user stories now work independently: archival lifecycle complete.

---

## Phase 8: Unit Tests (Test Coverage Requirements)

**Purpose**: Achieve 85% unit test coverage for business logic, models, and utilities

- [ ] T110 [P] Create `blog_post_manager_app/tests/unit/test_models.py` with tests for User model (relationship to posts, cascades)
- [ ] T111 [P] Add tests for Post model to test_models.py (status enum, check constraints, search_vector trigger validation)
- [ ] T112 [P] Add tests for Tag model to test_models.py (uniqueness constraint, normalization)
- [ ] T113 [P] Add tests for PostTag model to test_models.py (composite primary key, 10-tag limit trigger)
- [ ] T114 [P] Create `blog_post_manager_app/tests/unit/test_security.py` with tests for hash_password (bcrypt hashing) and verify_password functions
- [ ] T115 [P] Create `blog_post_manager_app/tests/unit/test_auth_service.py` with tests for create_access_token (15-min expiry), create_refresh_token (7-day expiry), decode_token
- [ ] T116 [P] Create `blog_post_manager_app/tests/unit/test_post_service.py` with tests for tag normalization (lowercase, trim), tag reuse logic, pagination helper
- [ ] T117 [P] Add tests for authorization logic in test_post_service.py (own posts editable, other posts forbidden)

---

## Phase 9: Contract Tests (OpenAPI Schema Validation)

**Purpose**: Validate all API responses match OpenAPI contracts

- [ ] T118 [P] Add test_auth_login_contract to test_openapi_compliance.py (validate POST /auth/login response against contracts/auth.yaml TokenResponse schema)
- [ ] T119 [P] Add test_posts_create_contract to test_openapi_compliance.py (validate POST /posts response against contracts/posts.yaml PostResponse schema)
- [ ] T120 [P] Add test_posts_get_detail_contract to test_openapi_compliance.py (validate GET /posts/{id} response against contracts/posts.yaml PostResponse schema)
- [ ] T121 [P] Add test_search_results_contract to test_openapi_compliance.py (validate GET /posts/search response against contracts/search.yaml SearchResultsResponse schema)
- [ ] T122 [P] Add test_tags_list_contract to test_openapi_compliance.py (validate GET /tags response against contracts/tags.yaml array of TagResponse)
- [ ] T123 [P] Create `blog_post_manager_app/tests/contract/test_response_schemas.py` with Pydantic schema validation tests for all error responses (401, 403, 404, 422, 500 match ErrorResponse schema)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T124 [P] Create `blog_post_manager_app/docker/Dockerfile` with multi-stage build (uv in builder, python:3.11-slim runtime, non-root user, <500MB target) per research.md section 7
- [ ] T125 [P] Create `blog_post_manager_app/docker/docker-compose.yml` with services: postgres (PostgreSQL 15), api (FastAPI app), adminer (optional DB UI) per quickstart.md
- [ ] T126 [P] Create `blog_post_manager_app/docker/.dockerignore` excluding .git, tests/, __pycache__, .env, alembic/versions/__pycache__
- [ ] T127 [P] Create `blog_post_manager_app/k8s/deployment.yaml` with replicas=3, resource limits (256Mi-512Mi memory, 250m-500m CPU), liveness/readiness probes to /health per research.md section 8
- [ ] T128 [P] Create `blog_post_manager_app/k8s/service.yaml` with ClusterIP service exposing port 8000
- [ ] T129 [P] Create `blog_post_manager_app/k8s/configmap.yaml` with non-sensitive config (LOG_LEVEL, ENVIRONMENT)
- [ ] T130 [P] Create `blog_post_manager_app/k8s/secrets.yaml.example` template for DATABASE_URL and JWT_SECRET_KEY (DO NOT commit actual secrets)
- [ ] T131 [P] Create `blog_post_manager_app/README.md` with project overview, quick start, API documentation links, testing instructions per quickstart.md structure
- [ ] T132 Add /health endpoint to src/main.py returning {"status": "healthy"} with 200 status per plan.md:34
- [ ] T133 Add /metrics endpoint to src/main.py exposing Prometheus metrics (request_count, request_duration) per research.md section 9
- [ ] T134 Configure CORS middleware in src/main.py with allowed origins from config per plan.md:140
- [ ] T135 Run full test suite with coverage: `pytest --cov=src --cov-report=term-missing --cov-fail-under=85` to verify coverage thresholds met
- [ ] T136 Validate quickstart.md: Follow setup instructions from scratch, verify all commands work, verify API accessible at http://localhost:8000/docs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **Authentication (Phase 3)**: Depends on Foundational completion - Required for US2, US3, US4 (not US1)
- **User Story 1 (Phase 4)**: Depends on Foundational completion - Can start after Phase 2 (Authentication not required for public reading)
- **User Story 2 (Phase 5)**: Depends on Foundational + Authentication (Phase 2 + Phase 3)
- **User Story 3 (Phase 6)**: Depends on Foundational + Authentication + US1 + US2 (needs data to search)
- **User Story 4 (Phase 7)**: Depends on US2 (archival is an extension of post management)
- **Unit Tests (Phase 8)**: Can run in parallel once code exists for each module
- **Contract Tests (Phase 9)**: Depends on integration tests passing (validates same endpoints)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP Ready
- **User Story 2 (P2)**: Requires Authentication (Phase 3) - Can start after Phase 3 completes
- **User Story 3 (P3)**: Logically depends on US1 and US2 for search data, but can technically start after Phase 3
- **User Story 4 (P4)**: Extends US2 post management - Should start after US2 completes

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel (different files)

**Phase 2 (Foundational)**:
- T010-T014 models can be created in parallel after T009
- T018-T020 utils can run in parallel
- T021-T026 services/middleware can run in parallel
- T027-T029 schemas can run in parallel
- T030-T039 API structure and test structure can run in parallel

**Phase 4 (US1 Tests)**:
- T049-T056 (all US1 tests) can run in parallel - different test files

**Phase 4 (US1 Implementation)**:
- T057, T058 schemas can run in parallel
- T065, T066 tags endpoints can be developed in parallel with posts endpoints T063-T064

**Phase 5 (US2 Tests)**:
- T069-T078 (all US2 tests) can run in parallel - different test files or test functions

**Phase 6 (US3 Tests)**:
- T087-T094 (all US3 tests) can run in parallel - different test files

**Phase 7 (US4 Tests)**:
- T102-T106 (all US4 tests) can run in parallel - different test files

**Phase 8 (Unit Tests)**:
- T110-T117 all unit tests can run in parallel - testing different modules

**Phase 9 (Contract Tests)**:
- T118-T123 all contract tests can run in parallel - validating different endpoints

**Phase 10 (Polish)**:
- T124-T131 deployment files can be created in parallel
- T132-T134 polish tasks affect same file (src/main.py) - must be sequential

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - these should FAIL initially):
Task T049: "test_list_published_posts_public in tests/integration/test_post_crud.py"
Task T050: "test_get_post_detail_public in tests/integration/test_post_crud.py"
Task T051: "test_get_draft_post_fails_public in tests/integration/test_post_crud.py"
Task T052: "test_posts_paginated_default in tests/integration/test_pagination.py"
Task T053: "test_posts_pagination_navigation in tests/integration/test_pagination.py"
Task T054: "test_filter_posts_by_tag in tests/integration/test_tag_management.py"
Task T055: "test_filter_posts_by_multiple_tags in tests/integration/test_tag_management.py"
Task T056: "test_posts_list_matches_contract in tests/contract/test_openapi_compliance.py"

# After tests fail, launch schema creation together (different files):
Task T057: "Create src/schemas/user.py"
Task T058: "Create src/schemas/tag.py"

# Then implement services and endpoints sequentially (dependencies)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T039) - CRITICAL foundation
3. Complete Phase 4: User Story 1 (T049-T068)
4. **STOP and VALIDATE**: Run US1 tests, seed sample data, test via Swagger UI at /docs
5. Deploy/demo if ready - **This is a viable MVP!** Readers can browse published posts

### Incremental Delivery

1. Complete Setup + Foundational (T001-T039) → Foundation ready
2. Complete Authentication (T040-T048) → Auth system ready
3. Add User Story 1 (T049-T068) → Test independently → Deploy/Demo (MVP!)
4. Add User Story 2 (T069-T086) → Test independently → Deploy/Demo
5. Add User Story 3 (T087-T101) → Test independently → Deploy/Demo
6. Add User Story 4 (T102-T109) → Test independently → Deploy/Demo
7. Complete Unit + Contract Tests (T110-T123) → Achieve coverage targets
8. Complete Polish (T124-T136) → Production ready
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T039)
2. Developer A: Authentication (T040-T048) - Required for US2+
3. Once Foundational is done:
   - Developer A: User Story 1 (T049-T068) - Can start immediately
   - Developer B: Wait for Authentication, then User Story 2 (T069-T086)
   - Developer C: Wait for Authentication, then User Story 3 (T087-T101)
4. Developer D: Unit Tests (T110-T117) in parallel with user story development
5. Developer E: Contract Tests (T118-T123) after integration tests pass
6. Developer F: Docker/K8s deployment files (T124-T130) in parallel with development

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability (US1, US2, US3, US4)
- Each user story should be independently completable and testable
- **TDD Workflow**: Write test → Run test (should FAIL) → Implement → Run test (should PASS) → Refactor → Repeat
- Verify tests fail before implementing (proves tests actually work)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Constitution Principle IV enforces TDD - tests are NON-NEGOTIABLE, not optional

## Task Count Summary

- **Total Tasks**: 136
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 34 tasks (T006-T039)
- **Phase 3 (Authentication)**: 9 tasks (T040-T048)
- **Phase 4 (User Story 1)**: 20 tasks (T049-T068)
- **Phase 5 (User Story 2)**: 18 tasks (T069-T086)
- **Phase 6 (User Story 3)**: 15 tasks (T087-T101)
- **Phase 7 (User Story 4)**: 8 tasks (T102-T109)
- **Phase 8 (Unit Tests)**: 8 tasks (T110-T117)
- **Phase 9 (Contract Tests)**: 6 tasks (T118-T123)
- **Phase 10 (Polish)**: 13 tasks (T124-T136)

**Parallel Opportunities**: 50+ tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1 + 2 + 4 = 59 tasks to achieve User Story 1 (Public Post Reading)
