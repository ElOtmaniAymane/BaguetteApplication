from datetime import timedelta, datetime as nowdate
import time
from guests import delete

from config import db, app
from models import GuestUser
minuteSession = 30
def delete_expired_guest_users():
    with app.app_context():
        print( nowdate.utcnow())
        print("deleted dd")
        expired_time = nowdate.utcnow() - timedelta(minutes=30)
        expired_guest_users = GuestUser.query.filter(GuestUser.time < expired_time).all()
        for guest_user in expired_guest_users:
            delete(guest_user.id)
            db.session.delete(guest_user)
        db.session.commit()

while True:
    delete_expired_guest_users()
    time.sleep(minuteSession* 60)  # Sleep for 30 minutes
