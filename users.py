#users.py

from flask import abort, jsonify
from config import db

from models import User, user_schema

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

