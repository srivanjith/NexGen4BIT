import os
import sys

# Ensure backend root directory is in python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.main import app
