from datetime import timedelta, datetime as nowdate

from flask import abort, make_response, request, session
from sqlalchemy.sql import func
from sqlalchemy import select, text

from models import guest_user_schema, GuestUserSchema, GuestUser, guest_users_schema
from config import db, ma, app
from nodes import delete_all

def read_all():
    guests = GuestUser.query.all()
    return guest_users_schema.dump(guests)
# @app.route('/guestuser', methods=['POST'])
def create():
    with db.session.begin_nested():
        # Acquire lock on the GuestUser table
        # db.session.execute(text('LOCK TABLE guestusers IN EXCLUSIVE MODE'))

        # Check if there's any guest user with id >= 100001
        guest_user = GuestUser.query.filter(GuestUser.id >= 100001).order_by(GuestUser.id).first()
        new_id=0
        if guest_user:
            ids = [g.id for g in GuestUser.query.order_by(GuestUser.id).all()]
            new_id = next(i for i in range(100001, max(ids) + 2) if i not in ids)
            # If a guest user found, create a new guest user with id = guest_user.id + 1
            new_guest_user = GuestUser(id=new_id, time=func.now())
        else:
            # If no guest user found, create a new guest user with id = 100001
            new_guest_user = GuestUser(id=100001, time=func.now())
            new_id=100001
        
        db.session.add(new_guest_user)
    db.session.commit()
    guest_user_data = guest_user_schema.dump(new_guest_user)
    guest_user_data['new_id'] = new_id
    session["guest_id"] = new_id
    response = make_response(guest_user_data, 201)
    return response
# def create():
#     new_guest_user = guest_user_schema(id=request.json['id'])
#     db.session.add(new_guest_user)
#     db.session.commit()
#     return guest_user_schema.dump(new_guest_user)

# @app.route('/guestuser/<id>', methods=['DELETE'])
def delete(guest_id):
    with app.test_request_context():  # Crée un contexte de requête temporaire
        existing_guest = GuestUser.query.get(guest_id)
        if existing_guest:
            delete_all(guest_id)
            session.pop("guest_id", None)
            db.session.delete(existing_guest)
            db.session.commit()
            return make_response(f"{guest_id} successfully deleted", 200)
        else:
            abort(
                404,
                f"Guest with  id {guest_id} not found"
            )

# @app.route('/guestuser/<id>', methods=['PATCH'])
def update(guest_id):
    existing_guest = GuestUser.query.get(guest_id)
    if existing_guest:
        existing_guest.time=func.now()
        db.session.commit()
        response = make_response(guest_user_schema.dump(existing_guest), 200)
        return response
    else:
        abort(
            404,
            f"Guest with  id {guest_id} not found"
        )



