from main import app
from application.sec import datastore
from application.models import User, Role, db, Section, Product
# from flask_security.utils import hash_password
from werkzeug.security import generate_password_hash
from datetime import datetime
import random
import string


def generate_random_string(a,b):
    letters = string.ascii_letters
    letters += '   '
    result_str = ''.join(random.choice(letters) for i in range(a,b))
    return result_str

with app.app_context():
    print ("deleting old database" )
    db.drop_all()
    print ("creating new database" )
    db.create_all()

    # adding the roles to the database
    print("adding the roles to the database")
    datastore.find_or_create_role(name='admin', description="user is a new admin")
    datastore.find_or_create_role(name='manager', description="user is a store manager")
    datastore.find_or_create_role(name='user', description="user is a user")
    db.session.commit()
   
    # adding the users to the database
    print("adding the users to the database")
    if not datastore.find_user(email="admin1@email.com"):
        datastore.create_user(username="Admin1", email="admin1@email.com", password=generate_password_hash("admin1"), roles=["admin"],
                              name=generate_random_string(5,10),
                              address=generate_random_string(15,40),
                              city=generate_random_string(10,20),
                              state=generate_random_string(5,15),
                              mobile=random.randrange(1000000000,9999999999,1),
                              pin=random.randrange(100000,999999,1)
                              
                              )

    if not datastore.find_user(email="admin12@email.com"):
        datastore.create_user(username="Admin2", email="admin2@email.com", password=generate_password_hash("admin2"), roles=["admin"],
                              name=generate_random_string(5,10),
                              address=generate_random_string(15,40),
                              city=generate_random_string(10,20),
                              state=generate_random_string(5,15),
                              mobile=random.randrange(1000000000,9999999999,1),
                              pin=random.randrange(100000,999999,1)
                              
                              )
        
    for i in range(1, 21):
        username = f"manager{i}"
        email = f"manager{i}@email.com"
        password = generate_password_hash(f"manager{i}")
        
        if not datastore.find_user(email=email):
            datastore.create_user(username=username, email=email, password=password, roles=["manager"], active=False,
                                    name=generate_random_string(5,10),
                                    address=generate_random_string(15,40),
                                    city=generate_random_string(10,20),
                                    state=generate_random_string(5,15),
                                    mobile=random.randrange(1000000000,9999999999,1),
                                    pin=random.randrange(100000,999999,1)
                                  
                                  )

    for i in range(1, 51):
        username = f"user{i}"
        email = f"user{i}@email.com"
        password = generate_password_hash(f"user{i}")
        
        if not datastore.find_user(email=email):
            datastore.create_user(username=username, email=email, password=password, roles=["user"],
                                    name=generate_random_string(5,10),
                                    address=generate_random_string(15,40),
                                    city=generate_random_string(10,20),
                                    state=generate_random_string(5,15),
                                    mobile=random.randrange(1000000000,9999999999,1),
                                    pin=random.randrange(100000,999999,1)
                                  
                                  )
            
    # if not datastore.find_user(email="user1@email.com"):
    #     datastore.create_user(username="user1", email="user1@email.com", password=generate_password_hash("user1"), roles=["user"])
    
    db.session.commit()
    # giving confirmation of successfull creation of database with roles and users
    print("database created with roles and users")
















    # adding the sections to the database
    # # ============================== Section ===============================
    print ("Entering the data in section table\n")
    print("....................................\n")

    f= open('section_data.csv','r')
    header = f.readline().strip()  # Read and ignore the header line
    for data in f.readlines():
        data = data.strip()
        last_comma_index = data.rfind(',')
        name = data[:last_comma_index].strip()
        image_url = data[last_comma_index + 1:].strip()
        section = Section(name=name, image_url=image_url, active=random.choice([True, False]))
        db.session.add(section)
    f.close()


    print("commiting the database")
    print("....................................\n")
    try:
        db.session.commit()
        print("data successfully entered into section table\n\n")
    except Exception as e:
        print("data can not be added to section table",e)




    # # ============================== Products ===============================
    print("..............into product table......................\n")

    with open('products_data.csv', 'r') as f:
        header = f.readline().strip()  # Read and ignore the header line

        for line in f.readlines():
            line = line.strip().split(',')

            if len(line) != 8:
                print(f"Invalid data format for line: {','.join(line)}")
                continue

            try:
                product = Product(
                    name=line[0],
                    brand=line[1],
                    manufacturing_date=datetime.strptime(line[2], '%d/%m/%Y').date(),
                    expiry_date=datetime.strptime(line[3], '%d/%m/%Y').date(),
                    price=float(line[4]),
                    stock=int(line[5]),
                    # image_url=line[6],
                    section_id=int(line[7]),
                    active=random.choice([True, False]),
                    manager_id=random.randint(3,22)
                )
                db.session.add(product)
            except (ValueError, IndexError) as e:
                print(f"Error processing line: {','.join(line)} - {e}")
                continue


    print("commiting the database")
    print("....................................\n")
    # db.session.add_all([t1,t2,t3,t4,t5,t6,t7,t8,t9])
    try:
        db.session.commit()
        print("data successfully entered into product table\n\n")
    except Exception as e:
        print("data can not be added to product table",e)






# ================= User ===============================
    # print ("Entering the data ..................into USER.\n")


    # with open('user_data.csv', 'r') as f:
    #     header = f.readline().strip()  # Read and ignore the header line

    #     for line in f.readlines():
    #         line = line.strip().split(',')

    #         if len(line) != 9:
    #             print(f"Invalid data format for line: {','.join(line)}")
    #             continue
    #         try:
    #             datastore.create_user(
    #                 name=line[0],
    #                 username=line[1],
    #                 password=generate_password_hash(line[2]),
    #                 email=line[3],
    #                 mobile=int(line[4]),
    #                 address=line[5],
    #                 city=line[6],
    #                 state=line[7],
    #                 pin=int(line[8]),
    #                 roles=["user"],
    #                 active=random.choice([True, False])
    #             )
    #             db.session.add(product)
    #         except (ValueError, IndexError) as e:
    #             print(f"Error processing line: {','.join(line)} - {e}")
    #             continue




    # print("commiting the database after USER")
    # print("....................................\n")
    # # db.session.add_all([t1,t2,t3,t4,t5,t6,t7,t8,t9])
    # try:
    #     db.session.commit()
    #     print("data successfully entered into USEr table\n\n")
    # except Exception as e:
    #     print("data can not be added to user table",e)
