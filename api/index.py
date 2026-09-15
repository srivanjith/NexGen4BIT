import os
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
