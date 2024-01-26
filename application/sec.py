from flask_security import SQLAlchemyUserDatastore
from .models import User, Role, db

datastore = SQLAlchemyUserDatastore(db, User, Role)