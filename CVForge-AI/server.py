import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate")
async def generate(request: Request):
    data = await request.json()
    model = data.get("model", "gemini-3.1-flash-lite")
    model_path = model if model.startswith("models/") else f"models/{model}"
    url = f"https://generativelanguage.googleapis.com/v1/{model_path}:generateContent?key={data['key']}"
    
    async with httpx.AsyncClient() as client:
        # Retry logic: spróbuj 3 razy w razie błędu 503
        for attempt in range(3):
            res = await client.post(url, json=data["payload"], timeout=60.0)
            if res.status_code == 200:
                return res.json()
            elif res.status_code == 503 and attempt < 2:
                await asyncio.sleep(2) # czekaj 2 sekundy przed ponowieniem
                continue
            else:
                raise HTTPException(status_code=res.status_code, detail=res.tex)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9999)