import os
import sys

# Alias train.py to train_model.py
# pyrefly: ignore [missing-import]
from train_model import train_ml_models

if __name__ == "__main__":
    result = train_ml_models()
    import json
    print(json.dumps(result, indent=2))
