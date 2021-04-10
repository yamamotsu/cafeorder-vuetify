import firebase_admin
from firebase_admin import credentials, auth

TOKEN_KEYS = {'verified': bool, 'admin':bool, 'userId':str}
def str2bool(s):
    return s.lower() in ["true", "t", "yes", "1"]

cred = credentials.Certificate("credentials.json")
default_app = firebase_admin.initialize_app(cred)

try:
    print('Enter UID: ', end="")
    uid = input()
    print('> ', uid)
    user = auth.get_user(uid)
    token = user.custom_claims
    print('> current token:', token)
    print('-'*10)
    for key in TOKEN_KEYS.keys():
        print(f"Enter the new value of `{key}` (leave empty for no change): ", end="")
        val = input()
        if val != "":
            if TOKEN_KEYS[key] == bool:
                val = str2bool(val)
            print(f'> {val}')
            token.update({key: val})

    print('updating token with new value: ', token)
    print('OK?[Y/n]: ', end="")
    yn = input()
    if yn == "" or yn == "y" or yn == "Y":
        auth.set_custom_user_claims(uid, token, app=None)
        print("OK.")
    else:
        print()
        print("Canceled.")
except KeyboardInterrupt:
    print("canceled.")