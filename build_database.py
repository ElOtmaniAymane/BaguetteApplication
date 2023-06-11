# build_database.py

from config import app, db
from models import Node, Edge

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

with app.app_context():
    db.drop_all()
    db.create_all()
    for data in NODE_EDGES:
        new_node = Node(node_name=data.get("node_name"), node_type=data.get("node_type"))
        for source, target, edgeType, arrow in data.get("outgoing_edges", []):
            new_node.outgoing_edges.append(
                Edge(
                    source_node_id=source,
                    target_node_id=target,
                    edge_type=edgeType,
                    arrow=arrow
                )
            )
        for source, target, edgeType, arrow in data.get("incoming_edges", []):
            new_node.incoming_edges.append(
                Edge(
                    source_node_id=source,
                    target_node_id=target,
                    edge_type=edgeType,
                    arrow=arrow
                )
            )
        db.session.add(new_node)
    db.session.commit()
