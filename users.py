#users.py

from flask import abort, jsonify
from config import db

from models import Edge, Node, User, user_schema, node_schema, edge_schema

def login(user):
    existing_user = User.query.filter_by(username=user.get('username')).first()

    if existing_user and existing_user.check_password(user.get('password')):
        # User authenticated
        # If you decide to use JWT, you would return a JWT access token here
        # For now, let's return the user's information as a JSON object
        return jsonify({
            "user_id": existing_user.user_id,
            "username": existing_user.username,
            # Don't send back the password
            "email": existing_user.email,
        })
    else:
        abort(
            404,
            f"Invalid username or password"
        )

def register(user):
    new_user = user_schema.load(user, session=db.session)
    new_user.set_password(user['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'result': 'success', 'user': user_schema.dump(new_user)}), 201

def export(user_id):
    # get the user_id from session

    # Get nodes and edges from database
    nodes = Node.query.filter_by(user_id=user_id).order_by(Node.node_id).all()
    edges = Edge.query.filter_by(user_id=user_id).all()

    # Initialize schemas
    

    # Create a dict to map old node_id to new node_id
    node_id_mapping = {node.node_id: i+1 for i, node in enumerate(nodes)}
    edge_id_mapping = {edge.edge_id: i+1 for i, edge in enumerate(edges)}

    # Prepare nodes and edges
    prepared_nodes = []
    prepared_edges = []

    for node in nodes:
        prepared_node = node_schema.dump(node)
        prepared_node["node_id"] = node_id_mapping[node.node_id]
        prepared_node.pop("user_id", None)
        prepared_node.pop("incoming_edges", None)
        prepared_node.pop("color", None)

        prepared_node["outgoing_edges"] = []
        
        prepared_nodes.append(prepared_node)

    for edge in edges:
        prepared_edge = edge_schema.dump(edge)
        prepared_edge["edge_id"] = edge_id_mapping[edge.edge_id]
        prepared_edge["source_node_id"] = node_id_mapping[edge.source_node_id]
        prepared_edge["target_node_id"] = node_id_mapping[edge.target_node_id]
        prepared_edge.pop("user_id", None)
        
        # Add edge to corresponding node
        for node in prepared_nodes:
            if node["node_id"] == prepared_edge["source_node_id"]:
                node["outgoing_edges"].append(prepared_edge)
                break

    # Convert data to json
    result = jsonify(prepared_nodes)

    return result

