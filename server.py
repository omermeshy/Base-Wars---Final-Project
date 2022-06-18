import random
import socket
import select
import json
from cryptography.fernet import Fernet


def index_2d(myList, v):
    for i, x in enumerate(myList):
        if v in x:
            return (i, x.index(v))


def send_waiting_messages(write_list):
    """
    send all the messages that are in the write_list
    :param write_list: list of all the messages to send
    :return: None
    """
    for message in messages_to_send:
        (client_socket, data) = message
        print("sending", data)
        if client_socket in write_list:
            # encrypt and send the message
            client_socket.send(data.encode())

            # remove the message from the list
            messages_to_send.remove(message)


def main():
    global messages_to_send

    # create a server
    server_socket = socket.socket()
    server_socket.bind(("0.0.0.0", 9601))
    server_socket.listen(50)

    # list of all the clients that connected to the server
    open_client_sockets = []
    # list of all the messages that server needs to send
    messages_to_send = []

    # dictionary of all the online users (the socket is the key and username is the value)
    online_users = {}

    games = []

    # opening the key
    with open('key.key', 'rb') as file:
        key = file.read()

    # using the generated key
    fernet = Fernet(key)

    # loop for handling with clients
    while True:
        # get updated lists
        read_list, write_list, error_list = select.select([server_socket] + open_client_sockets, open_client_sockets,
                                                          [])

        # for each socket in the read_list handle with the packet
        for current_socket in read_list:
            # accept new client to connect the server
            if current_socket is server_socket:
                (new_socket, address) = server_socket.accept()
                print("New socket created", address)

                # add the new socket to the connected clients list
                open_client_sockets.append(new_socket)

            else:
                # try to receive the message
                # try:
                #     data = current_socket.recv(1024)  # .decode()
                #     data = data.decode()
                # except Exception:
                #     data = "DISCONNECTED"

                try:
                    data = current_socket.recv(1024)  # .decode()
                    data = data.decode()
                except ConnectionResetError:
                    print("ConnectionResetError")
                    data = "DISCONNECTED"

                # load the database and decrypt it
                with open("database.json", "rb") as file:
                    encrypted = file.read()
                    decrypted = fernet.decrypt(encrypted)
                    print(decrypted)
                    database = json.loads(decrypted)

                print(data)
                # disconnect the user because an error occur
                if data == "DISCONNECTED":
                    # set the user to offline from
                    try:
                        # database["status"][database["users"].index(online_users[current_socket])] = 0
                        online_users.pop(current_socket)
                    except:
                        pass

                    open_client_sockets.remove(current_socket)
                    current_socket.close()
                    print("Connection with client closed.")

                elif data.split(";")[0] == "[CREATE_NEW_ACCOUNT]":
                    # get the username and password
                    new_username = data.split(";")[1]
                    new_password = data.split(";")[2]
                    new_email = data.split(";")[3]

                    # check that the username or password is not too short
                    if len(new_username) < 2 or len(new_password) < 2:
                        messages_to_send.append(
                            (current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Length must be longer than 1"))

                    # check that the username not contains special signs
                    elif "/" in new_username or "," in new_username or "~" in new_username or "^" in new_username:
                        messages_to_send.append(
                            (current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Username can't use /,~^"))

                    # check that the password not contains special signs
                    elif "," in new_password:
                        messages_to_send.append(
                            (current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Password can't use ,"))

                    elif ("@" not in new_email) or ("." not in new_email):
                        messages_to_send.append(
                            (current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Email must use @ and ."))

                    elif len(new_email) < 10:
                        messages_to_send.append(
                            (current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Invalid email"))

                    # add the user to the database
                    elif not (new_username in database["users"]):
                        database["users"].append(new_username)
                        database["passwords"].append(new_password)
                        database["emails"].append(new_email)
                        # database["status"].append(0)

                        messages_to_send.append((current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Created"))

                    else:
                        messages_to_send.append(
                            (current_socket, "[ATTEMPT_TO_CREATE_NEW_ACCOUNT];Username already exists"))

                # check if username and password are matches to connect the user
                elif data.split(";")[0] == "[LOGIN]":
                    # split from the packet the username and password
                    username = data.split(";")[1]
                    password = data.split(";")[2]

                    # check if user is in the database
                    if username in database["users"]:
                        # check if the password of the user match
                        if password == database["passwords"][database["users"].index(username)]:
                            messages_to_send.append((current_socket, "[ATTEMPT_TO_LOGIN];Connected"))

                            # set the status to connected for the current user
                            online_users[current_socket] = username
                            # database["status"][database["users"].index(online_users[current_socket])] = 1

                        else:
                            messages_to_send.append((current_socket, "[ATTEMPT_TO_LOGIN];Wrong password"))

                    else:
                        messages_to_send.append((current_socket, "[ATTEMPT_TO_LOGIN];Username not exists"))

                elif data.split(";")[0] == "[GET_ONLINE_USERS]":
                    print(','.join(list(online_users.values())))
                    messages_to_send.append((current_socket, "[ONLINE_USERS];" + ','.join(list(online_users.values()))))

                elif data.split(";")[0] == "[PLAY_REQUEST]":
                    opponent = data.split(";")[1]
                    username = data.split(";")[2]
                    opponent_socket = list(online_users.keys())[list(online_users.values()).index(opponent)]

                    print("online users:", list(online_users.values()))
                    print(username, "wants to play with", opponent, opponent in online_users.values())

                    messages_to_send.append((opponent_socket, "[PLAYER_WANTS_TO_PLAY];" + username))

                elif data.split(";")[0] == "[START_NEW_GAME]":
                    username = data.split(";")[1]
                    opponent = data.split(";")[2]
                    opponent_socket = list(online_users.keys())[list(online_users.values()).index(opponent)]
                    board_number = random.randint(0, 9)
                    games.append([username, opponent])

                    print(username, "VS", opponent)

                    messages_to_send.append(
                        (opponent_socket, "[START_GAME];" + username + ";blue;" + str(board_number)))
                    messages_to_send.append((current_socket, "[START_GAME];" + opponent + ";red;" + str(board_number)))

                elif data.split(";")[0] == "[REJECT_NEW_GAME]":
                    username = data.split(";")[1]
                    opponent = data.split(";")[2]
                    opponent_socket = list(online_users.keys())[list(online_users.values()).index(opponent)]

                    messages_to_send.append((opponent_socket, "[GAME_REJECTED];" + username))

                elif data.split(";")[0] == "[NEW_PLANE_LAUNCHED]":
                    username = data.split(";")[1]
                    opponent = data.split(";")[2]
                    player_color = data.split(";")[3]
                    score = data.split(";")[4]
                    start_base_id = data.split(";")[5]
                    target_base_id = data.split(";")[6]

                    opponent_socket = list(online_users.keys())[list(online_users.values()).index(opponent)]

                    messages_to_send.append((opponent_socket,
                                             "[NEW_PLANE_LAUNCHED];" + username + ";" + opponent + ";" + player_color + ";" + score + ";" + start_base_id + ";" + target_base_id))

                elif data == "_Fake_":
                    messages_to_send.append((current_socket, "[Fake];"))

                # save the database
                with open("database.json", "wb") as file:
                    # generate new key
                    key = Fernet.generate_key()

                    # string the key in a file
                    with open('key.key', 'wb') as key_file:
                        key_file.write(key)

                    # using the new generated key
                    fernet = Fernet(key)

                    # encrypting the file
                    encrypted = fernet.encrypt(json.dumps(database, indent=2).encode('utf-8'))

                    # save
                    file.write(encrypted)
                    # json.dump(database, file)

        # send all the messages
        send_waiting_messages(write_list)


if __name__ == '__main__':
    main()
