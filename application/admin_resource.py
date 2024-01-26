from flask_restful import Resource, Api, reqparse, fields,marshal_with,marshal
from .models import *
from datetime import datetime
from flask_security import auth_required, roles_required, current_user
from werkzeug.security import generate_password_hash
# from main import app


api= Api(prefix='/api')


user_parser = reqparse.RequestParser()
user_parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
user_parser.add_argument('username', type=str, required=True, help='Username cannot be blank', location='json')
user_parser.add_argument('password', type=str, required=True, help='Password cannot be blank', location='json')
user_parser.add_argument('email', type=str, required=True, help='Email cannot be blank', location='json')
user_parser.add_argument('mobile', type=int, required=True, help='Mobile cannot be blank', location='json')
user_parser.add_argument('address', type=str, required=True, help='Address cannot be blank', location='json')
user_parser.add_argument('city', type=str, required=True, help='City cannot be blank', location='json')
user_parser.add_argument('state', type=str, required=True, help='State cannot be blank', location='json')
user_parser.add_argument('pin', type=int, required=True, help='Pin cannot be blank', location='json')
user_parser.add_argument('role', type=str, required=True, help='Role ID cannot be blank', location='json')


user_update_parser = reqparse.RequestParser()
user_update_parser.add_argument('name', type=str, help='Name cannot be blank')
user_update_parser.add_argument('mobile', type=int, help='Mobile cannot be blank', location='json')
user_update_parser.add_argument('address', type=str, help='Address cannot be blank', location='json')
user_update_parser.add_argument('city', type=str,help='City cannot be blank', location='json')
user_update_parser.add_argument('state', type=str, help='State cannot be blank', location='json')
user_update_parser.add_argument('pin', type=int, help='Pin cannot be blank', location='json')

User_details_fields = {
    "name":fields.String,
    "username":fields.String,
    "email":fields.String,
    "mobile":fields.Integer,
    "address":fields.String,
    "city":fields.String,
    "state":fields.String,
    "pin":fields.Integer,
    "role":fields.String(attribute=lambda x: x.roles[0].name)

}




class User_details(Resource):
    @auth_required("token")
    def get(self):
        user_id = current_user.id
        user = User.query.get(user_id)
        return marshal(user,User_details_fields),200
    
    def post(self):
        args = user_parser.parse_args()
        print(args)
        # Extract role_id from the args
        role_name = args.pop('role', None)
        password = args.pop('password')
        if role_name not in ["manager", "user"]:
            return {"message": "Invalid role"}, 400
        active= True
        if role_name == "manager":
            active = False

        # Create the user
        new_user = User(password=generate_password_hash(password),active = active,**args)

        # If a role_id is provided, assign the role to the user
        if role_name:
            role = Role.query.filter_by(name=role_name).first()
            if role:
                new_user.roles.append(role)

        # Add the user to the session and commit changes
        db.session.add(new_user)

        try:
            db.session.commit()
            return {"message": "user created successfully"}
        except Exception as e:
            print(e)
            db.session.rollback()
            return {"message": "error creating user"}, 500
        
    @auth_required("token")
    def put(self):
        user_id = current_user.id
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        # Fields allowed to be updated
        allowed_fields = ['name', 'mobile', 'address', 'city', 'state', 'pin']

        args = user_update_parser.parse_args()

        # Update user details for allowed fields
        for key, value in args.items():
            if key in allowed_fields and value is not None:
                setattr(user, key, value)
            else:
                return {"message": "Incorrect information provided"}, 400
        try:
            db.session.commit()
            return {"message": "Profile Updated Successfully"}, 200
        except Exception as e:
            print(e)
            db.session.rollback()
            return {"message": "Error updating user details"}, 500


api.add_resource(User_details,'/user','/user/<int:id>')






















# ------------------------------------   Product   -------------------------------------------- #

def str_to_bool(value):
    return value.lower() in ['true', '1', 'yes']


prod_get_parser = reqparse.RequestParser()
prod_page_parser = reqparse.RequestParser()
prod_post_parser = reqparse.RequestParser()

prod_get_parser.add_argument('id', type=int, location='args', help='ID cannot be blank')
prod_get_parser.add_argument('name', type=str, location='args', help='Name cannot be blank')
prod_get_parser.add_argument('brand', type=str, location='args', help='Brand cannot be blank')
prod_get_parser.add_argument('manufacturing_date', location='args', type=str, help='Manufacturing date cannot be blank')
prod_get_parser.add_argument('expiry_date', type=str, location='args', help='Expiry date cannot be blank')
prod_get_parser.add_argument('price', type=float, location='args', help='Price cannot be blank')
prod_get_parser.add_argument('stock', type=int, location='args', help='Stock cannot be blank')
prod_get_parser.add_argument('active', type=str_to_bool, location='args')
prod_get_parser.add_argument('section_id', type=int, location='args', help='Section ID cannot be blank')

