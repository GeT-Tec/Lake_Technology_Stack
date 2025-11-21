import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI()

DB_NAME = "licenses.db"

class LicenseCheck(BaseModel):
    api_key: str

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            plan TEXT NOT NULL
        )
    ''')
    
    # Check if master key exists
    master_key = "LAKE-GOLD-LICENSE-2025"
    cursor.execute('SELECT * FROM licenses WHERE key = ?', (master_key,))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO licenses (key, plan) VALUES (?, ?)', (master_key, "enterprise"))
        print(f"Seeded master key: {master_key}")
    
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/validate-license")
async def validate_license(license_check: LicenseCheck):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM licenses WHERE key = ?', (license_check.api_key,))
    license_data = cursor.fetchone()
    
    conn.close()
    
    if license_data:
        return {"authorized": True, "plan": license_data["plan"]}
    else:
        # Return authorized: False instead of 401/403 to match requirement "authorized: bool" in JSON response
        # Adjusting to typical API pattern where invalid key might just return authorized=False
        # But let's stick to the requested return format strictly.
        return {"authorized": False, "plan": "none"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
