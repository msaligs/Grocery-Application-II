from flask import current_app as app, jsonify,render_template,request
from application.models import *
from application.sec import datastore
from flask_security import auth_required, roles_required, current_user,roles_accepted
from werkzeug.security import check_password_hash, generate_password_hash
from flask_restful import marshal,fields
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
# from application.worker import celery_app

@app.get('/')
def home():
    return render_template("index.html")

# for login of admin, manager and user
@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message":"email not provides"})
    
    user =  datastore.find_user(email=email)
    if not user:
        return jsonify({"message":"User not found"}),404
    if check_password_hash(user.password, data.get("password")):
        if not user.active:
            return jsonify({"message":"Account is pending for approval"}),404
        return jsonify({
            "id":user.id,
            "name":user.name,
            "roles":[ role.name for role in user.roles],
            "email":user.email,
            "token": user.get_auth_token()
        })
    else:
        return jsonify({"message":"Wrong password"}), 404
   
# to get the address of user
@app.get('/user_address')
@auth_required("token")
def user_address():
    user = current_user
    return jsonify({
        "name": user.name,
        "mobile": user.mobile,
        "email": user.email,
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "pin": user.pin
    })


# for user to add product to cart
@app.get('/add_to_cart/<int:product_id>/<int:quantity>')
@auth_required("token")
@roles_required("user")
def add_to_cart(product_id,quantity):

    if not product_id or not quantity:
        return jsonify({"message": "product_id and quantity are required"}), 400

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    cart_item = Cart.query.filter_by(user_id=current_user.id, product_id=product_id).first()

    if cart_item:
        cart_item.quantity = quantity
        message = "Product quantity updated successfully"
    else:
        cart_item = Cart(user_id=current_user.id, product_id=product_id, quantity=quantity)
        message = "Product added to cart successfully"

    db.session.add(cart_item)
    db.session.commit()

    return jsonify({"message": message})


# for user to remove product from cart
@app.route('/remove_from_cart/<int:product_id>')
@auth_required("token")
@roles_required("user")
def removeItemFromCart(product_id):
    cart_item = Cart.query.filter_by(user_id=current_user.id, product_id=product_id).first()

    if not cart_item:
        return jsonify({"message": "Product not found in cart"}), 404

    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Product removed from cart successfully"})


# update place_order to check the stock of the products in the cart and place the order only if the stock is available
# for user to place the order
@app.get('/place_order')
@auth_required("token")
@roles_required("user")
def place_order():
    user_id = current_user.id
    cart_items = Cart.query.filter_by(user_id=user_id).all()

    if not cart_items:
        return jsonify({"message": "Cart is empty"})

    total_amount = 0
    cart_prod_ids = [item.product_id for item in cart_items]
    products = Product.query.filter(Product.id.in_(cart_prod_ids)).all()

    order_details = []

    for i in range(len(cart_items)):
        if cart_items[i].quantity > products[i].stock:
            return jsonify({"message": "Stock not available for product: {}".format(products[i].name)})

        total_amount += (cart_items[i].quantity * products[i].price)



        order_details.append({
            'product_name': products[i].name,
            'brand': products[i].brand,
            'quantity': cart_items[i].quantity,
            'price': products[i].price,
            'total_price': cart_items[i].quantity * products[i].price
        })       


    try:
        # Begin the transaction
        if not db.session.is_active:
            db.session.begin()
        
        order = Order(user_id=current_user.id,
                      order_date=datetime.now(),
                      total_amount=total_amount)
        db.session.add(order)
        db.session.commit()
        
        for i in range(len(cart_items)):
            order_item = Order_item(product_id=products[i].id, prod_name=products[i].name, brand=products[i].brand,
                                    manufacturing_date=products[i].manufacturing_date,
                                    expiry_date=products[i].expiry_date,
                                    price=products[i].price, quantity=cart_items[i].quantity,
                                    order_id=order.id)
            db.session.add(order_item)

        # Commit the transaction
        db.session.commit()

        # Delete the cart items
        Cart.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({
            "message": "Order placed successfully!",
            "order_id": order.id,
            "order_details": order_details,
            "total_amount": total_amount
        })


    except Exception as e:
        # Rollback the transaction in case of any exception
        db.session.rollback()
        return jsonify({"error": str(e)})

    finally:
        # Always close the session to release resources
        db.session.close()

# for user to check the past order summary
@app.route('/order_history')
@auth_required('token')
@roles_required('user')
def order_history():
    orders = Order.query.filter_by(user_id=current_user.id).all()

    order_history_data = []

    for order in orders:
        order_data = {
            'order_id': order.id,
            'order_date': order.order_date.isoformat(),
            'total_amount': order.total_amount
        }

        order_history_data.append(order_data)

    return jsonify(order_history_data)


