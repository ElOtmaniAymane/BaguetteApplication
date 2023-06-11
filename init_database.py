# build_database.py

from sqlalchemy.exc import OperationalError

from config import app, db
from models import Node, Edge, User

NODE_EDGES = [
    {
        "node_name": "Node 1",
        "node_type": "File",
        "outgoing_edges": [
            ("1", "2", "typeEdge1", 0),
            ("1", "3", "typeEdge2", 0),
        ],
    },
    {
        "node_name": "Node 2",
        "node_type": "Processus",
        "outgoing_edges": [
            ("2", "3", "typeEdge3", 1),
        ],
        "incoming_edges": []
    },
    {
        "node_name": "Node 3",
        "node_type": "Registry",
        "outgoing_edges": [

        ],
        "incoming_edges": []
    },
]


def get_data_from_table(model):
    try:
        data = db.session.query(model).all()
        db.session.close()
        return data
    except OperationalError:
        return []


def create_database(db):
    db.create_all()
    # Create initial users
    user1 = User(username="user5", email="user5@example.com")
    user1.set_password("password")
    user2 = User(username="user6", email="user6@example.com")
    user2.set_password("password")
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()
    # Create nodes and edges with user associations
    for data in NODE_EDGES:
        new_node = Node(node_name=data.get("node_name"), node_type=data.get("node_type"), user_id=user1.user_id)
        for source, target, edgeType, arrow in data.get("outgoing_edges", []):
            new_node.outgoing_edges.append(
                Edge(
                    source_node_id=source,
                    target_node_id=target,
                    edge_type=edgeType,
                    arrow=arrow,
                    user_id=user1.user_id
                )
            )
        for source, target, edgeType, arrow in data.get("incoming_edges", []):
            new_node.incoming_edges.append(
                Edge(
                    source_node_id=source,
                    target_node_id=target,
                    edge_type=edgeType,
                    arrow=arrow,
                    user_id=user1.user_id
                )
            )
        db.session.add(new_node)
    db.session.commit()
    print("Created new database")

def update_database(db, existing_nodes, existing_edges):
    db.drop_all()
    db.create_all()
    for node in existing_nodes:
        db.session.merge(node)
    for edge in existing_edges:
        db.session.merge(edge)
    db.session.commit()
    print("Updated existing database")


with app.app_context():
    # existing_nodes = get_data_from_table(Node)
    # existing_edges = get_data_from_table(Edge)

    # if not existing_nodes:
    create_database(db)
    # else:
    #     update_database(db, existing_nodes, existing_edges)
