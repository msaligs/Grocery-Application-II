from flask_restful import Resource, Api, reqparse, fields,marshal_with,marshal
from .models import *
from datetime import datetime
from flask_security import auth_required, roles_required, current_user, roles_accepted
from werkzeug.security import generate_password_hash

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

prod_page_parser = reqparse.RequestParser()
prod_page_parser.add_argument('page', type=int, location='args', required=True,default=1, help='please provide page number')
prod_page_parser.add_argument('per_page', type=int, location='args',default=40, help='plese provide per page number')

string_matching_fields = ['name', 'brand']


secure_prod_get_parser = reqparse.RequestParser()
secure_prod_post_parser = reqparse.RequestParser()
secure_prod_put_parser = reqparse.RequestParser()

secure_prod_get_parser.add_argument('id', type=int, location='args', help='ID cannot be blank')
secure_prod_get_parser.add_argument('name', type=str, location='args', help='Name cannot be blank')
secure_prod_get_parser.add_argument('brand', type=str, location='args', help='Brand cannot be blank')
secure_prod_get_parser.add_argument('price', type=float, location='args', help='Price cannot be blank')
secure_prod_get_parser.add_argument('manufacturing_date', location='args', type=str, help='Manufacturing date cannot be blank')
secure_prod_get_parser.add_argument('expiry_date', type=str, location='args', help='Expiry date cannot be blank')
secure_prod_get_parser.add_argument('stock', type=str, location='args', help='Expiry date cannot be blank')
secure_prod_get_parser.add_argument('section_id', type=int, location='args', help='Please Provide Correct Section ID')
secure_prod_get_parser.add_argument('manager_id', type=int, location='args', help='Please Provide Correct manager ID')
secure_prod_get_parser.add_argument('active', type=str_to_bool, location='args')

secure_prod_post_parser.add_argument('name', type=str, location='json', help='Name cannot be blank', required=True)
secure_prod_post_parser.add_argument('brand', type=str, location='json', help='Brand cannot be blank', required=True)
secure_prod_post_parser.add_argument('manufacturing_date', location='json', type=str, help='Manufacturing date cannot be blank', required=True)
secure_prod_post_parser.add_argument('expiry_date', type=str, location='json', help='Expiry date cannot be blank', required=True)
secure_prod_post_parser.add_argument('price', type=float, location='json', help='Price cannot be blank', required=True)
secure_prod_post_parser.add_argument('stock', type=int, location='json', help='Stock cannot be blank', required=True)
secure_prod_post_parser.add_argument('active', type=bool, location='json',default=True)
secure_prod_post_parser.add_argument('section_id', type=int, location='json', help='Section ID cannot be blank', required=True)
secure_prod_post_parser.add_argument('image_url', type=str, location='json', help='Section ID cannot be blank')


secure_prod_put_parser.add_argument('name', type=str, location='json', help='Name cannot be blank')
secure_prod_put_parser.add_argument('brand', type=str, location='json', help='Brand cannot be blank')
secure_prod_put_parser.add_argument('price', type=float, location='json', help='Price cannot be blank')
secure_prod_put_parser.add_argument('stock', type=str, location='json', help='Expiry date cannot be blank')
secure_prod_put_parser.add_argument('image_url', type=str, location='json', help='Section ID cannot be blank')


