# models.py

import atexit
from datetime import datetime, timedelta
from marshmallow_sqlalchemy import fields
from marshmallow import fields as fd
from apscheduler.schedulers.background import BackgroundScheduler

from config import db, ma
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(64), unique=True, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
class GuestUser(db.Model):
    __tablename__ = 'guestusers'

    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class GuestUserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = GuestUser
        load_instance = True
        sqla_session = db.session

class Edge(db.Model):
    __tablename__ = "edge"

    edge_id = db.Column(db.Integer, primary_key=True)
    source_node_id = db.Column(db.Integer, db.ForeignKey("nodes.node_id", ondelete="CASCADE"))
    target_node_id = db.Column(db.Integer, db.ForeignKey("nodes.node_id", ondelete="CASCADE"))
    edge_type = db.Column(db.String(999))
    arrow = db.Column(db.Integer, default=0)  # 0 for edges, 1 for arrows
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))


class EdgeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Edge
        load_instance = True
        sqla_session = db.session
        include_fk = True

class Node(db.Model):
    __tablename__ = "nodes"
    
    node_id = db.Column(db.Integer, primary_key=True)
    node_name = db.Column(db.String(32), nullable=False)
    node_type = db.Column(db.String(32))
    color = db.Column(db.String(32))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    outgoing_edges = db.relationship(
        "Edge",
        backref="source_node",
        foreign_keys="[Edge.source_node_id]",

    )

    incoming_edges = db.relationship(
        "Edge",
        backref="target_node",
        foreign_keys="[Edge.target_node_id]",

    )
class NodeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Node
        load_instance = True
        sqla_session = db.session
        include_relationships = True
    outgoing_edges = fields.Nested(EdgeSchema, many=True)
    incoming_edges = fields.Nested(EdgeSchema, many=True)
    user_id = fd.Integer()

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        sqla_session = db.session
        exclude = ("password_hash",)
    password = fd.Str(load_only=True)


user_schema = UserSchema()
users_schema = UserSchema(many=True)

edge_schema = EdgeSchema()

node_schema = NodeSchema()
nodes_schema = NodeSchema(many=True)

guest_user_schema = GuestUserSchema()
guest_users_schema = GuestUserSchema(many=True)

