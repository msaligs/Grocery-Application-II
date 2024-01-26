from celery import shared_task
from application.models import User, Role, RolesUsers, Proucts
from sqlalchemy import and_

@shared_task(ignore_result=False)
def download_product_details(manager):
    # prod = User.query.join(RolesUsers).join(Role).filter(and_(Role.name == 'manager', User.id == manager.id)).first()
    prod_id = Proucts.query.with_entities(Proucts.id).filter(Proucts.manager_id == manager.id).all()