secure_prod_fields= {
    'id':fields.Integer,
    'name':fields.String,
    'brand':fields.String,
    'manufacturing_date':fields.String,
    'expiry_date':fields.String,
    'price':fields.Float,
    'active':fields.Boolean,
    'stock':fields.Integer,
    'section_id':fields.Integer,
    'manager_id':fields.Integer,
    'image_url':fields.String,

}
class Secure_Products(Resource):
    @auth_required('token')
    @roles_accepted('admin','manager','user')
    def get(self):
        args = secure_prod_get_parser.parse_args()

        if current_user.roles[0].name == 'manager' and not args['active']:
            args['active'] = True

        print(current_user.id)
        if args['manager_id'] is -1:
            args['manager_id'] = current_user.id

        conditions = []
        for field, value in args.items():
            if value is not None and field in secure_prod_fields:
                if field in string_matching_fields:
                    conditions.append(getattr(Product, field).ilike(f"%{value}%"))
                elif field == 'price':
                    conditions.append(getattr(Product, field) <= value)
                else:
                    conditions.append(getattr(Product, field) == value)

        p_args = prod_page_parser.parse_args()
        page = p_args['page']
        per_page = p_args['per_page']

        if conditions:
            pagination = Product.query.filter(*conditions).order_by(Product.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            pagination = Product.query.paginate(page=page, per_page=per_page, error_out=False)

        products = pagination.items
        total_pages = pagination.pages
        if not products:
            return {"message": "No product found"}, 204
        
        return {"products":marshal(products, prod_fields),"total_pages":total_pages}, 200


    @auth_required('token')
    @roles_accepted('manager')
    def post(self):
        args = secure_prod_post_parser.parse_args()

        try:
            args['manufacturing_date'] = datetime.strptime(args['manufacturing_date'], '%Y-%m-%d').date()
            args['expiry_date'] = datetime.strptime(args['expiry_date'], '%Y-%m-%d').date()
        except ValueError:
            return {"message": "Invalid date format"}, 400
        
        product = Product(**args, manager_id=current_user.id)
        db.session.add(product)

        try:
            db.session.commit()
            print(product)
            return {
                "message": "product created successfully",
                "product":marshal(product,secure_prod_fields)
                }
        except Exception as e:
            # meaningful error message
            return {"message": f"product creation failed: {str(e)}"}, 500
        

    @auth_required('token')
    @roles_required('manager')
    def delete(self,prod_id):

        products = Product.query.get(prod_id)

        if not products:
            return {"message": "No product found"}, 404
        elif products.manager_id != current_user.id:
            return {"message": "You are not authorized to delete this product"}, 403

        db.session.delete(products)

        try:
            db.session.commit()
            return {"message": "product deleted successfully"}
        except Exception as e:
            return {"message": f"product deletion failed: {str(e)}"}, 500

    @auth_required('token')
    @roles_accepted('manager')
    def put(self,prod_id):
        args = secure_prod_put_parser.parse_args()
        # print(args)
        prod = Product.query.get(prod_id)
        if not prod:
            return {"message": "No Product found"}, 403
        elif prod.manager_id != current_user.id:
            return {"message": "You are not authorized to update this product"}, 403
        for field,value in args.items():
            if value is not None and field in secure_prod_fields:
                setattr(prod, field, value)
        try:
            db.session.commit()
            return {
                "message": "product Updated successfully",
                "product":marshal(prod,secure_prod_fields)
                },200
        except Exception as e:
            return {"message": f"product updation failed: {str(e)}"}, 500

        


        return {"message": "data received"}, 200

api.add_resource(Secure_Products,'/secure_products','/secure_products/<int:prod_id>')




# ----------------------------- products for general users----------------------------------------------
prod_get_parser = reqparse.RequestParser()
# prod_page_parser = reqparse.RequestParser()

prod_get_parser.add_argument('id', type=int, location='args', help='ID cannot be blank')
prod_get_parser.add_argument('name', type=str, location='args', help='Name cannot be blank')
prod_get_parser.add_argument('brand', type=str, location='args', help='Brand cannot be blank')
prod_get_parser.add_argument('manufacturing_date', location='args', type=str, help='Manufacturing date cannot be blank')
prod_get_parser.add_argument('expiry_date', type=str, location='args', help='Expiry date cannot be blank')
prod_get_parser.add_argument('price', type=float, location='args', help='Price cannot be blank')
prod_get_parser.add_argument('section_id', type=int, location='args', help='Section ID cannot be blank')




prod_fields= {
    'id':fields.Integer,
    'name':fields.String,
    'brand':fields.String,
    'manufacturing_date':fields.String,
    'expiry_date':fields.String,
    'price':fields.Float,
    'stock':fields.Integer,
    'section_id':fields.Integer,
    'image_url':fields.String,

}
class Products(Resource):
    def get(self):
        args = prod_get_parser.parse_args()

        conditions = []
        for field, value in args.items():
            if value is not None and field in prod_fields:
                if field in string_matching_fields:
                    conditions.append(getattr(Product, field).ilike(f"%{value}%"))
                elif field == 'price':
                    conditions.append(getattr(Product, field) <= value)
                else:
                    conditions.append(getattr(Product, field) == value)
        p_args = prod_page_parser.parse_args()
        page = p_args['page']
        per_page = p_args['per_page']

        if conditions:
            pagination = Product.query.filter(*conditions).order_by(Product.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
        else:
            pagination = Product.query.paginate(page=page, per_page=per_page, error_out=False)

        products = pagination.items
        total_pages = pagination.pages
        if not products:
            return {"message": "No product found"}, 204
        
        return {"products":marshal(products, prod_fields),"total_pages":total_pages}, 200

api.add_resource(Products,'/products')














# ------------------------------------   Section   -------------------------------------------- #
#  api for section model
secure_section_get_parser = reqparse.RequestParser()
secure_section_post_parser = reqparse.RequestParser()

secure_section_get_parser.add_argument('name', type=str, location='args', help='Name cannot be blank')
secure_section_get_parser.add_argument('active', type=str_to_bool, location='args', )

secure_section_post_parser.add_argument('name', type=str, location='json', help='Name cannot be blank', required=True)
secure_section_post_parser.add_argument('active', type=bool, location='json',default=False)
secure_section_post_parser.add_argument('image_url', type=str, location='json', help='Image URL cannot be blank')

secure_section_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'active': fields.Boolean,
    'image_url': fields.String,
}
section_string_matching_fields = ['name']

class Secure_Sections(Resource):
    @auth_required('token')

    # @roles_required('admin')
    # # @roles_required('manager')
    @roles_accepted('admin','manager')
    def get(self):
        args = secure_section_get_parser.parse_args()
        if current_user.roles[0].name == 'manager' and not args['active']:
            args['active'] = True
            
        conditions = []
        for field, value in args.items():
            if value is not None and field in secure_section_fields:
                if field in section_string_matching_fields:
                    conditions.append(getattr(Section, field).ilike(f"%{value}%"))
                else:
                    conditions.append(getattr(Section, field) == value)

        sections = Section.query.filter(*conditions).order_by(Section.id.desc()).all()

        if not sections:
            return {"message": "No section found"}, 404
        
        return marshal(sections, secure_section_fields), 200


    @auth_required('token')
    @roles_accepted('admin','manager')
    def post(self):

        args = secure_section_post_parser.parse_args()
        if current_user.roles[0].name == 'manager':
            args['active'] = False
        elif current_user.roles[0].name == 'admin':
            args['active'] = True
        
        section = Section(**args)
        db.session.add(section)

        try:
            db.session.commit()
            return {"message": "section created successfully"}
        except Exception as e:
            return {"message": f"section creation failed: {str(e)}"}, 500
        
api.add_resource(Secure_Sections, '/secure_sections')



# sections for general users-----------------------------------------
section_get_parser = reqparse.RequestParser()
section_get_parser.add_argument('name', type=str, location='args', help='Name cannot be blank')

section_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'image_url': fields.String,
}
class Sections(Resource):
    def get(self):
        args = section_get_parser.parse_args()
        conditions = []
        for field, value in args.items():
            if value is not None and field in section_fields:
                if field in section_string_matching_fields:
                    conditions.append(getattr(Section, field).ilike(f"%{value}%"))
                else:
                    conditions.append(getattr(Section, field) == value)
        sections = Section.query.filter(*conditions).order_by(Section.id.desc()).all()
        # sections = Section.query.filter_by(active=True).order_by(Section.id.desc()).all()
        if not sections:
            return {"message": "No section found"}, 204
        
        return marshal(sections, section_fields), 200

        
api.add_resource(Sections, '/sections')