prod_post_parser.add_argument('name', type=str, location='json', help='Name cannot be blank', required=True)
prod_post_parser.add_argument('brand', type=str, location='json', help='Brand cannot be blank', required=True)
prod_post_parser.add_argument('manufacturing_date', location='json', type=str, help='Manufacturing date cannot be blank', required=True)
prod_post_parser.add_argument('expiry_date', type=str, location='json', help='Expiry date cannot be blank', required=True)
prod_post_parser.add_argument('price', type=float, location='json', help='Price cannot be blank', required=True)
prod_post_parser.add_argument('stock', type=int, location='json', help='Stock cannot be blank', required=True)
prod_post_parser.add_argument('active', type=bool, location='json',default=False)
prod_post_parser.add_argument('section_id', type=int, location='json', help='Section ID cannot be blank', required=True)
prod_post_parser.add_argument('image_url', type=str, location='json', help='Section ID cannot be blank')

prod_page_parser.add_argument('page', type=int, location='args', help='Section ID cannot be blank')
prod_page_parser.add_argument('per_page', type=int, location='args', help='Section ID cannot be blank')



prod_fields= {
    'id':fields.Integer,
    'name':fields.String,
    'brand':fields.String,
    'manufacturing_date':fields.String,
    'expiry_date':fields.String,
    'price':fields.Float,
    'active':fields.Boolean,
    'stock':fields.Integer,
    'section_id':fields.Integer,
    'image_url':fields.String,

}
string_matching_fields = ['name', 'brand']
class Products(Resource):
    def get(self):
        args = prod_get_parser.parse_args()

        conditions = []
        for field, value in args.items():
            if value is not None and field in prod_fields:
                if field in string_matching_fields:
                    conditions.append(getattr(Product, field).ilike(f"%{value}%"))
                else:
                    conditions.append(getattr(Product, field) == value)
        
        page = int(args.get('page', 1))
        per_page = int(args.get('per_page', 10))

        if conditions:
            pagination = Product.query.filter(*conditions).paginate(page=page, per_page=per_page, error_out=False)
        else:
            pagination = Product.query.paginate(page=page, per_page=per_page, error_out=False)

        products = pagination.items
        total_pages = pagination.pages
        if not products:
            return {"message": "No product found"}, 404
        
        return {"products":marshal(products, prod_fields),"total_pages":total_pages}, 200

    def post(self):
        args = prod_post_parser.parse_args()

        try:
            args['manufacturing_date'] = datetime.strptime(args['manufacturing_date'], '%Y-%m-%d').date()
            args['expiry_date'] = datetime.strptime(args['expiry_date'], '%Y-%m-%d').date()
        except ValueError:
            return {"message": "Invalid date format"}, 400
        
        product = Product(**args)
        db.session.add(product)

        try:
            db.session.commit()
            return {"message": "product created successfully"}
        except Exception as e:
            # meaningful error message
            return {"message": f"product creation failed: {str(e)}"}, 500

       

api.add_resource(Products,'/products')














# ------------------------------------   Section   -------------------------------------------- #
#  api for section model
section_get_parser = reqparse.RequestParser()
section_post_parser = reqparse.RequestParser()

section_get_parser.add_argument('name', type=str, location='args', help='Name cannot be blank')
section_get_parser.add_argument('active', type=str_to_bool, location='args')

section_post_parser.add_argument('name', type=str, location='json', help='Name cannot be blank', required=True)
section_post_parser.add_argument('active', type=bool, location='json', default=False)
section_post_parser.add_argument('image_url', type=str, location='json', help='Image URL cannot be blank')

section_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'active': fields.Boolean,
    'image_url': fields.String,
}
string_matching_fields = ['name']
class Sections(Resource):
    def get(self):
        args = section_get_parser.parse_args()

        conditions = []
        for field, value in args.items():
            if value is not None and field in section_fields:
                if field in string_matching_fields:
                    conditions.append(getattr(Section, field).ilike(f"%{value}%"))
                else:
                    conditions.append(getattr(Section, field) == value)
        
        if conditions:
            sections = Section.query.filter(*conditions).all()
        else:
            sections = Section.query.all()

        if not sections:
            return {"message": "No section found"}, 404
        
        return marshal(sections, section_fields), 200

    def post(self):
        args = section_post_parser.parse_args()
        print(args)
        section = Section(**args)
        db.session.add(section)

        try:
            db.session.commit()
            return {"message": "section created successfully"}
        except Exception as e:
            return {"message": f"section creation failed: {str(e)}"}, 500
        
api.add_resource(Sections, '/sections')

