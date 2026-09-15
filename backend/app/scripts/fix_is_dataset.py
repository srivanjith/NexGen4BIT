import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database.mongodb import get_collection, connect_to_mongo

def fix_dataset_flags():
    connect_to_mongo()
    col = get_collection("documents")
    if col is None:
        print("DB disconnected")
        return

    # Set isDataset: False for all non-dataset documents
    res1 = col.update_many({"isDataset": None}, {"$set": {"isDataset": False}})
    res2 = col.update_many({"isDataset": {"$exists": False}}, {"$set": {"isDataset": False}})
    
    cnt_user = col.count_documents({"isDataset": False})
    cnt_data = col.count_documents({"isDataset": True})
    
    print(f"Update finished! User documents count (isDataset=False): {cnt_user}, Dataset documents count (isDataset=True): {cnt_data}")

if __name__ == "__main__":
    fix_dataset_flags()
