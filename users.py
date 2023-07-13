#users.py

from flask import abort, json, jsonify
from config import db, app
from models import Edge, Node, User, user_schema, node_schema, edge_schema
from baguette.croutons.metalib.utils import import_env, entries, save, load
from baguette.croutons.source.metagraph import MetaGraph, MetaArrow, MetaEdge, MetaVertex
import requests
from shared import type_dictionary, arrow_dictionary, edge_dictionary
import baguette

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

def convertToMetaGraph(user_id):
    with app.app_context():    # get the user_id from session

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
        json_data = result.get_data(as_text=True)  # Obtient les données JSON sous forme de chaîne
        url = 'http://localhost:7098/convert'
        response = requests.post(url, json=prepared_nodes)
        
        return response.json()




# digit_mapping = {
#         "0": "zero",
#         "1": "one",
#         "2": "two",
#         "3": "three",
#         "4": "four",
#         "5": "five",
#         "6": "six",
#         "7": "seven",
#         "8": "eight",
#         "9": "nine"
#     }

# def convert_number_to_words(number, prefix):    
#     return prefix + "".join(digit_mapping.get(digit, digit) for digit in str(number))
# def create_metagraph(user_id):
#     with app.app_context():
#         MG = MetaGraph()  # Crée un MetaGraph vide
#         nodes = Node.query.filter_by(user_id=user_id).order_by(Node.node_id).all()
#         edges = Edge.query.filter_by(user_id=user_id).all()

#         # Initialize schemas
        

#         # Create a dict to map old node_id to new node_id
#         node_id_mapping = {node.node_id: i+1 for i, node in enumerate(nodes)}
#         edge_id_mapping = {edge.edge_id: i+1 for i, edge in enumerate(edges)}

#         # Prepare nodes and edges
#         prepared_nodes = []
#         prepared_edges = []

#         for node in nodes:
#             prepared_node = node_schema.dump(node)
#             prepared_node["node_id"] = node_id_mapping[node.node_id]
#             prepared_node.pop("user_id", None)
#             prepared_node.pop("incoming_edges", None)
#             prepared_node.pop("color", None)

#             prepared_node["outgoing_edges"] = []
            
#             prepared_nodes.append(prepared_node)

#         for edge in edges:
#             prepared_edge = edge_schema.dump(edge)
#             prepared_edge["edge_id"] = edge_id_mapping[edge.edge_id]
#             prepared_edge["source_node_id"] = node_id_mapping[edge.source_node_id]
#             prepared_edge["target_node_id"] = node_id_mapping[edge.target_node_id]
#             prepared_edge.pop("user_id", None)
            
#             # Add edge to corresponding node
#             for node in prepared_nodes:
#                 if node["node_id"] == prepared_edge["source_node_id"]:
#                     node["outgoing_edges"].append(prepared_edge)
#                     break

#         # Convert data to json
#         result = jsonify(prepared_nodes)

#         data = json.loads(result.data)
#         with MG:
#             d = [ MetaVertex[type_dictionary[so["node_type"]]] for so in data]
#             print(d)
#         # for node in data:
#         #     node_id = node["node_id"]
#         #     node_type = node["node_type"]
#         #     node_name = convert_number_to_words(node["node_id"], "")
            
#         #     # Crée un nouveau vertex avec le type de nœud correspondant au dictionnaire
#         #     MG.node_name = MetaVertex[type_dictionary[node_type]]
#             for node in data:
#                 outgoing_edges = node.get("outgoing_edges", [])
#                 for edge in outgoing_edges:
#                     arrow = edge["arrow"]
#                     edge_id = edge["edge_id"]
#                     edge_type = edge["edge_type"]
#                     source_node_id = edge["source_node_id"]
#                     target_node_id = edge["target_node_id"]

#                     # Séparer les chaînes de caractères par le caractère "|"
#                     edge_type_list = edge_type.split(" | ")

#                     if arrow == 0:
#                         # Créer une liste de MetaEdge pour chaque type
#                         meta_edges = [MetaEdge(d[source_node_id - 1], d[target_node_id - 1])[edge_dictionary[et]] for et in edge_type_list]
#                     else:
#                         # Créer une liste de MetaArrow pour chaque type
#                         meta_edges = [MetaArrow(d[source_node_id - 1], d[target_node_id - 1])[arrow_dictionary[et]] for et in edge_type_list]

#         return MG


# Metag = convertToMetaGraph(3)
# print(Metag)

