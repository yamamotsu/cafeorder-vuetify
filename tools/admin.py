import firebase_admin
from firebase_admin import credentials, auth, firestore
import argparse
import json
import pandas as pd

TOKEN_KEYS = {'verified': bool, 'admin':bool, 'userId':str}

def str2bool(s):
    return s.lower() in ["true", "t", "yes", "1"]


def get_all_collections():
    db = firestore.client()

    collections = [c.id for c in db.collections()]
    return collections


def list_collections():
    db = firestore.client()

    for collection in db.collections():
        print(collection.id)


def config_auth():
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

def list_auth_users():
    users = auth.list_users()
    users_table = []
    for user in users.iterate_all():
        token = user.custom_claims
        users_table.append({
            "uid": user.uid,
            "e-mail": user.email,
            "verified?": token["verified"],
            "userId(on DB)": token["userId"],
            "admin": token["admin"]
        })
    df = pd.DataFrame.from_dict(users_table)
    df = df.set_index('uid')
    print(df)


def list_categories():
    db = firestore.client()

    categories_ref = db.collection('categories')
    print('all categories:')
    print('-'*10)
    counts = 0
    docs = categories_ref.stream()
    for doc in docs:
        data = doc.to_dict()
        counts += 1
        print(f'{doc.id}: {data["name"]}')
    if counts == 0:
        if not 'categories' in get_all_collections():
            print('Collection:`categories` is not initialized.')

def init_categories(config:dict):
    '''
        i.e. :
        config = {
            "categories": [
                { "name": "Snacks", "order": 0, "color": "#FA738C" },
                { "name": "Drinks", "order": 1, "color": "#84D7FA" },
                ...
            ]
        }
    '''
    if config is None:
        raise ValueError("Argument `CONFIG_FILE` is required to init. please run again with `-c [config_file.json]`")
    init_data = config['categories']

    if 'categories' in get_all_collections():
        print('Collection `cateogries` is already exists.')
        return

    db = firestore.client()
    ref = db.collection('categories')
    print('registering categories..')
    for category in init_data:
        doc = ref.document()
        data = {
            "name": category["name"],
            "order": category["order"],
            "color": category.get("color", ""), # `color` is not required
            "id": doc.id
        }
        print(f" > name:{data['name']}, order:{data['order']}, color:{data['color']} as id:{doc.id}")
        doc.set(data)


def auth_main(sub_command:str):
    if sub_command == 'config':
        config_auth()
    elif sub_command == 'list':
        list_auth_users()


def categories_main(sub_command:str, config:dict=None):
    if sub_command == 'list':
        list_categories()
    elif sub_command == 'init':
        init_categories(config=config)


if __name__ == '__main__':
    try:
        cred = credentials.Certificate("credentials.json")
    except FileNotFoundError:
        raise FileNotFoundError("Firebase admin secret file: `credentials.json` was not found.")

    default_app = firebase_admin.initialize_app(cred)

    parser = argparse.ArgumentParser()
    parser.add_argument('command')
    parser.add_argument('-u', '--UID', required=False, default=None)
    parser.add_argument('-c', '--CONFIG_FILE', required=False, default=None)
    args = parser.parse_args()

    config = None
    if args.CONFIG_FILE is not None:
        with open(args.CONFIG_FILE) as f:
            config = json.load(f)

    commands = args.command.split(':')
    command = commands[0]
    sub_command = commands[1]
    if command == 'auth':
        auth_main(sub_command)
    elif command == 'categories':
        categories_main(sub_command, config=config)
