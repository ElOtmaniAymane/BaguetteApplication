# app.py
import subprocess
from flask import json, jsonify, request
from flask import render_template # Remove: import Flask
import config
from config import db
from flask import session, redirect, url_for
from users import login
from shared import type_color_json, arrow_data, edge_data
from models import Edge, edge_schema, Node, node_schema, nodes_schema
app = config.connex_app

app.add_api(config.basedir / "swagger.yml")

    

# After user login or registration
@app.route("/api/login", methods=["POST"])
def api_login():
    username = request.json.get('username')
    password = request.json.get('password')

    if username is None or password is None:
        return jsonify({'error': 'Missing username or password'}), 400
    user = {'username': username, 'password': password}

    
    result = login(user)

    if result.status_code == 200: 
        session["user_id"] = result.json["user_id"]
        
        # Get nodes of the user
        nodes = Node.query.filter_by(user_id=session["user_id"]).all()
        nodes_data = nodes_schema.dump(nodes)
        
        return jsonify({'result': 'success', 'username': username, 'user_id': session["user_id"], 'nodes': nodes_data}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401


@app.route("/logout")
def logout():
    # remove the user_id from session if it's there
    session.pop("user_id", None)
    return redirect(url_for("home"))




@app.route("/")
def home():
    
    # Only get nodes of the logged in user
    if "user_id" in session:
        nodes = Node.query.filter_by(user_id=session["user_id"]).all()
        nodes_data = nodes_schema.dump(nodes)
    elif "guest_id" in session:
        print("foulane")
        nodes = Node.query.filter_by(user_id=session["guest_id"]).all()
        nodes_data = nodes_schema.dump(nodes)
    else:
        nodes_data = []
    return render_template("home.html", nodes=nodes_data, type_color_json=type_color_json
                           , arrow_data=json.dumps(arrow_data), edge_data=json.dumps(edge_data))
if __name__ == "__main__":
    subprocess.Popen(['python', 'scheduler.py'])
    app.run(host="0.0.0.0", port=8001, debug=True)




# /!\ IMPORTANT /!\ : Shut down the scheduler when exiting the app
# atexit.register(lambda: scheduler.shutdown())