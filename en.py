# import required module
from cryptography.fernet import Fernet

# key generation
key = Fernet.generate_key()
print(key)

# string the key in a file
# with open('key.key', 'wb') as file:
#    file.write(key)

# opening the key
with open('key.key', 'rb') as file:
    key = file.read()

# using the generated key
fernet = Fernet(key)

# opening the original file to encrypt
with open('database.json', 'rb') as file:
    original = file.read()

# encrypting the file
encrypted = fernet.encrypt(original)

# opening the file in write mode and
# writing the encrypted data
with open('database.json', 'wb') as encrypted_file:
    encrypted_file.write(encrypted)

"""# opening the encrypted file
with open('nba.csv', 'rb') as enc_file:
    encrypted = enc_file.read()

# decrypting the file
decrypted = fernet.decrypt(encrypted)

# opening the file in write mode and
# writing the decrypted data
with open('nba.csv', 'wb') as dec_file:
    dec_file.write(decrypted)"""
