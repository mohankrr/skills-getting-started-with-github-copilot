Plan: Add FastAPI Backend Tests (AAA Pattern, pytest)

What/Why/How:  
- Add a `tests/` directory with `test_app.py` using pytest and httpx.
- Each test uses the Arrange-Act-Assert (AAA) pattern.
- Add `pytest`, `pytest-asyncio`, and use `httpx.ASGITransport` for async FastAPI testing.

Steps
1. Create `tests/` directory at the project root.
2. Add `test_app.py` with AAA-structured tests for:
   - Listing activities (GET)
   - Signing up (POST)
   - Duplicate signup (POST, expect error)
   - Removing participant (DELETE)
   - Removing non-existent participant (DELETE, expect error)
   - Non-existent activity (POST/DELETE, expect error)
3. Add `pytest` and `pytest-asyncio` to `requirements.txt` if not present.
4. Use `httpx.AsyncClient(transport=ASGITransport(app=app), base_url=...)` for all async FastAPI tests.
5. (Optional) Add a fixture to reset in-memory data between tests for isolation.
6. Verify by running `pytest` and ensuring all tests pass.

Relevant files
- `tests/test_app.py` — new test file for FastAPI backend
- `requirements.txt` — add `pytest`, `pytest-asyncio`

Verification
- Run `pytest tests/ --maxfail=1 --disable-warnings -v` in the project root and confirm all tests pass.

Decisions
- Use real in-memory data for now; can add fixtures for isolation if needed.
- All tests follow the AAA pattern for clarity.
- Use `pytest.mark.asyncio` for async test functions.
- Use `ASGITransport` with `httpx.AsyncClient` for FastAPI app testing.
