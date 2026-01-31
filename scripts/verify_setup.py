
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from dotenv import load_dotenv
load_dotenv('backend/.env')

try:
    from app.storage.supabase_client import get_supabase
    client = get_supabase()
    print("✅ Supabase client initialized")
except Exception as e:
    print(f"❌ Supabase client failed: {e}")

try:
    from app.storage.supabase_store import SupabaseStorage
    store = SupabaseStorage()
    print("✅ SupabaseStorage class loaded")
except Exception as e:
    print(f"❌ SupabaseStorage failed: {e}")

try:
    from app.pipeline.orchestrator import PipelineOrchestrator
    # Just check class existence
    print("✅ PipelineOrchestrator loaded")
except Exception as e:
    print(f"❌ PipelineOrchestrator import failed: {e}")
