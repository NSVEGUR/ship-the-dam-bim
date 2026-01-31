## Setup & Run

1.  **Initialize Environment**:
    Inside `backend/`:

    ```bash
    uv sync
    ```

    Inside `frontend/`:

    ```bash
    pnpm install
    ```

2.  **Start Backend**:

    ```bash
    uv run uvicorn main:app --reload
    ```

    The API will run at `http://localhost:8000`.

3.  **Start Frontend**:

    ```bash
    pnpm dev
    ```

    The APP will run at `http://localhost:3000`.
