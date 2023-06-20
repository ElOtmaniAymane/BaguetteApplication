# build_database.py

from sqlalchemy.exc import OperationalError

from config import app, db
from models import Node, Edge, User

with app.app_context():
    db.create_all()