class Config(object):
    DEBUG = True
    TESTING = True

    SECURITY_KEY= "msaligsss"
    SECURITY_PASSWORD_SALT = "saltingisNotgood"
    SQLALCHEMY_TRACK_MODIFICATION = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "authentication-Token"

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI='sqlite:///grocery.db'