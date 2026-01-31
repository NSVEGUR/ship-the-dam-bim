
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

_supabase: Client = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in Environment")
        _supabase = create_client(url, key)
    return _supabase
