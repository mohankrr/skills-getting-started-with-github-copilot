import pytest
from httpx import AsyncClient, ASGITransport
from fastapi import status
from src.app import app, activities

@pytest.fixture(autouse=True)
def reset_activities():
    # Arrange: Reset the in-memory activities before each test
    original = {k: dict(v) for k, v in activities.items()}
    for k, v in activities.items():
        v['participants'] = list(original[k]['participants'])
    yield
    # Optionally, reset again after test if needed

@pytest.mark.asyncio
async def test_list_activities():
    # Arrange
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.get("/activities")
    # Assert
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

@pytest.mark.asyncio
async def test_signup_success():
    # Arrange
    test_email = "newstudent@mergington.edu"
    activity = "Chess Club"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.post(f"/activities/{activity}/signup?email={test_email}")
    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert test_email in activities[activity]["participants"]

@pytest.mark.asyncio
async def test_signup_duplicate():
    # Arrange
    activity = "Chess Club"
    email = activities[activity]["participants"][0]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already signed up" in response.json()["detail"]

@pytest.mark.asyncio
async def test_signup_nonexistent_activity():
    # Arrange
    activity = "Nonexistent Club"
    email = "someone@mergington.edu"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Activity not found" in response.json()["detail"]

@pytest.mark.asyncio
async def test_remove_participant_success():
    # Arrange
    activity = "Chess Club"
    email = activities[activity]["participants"][0]
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.delete(f"/activities/{activity}/participant?email={email}")
    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert email not in activities[activity]["participants"]

@pytest.mark.asyncio
async def test_remove_nonexistent_participant():
    # Arrange
    activity = "Chess Club"
    email = "notfound@mergington.edu"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.delete(f"/activities/{activity}/participant?email={email}")
    # Assert
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Participant not found" in response.json()["detail"]

@pytest.mark.asyncio
async def test_remove_participant_nonexistent_activity():
    # Arrange
    activity = "Nonexistent Club"
    email = "someone@mergington.edu"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Act
        response = await ac.delete(f"/activities/{activity}/participant?email={email}")
    # Assert
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "Activity not found" in response.json()["detail"]
