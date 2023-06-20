from flask import abort, make_response
from config import db
from models import Node, node_schema, nodes_schema, Edge

def read_all():
    nodes = Node.query.all()
    return nodes_schema.dump(nodes)

def create(node):
    # Get the lowest unused ID
    ids = [node.node_id for node in Node.query.order_by(Node.node_id).all()]
    new_id = next(i for i in range(1, max(ids) + 2) if i not in ids)
    
    node["node_id"] = new_id  # Assuming `node` is a dict

    new_node = node_schema.load(node, session=db.session)
    db.session.add(new_node)
    db.session.commit()
    return node_schema.dump(new_node), 201

# def create(node):
#     new_node = node_schema.load(node, session=db.session)
#     db.session.add(new_node)
#     db.session.commit()
#     return node_schema.dump(new_node), 201



def read_one(node_id):
    node = Node.query.get(node_id)
    if node is not None:
        return node_schema.dump(node)

    else:
        abort(
            404, f"Node with node_id {node_id} not found"
        )

def update(node_id, node):
    existing_node = Node.query.get(node_id)

    if existing_node:
        update_node = node_schema.load(node, session=db.session)
        existing_node.node_name = update_node.node_name
        existing_node.node_type = update_node.node_type
        existing_node.color = update_node.color

        db.session.merge(existing_node)
        db.session.commit()
        return node_schema.dump(existing_node), 201

    else:
        abort(
            404,
            f"Node with  node_id {node_id} not found"
        )

def delete(node_id):
    existing_node = Node.query.get(node_id)

    if existing_node:
        # delete associated edges
        Edge.query.filter((Edge.source_node_id == node_id) | (Edge.target_node_id == node_id)).delete()

        db.session.delete(existing_node)
        db.session.commit()
        return make_response(f"{node_id} successfully deleted", 200)
        
    else:
        abort(
            404,
            f"Node with  node_id {node_id} not found"
        )
def delete_all(user_id):
    # Find all nodes associated with the given user_id
    nodes = Node.query.filter_by(user_id=user_id).all()

    if nodes:
        for node in nodes:
            # Delete associated edges for each node
            Edge.query.filter((Edge.source_node_id == node.node_id) | (Edge.target_node_id == node.node_id)).delete()
            
            # Delete the node
            db.session.delete(node)
        
        db.session.commit()
        return make_response(f"All nodes and associated edges for user_id {user_id} successfully deleted", 200)

    else:
        return make_response(f"no nodes found ", 200)

