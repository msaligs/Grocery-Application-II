from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.schema import UniqueConstraint
from sqlalchemy import Enum
from flask_security import  UserMixin , RoleMixin


db = SQLAlchemy()



class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(20), nullable=False, unique=True)
    mobile = db.Column(db.Integer, unique=True)
    address = db.Column(db.String(50))
    city = db.Column(db.String(20))
    state = db.Column(db.String(15))
    pin = db.Column(db.Integer)
    active = db.Column(db.Boolean(), default=True)                             
    fs_uniquifier = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', secondary="roles_users",backref="users")

    __table_args__ = (
        db.Index('idx_user_username', username),
        db.Index('idx_user_email', email)
    )

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    description = db.Column(db.String(255))


class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    active = db.Column(db.Boolean(), default=False)     # for the suitation where 
    image_url = db.Column(db.String(), unique=True)
    
    products = db.relationship('Product', backref='section', cascade='all, delete-orphan')
    change_requests = db.relationship('ChangeRequestSection', backref='section')


    
class ChangeRequestSection(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    request_type= db.Column(Enum('New', 'Update', 'Delete'))
    section_id = db.Column(db.Integer, db.ForeignKey("section.id"))

    name = db.Column(db.String(100))
    image_url = db.Column(db.String(), unique=True)

    manager_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)    
    reason=db.Column(db.String(400))
    status = db.Column(Enum('Pending', 'Approved', 'Rejected'), default='Pending')
    
    manager = db.relationship('User',backref='changerequestsection')

    __table_args__ = (UniqueConstraint('request_type', 'section_id', name='section_id_request_type_combo'),)



class Product(db.Model):
    id = db.Column(db.Integer,primary_key = True, autoincrement = True)
    name = db.Column(db.String(100),nullable = False)
    brand = db.Column(db.String(100),nullable = False)
    manufacturing_date = db.Column(db.Date(), nullable = False)
    expiry_date = db.Column(db.Date(), nullable = False)
    price = db.Column(db.Float(),nullable = False)
    stock = db.Column(db.Integer,nullable = False)
    active = db.Column(db.Boolean(), default=False)
    image_url = db.Column(db.String(), unique=True)
    manager_id= db.Column(db.Integer, db.ForeignKey("user.id"),nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey("section.id", ondelete="CASCADE"), nullable=False)

    manager = db.relationship('User',backref='products')
    




class Cart(db.Model):
    id = db.Column(db.Integer(),primary_key = True)
    user_id = db.Column(db.Integer(),db.ForeignKey("user.id"), nullable = False)
    product_id = db.Column(db.Integer,db.ForeignKey("product.id"),nullable = False)
    quantity = db.Column(db.Integer,nullable = False, default = 1)

    __table_args__ = (UniqueConstraint('user_id', 'product_id', name='user_product_combo'),)


class Order(db.Model):
    id = db.Column(db.Integer,primary_key = True, autoincrement = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    order_date = db.Column(db.DateTime(), nullable = False)
    total_amount = db.Column(db.Float(),nullable = False)
    
    user = db.relationship('User',backref='order')


class Order_item(db.Model):
    id = db.Column(db.Integer,primary_key = True, autoincrement = True)
    product_id = db.Column(db.Integer,db.ForeignKey("product.id"))
    prod_name = db.Column(db.String(100),nullable = False)
    brand = db.Column(db.String(100),nullable = False)
    manufacturing_date = db.Column(db.Date(), nullable = False)
    expiry_date = db.Column(db.Date(), nullable = False)
    price = db.Column(db.Float(),nullable = False)
    quantity = db.Column(db.Integer,nullable = False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    
    Order = db.relationship('Order',backref='order_items')