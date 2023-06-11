# edges.py

from flask import abort, make_response

from config import db
from models import Edge, edge_schema, Node

def read_one(edge_id):
    edge = Edge.query.get(edge_id)

    if edge is not None:
        return edge_schema.dump(edge)
    else:
        abort(
            404, f"Edge with ID {edge_id} not found"
        )


def update(edge_id, edge):
    existing_edge = Edge.query.get(edge_id)

    if existing_edge:
        update_edge = edge_schema.load(edge, session=db.session)
        existing_edge.arrow = update_edge.arrow
        existing_edge.edge_type = update_edge.edge_type
        existing_edge.source_node_id = update_edge.source_node_id
        existing_edge.target_node_id = update_edge.target_node_id

        db.session.merge(existing_edge)
        db.session.commit()
        return edge_schema.dump(existing_edge), 201
    else:
        abort(404, f"Edge with ID {edge_id} not found")

def delete(edge_id):
    existing_edge = Edge.query.get(edge_id)

    if existing_edge:
        db.session.delete(existing_edge)
        db.session.commit()
        return make_response(f"{edge_id} successfully deleted", 204)
    else:
        abort(404, f"Edge with ID {edge_id} not found")

def create(edge):
    source_node_id = edge.get("source_node_id")
    source_node = Node.query.get(source_node_id)
    target_node_id = edge.get("target_node_id")
    target_node = Node.query.get(target_node_id)

    if source_node and target_node:
        new_edge = edge_schema.load(edge, session=db.session)
        source_node.outgoing_edges.append(new_edge)
        target_node.incoming_edges.append(new_edge)

        db.session.commit()
        return edge_schema.dump(new_edge), 201
    else:
        abort(
            404,
            f"node not found for ID"
        )