# for user to check each past order details
@app.route('/order_items/<int:order_id>')
@auth_required('token')
@roles_required('user')
def order_items(order_id):
    orders = Order_item.query.filter_by(order_id=order_id).all()

    order_items_data = []

    for order in orders:
        order_data = {
            'product_id': order.product_id,
            'prod_name': order.prod_name,
            'brand': order.brand,
            'manufacturing_date': order.manufacturing_date.isoformat(),
            'expiry_date': order.expiry_date.isoformat(),
            'price': order.price,
            'quantity': order.quantity
        }

        order_items_data.append(order_data)

    return jsonify(order_items_data)



# @app.get('/activate/inst/<int:id>')
# @auth_required("token")
# @roles_required("admin")
# def activate_inst(id):
#     user = User.query.get(id)

#     if not user or 'inst' not in user.roles:
#         return jsonify({"message":"Instructor not found"})
#     # user.active = True
#     # active = datastore.toggle_active(user)
#     active = datastore.activate_user(user)

#     # datastore.add_role_to_user(user,'stud')
#     if active:
#         db.session.commit()
#         return jsonify({"message":"Instructor Activated"})
#     else:
#         return jsonify({"message":"Instructor already Active"})
    

# to retrive user from Users whose role is manager
@app.get('/get_managers')
@auth_required("token")
@roles_required("admin")
def get_managers():
    from sqlalchemy import join

    managers = User.query.join(RolesUsers).join(Role).filter(Role.name == 'manager').order_by(User.active.asc()).all()
    if not managers:
        return jsonify({"message":"No manager found"}),404
    manager_list = []
    for manager in managers:
        manager_list.append({
            "id":manager.id,
            "name":manager.name,
            "username":manager.username,
            "email":manager.email,
            "mobile":manager.mobile,
            "address":manager.address,
            "city":manager.city,
            "state":manager.state,
            "pin":manager.pin,
            "active":manager.active
        })
    return jsonify(manager_list)


@app.get('/approve_manager/<int:id>')
@auth_required("token")
@roles_required("admin")
def approve_manager(id):
    user = User.query.get(id)

    if not user or 'manager' not in user.roles[0].name:
        return jsonify({"message":"Manager not found"})
    active = datastore.activate_user(user)
    print(active)
    if active:
        db.session.commit()
        return jsonify({"message":"Manager Activated"})
    else:
        return jsonify({"message":"Manager already Active"})



# for admin to check all managers and verify the new manager
@app.get('/activate/manager/<int:id>')
@auth_required("token")
@roles_required("admin")
def activate_manager(id):
    user = User.query.get(id)

    if not user or 'manager' not in user.roles:
        return jsonify({"message":"Manager not found"})
    # user.active = True
    # active = datastore.toggle_active(user)
    active = datastore.activate_user(user)

    # datastore.add_role_to_user(user,'stud')
    if active:
        db.session.commit()
        return jsonify({"message":"Manager Activated"})
    else:
        return jsonify({"message":"Manager already Active"})




# for admin to verify the section
@app.get('/activate/section/<int:section_id>')
@auth_required("token")
@roles_required("admin")
def activate_section(section_id):
    section = Section.query.get(section_id)

    if not section:
        return jsonify({"message":"Section not found"})
    if section.active:
        return jsonify({"message":"Section already active"})
    # user.active = True
    # active = datastore.toggle_active(user)
    # active = datastore.activate_user(section)
    section.active = True

    # datastore.add_role_to_user(user,'stud')
    try:
        db.session.commit()
        return jsonify({"message":"Section Activated"})
    except:
        return jsonify({"message":"There is some problem while activating the section"})
    

# to request for deleting the section
@app.get('/request/delete/section/<int:section_id>')
@auth_required("token")
@roles_accepted("admin","manager")
def request_delete_section(section_id):
    section = Section.query.get(section_id)

    if not section:
        return jsonify({"message":"Section not found"})

    sec_delete = ChangeRequestSection(request_type="Delete",section_id=section_id,manager_id=current_user.id)
    db.session.add(sec_delete)
    try:
        db.session.commit()
        return jsonify({"message":"Requested for deleting the section"})
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Database error: " + str(e.orig)})
    except:
        return jsonify({"message":"There is some problem while deleting the section"})



