from fastapi import FastAPI
from app.api.endpoints import router
from app.mcp.ifc_mcp import mcp
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Deliverable OPS API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

app.mount("/mcp", mcp.streamable_http_app())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
