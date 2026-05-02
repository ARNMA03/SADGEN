import os
from sqlalchemy import create_engine, MetaData
from config import settings

def reset_render_db():
    print(f"Connecting to: {settings.DATABASE_URL}")
    confirm = input("\n⚠️ This will DELETE ALL DATA in the database. Type 'SADGEN' to confirm: ")
    
    if confirm != "SADGEN":
        print("Reset cancelled.")
        return

    engine = create_engine(settings.DATABASE_URL)
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    print("Dropping all tables...")
    metadata.drop_all(bind=engine)
    print("✅ Database is now empty.")
    print("\nNext Steps:")
    print("1. Push your code to Render.")
    print("2. Render will automatically recreate the tables and run the new seed.py.")

if __name__ == "__main__":
    reset_render_db()