# to request for updating the section
@app.route('/request/update/section/<int:section_id>', methods=['POST'])
@auth_required("token")
@roles_accepted("admin","manager")
def request_update_section(section_id):
    section = Section.query.get(section_id)

    if not section:
        return jsonify({"message":"Section not found"})
    
    args = request.get_json()
    name = args.get("name")
    image_url = args.get("image_url")
    if not name and not image_url:
        return jsonify({"message":"name or image_url is required"})

    sec_update = ChangeRequestSection(request_type="Update",section_id=section_id,manager_id=current_user.id,name=name,image_url=image_url)
    db.session.add(sec_update)
    try:
        db.session.commit()
        return jsonify({"message":"Requested for updating the section"})
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Database error: " + str(e.orig)})
    except:
        return jsonify({"message":"There is some problem while updating the section"})
 

# to request for creating the section
@app.route('/request/create/section', methods=['POST'])
@auth_required("token")
@roles_accepted("admin","manager")
def request_create_section():
    args = request.get_json()
    name = args.get("name")
    image_url = args.get("image_url")
    if not name and not image_url:
        return jsonify({"message":"name or image_url is required"})

    sec_create = ChangeRequestSection(request_type="New",manager_id=current_user.id,name=name,image_url=image_url)
    db.session.add(sec_create)
    try:
        db.session.commit()
        return jsonify({"message":"Requested for creating the section"})
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Database error: " + str(e.orig)})
    except:
        return jsonify({"message":"There is some problem while creating the section"})



# to get the cart items of user
@app.route('/get_cart_details')
@auth_required("token")
@roles_required("user")
def get_cart():
    print(current_user.id)
    try:
        user_id = current_user.id
        cart_items = Cart.query.filter_by(user_id=user_id).all()
        cart_details = []

        for item in cart_items:
            product = Product.query.get(item.product_id)
            if not product:
                # raise Exception("Product not found")
                return jsonify({"message": "Product not found"}), 404

            cart_details.append({
                "product_id": item.product_id,
                "user_id": item.user_id,
                "quantity": item.quantity,
                "product_name": product.name,
                "product_price": product.price
            })

        return jsonify(cart_details)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# for admin to check for any new request for section
@app.get('/get_section_requests')
@auth_required("token")
@roles_required("admin")
def get_section_requests():
    requests = ChangeRequestSection.query.order_by(ChangeRequestSection.status.desc()).all()
    if not requests:
        return jsonify({"message":"No requests found"}),204
    request_list = []
    for request in requests:
        request_list.append({
            "id":request.id,
            "request_type":request.request_type,
            "section_id":request.section_id,
            "name":request.name,
            "image_url":request.image_url,
            "manager_id":request.manager_id,
            "reason":request.reason,
            "status":request.status
        })
    return jsonify(request_list),200

# for admin to Reject the request for section
@app.get('/reject_section_request/<int:request_id>')
@auth_required("token")
@roles_required("admin")
def reject_request_section(request_id):
    request = ChangeRequestSection.query.get(request_id)

    if not request:
        return jsonify({"message":"Request not found"})
    request.status = "Rejected"
    try:
        db.session.commit()
        return jsonify({"message":"You Have Successfully Rejected the request"})
    except:
        return jsonify({"message":"There is some problem while rejecting the request"})
    


# for admin to approve the request for section
@app.get('/approve_section_request/<int:request_id>')
@auth_required("token")
@roles_required("admin")
def approve_request_section(request_id):
    request = ChangeRequestSection.query.get(request_id)

    if not request:
        return jsonify({"message":"Request not found"})
    if request.request_type == "New":
        section = Section(name=request.name,image_url=request.image_url,active=True)
        db.session.add(section)
        try:
            db.session.commit()
            request.status = "Approved"
            db.session.commit()
            return jsonify({"message":"You Have Successfully Approved the request for creating the section"})
        except:
            return jsonify({"message":"There is some problem while approving the request"})
    elif request.request_type == "Update":
        section = Section.query.get(request.section_id)
        section.name = request.name
        section.image_url = request.image_url
        try:
            db.session.commit()
            request.status = "Approved"
            db.session.commit()
            return jsonify({"message":"You Have Successfully Approved the request for updating the section"})
        except:
            return jsonify({"message":"There is some problem while approving the request"})
    elif request.request_type == "Delete":
        section = Section.query.get(request.section_id)
        db.session.delete(section)
        try:
            db.session.commit()
            request.status = "Approved"
            db.session.commit()
            return jsonify({"message":"You Have Successfully Approved the request for deleting the section"})
        except:
            return jsonify({"message":"There is some problem while approving the request"})
    else:
        return jsonify({"message":"There is some problem while approving the request"})