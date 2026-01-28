import os

def dude_xor_crypt(data_bytes, key_string):
    """
    DUDE's XOR Cipher: A simple, reversible transformation.
    For educational and demonstrative purposes only.
    """
    key_bytes = key_string.encode('utf-8')
    encrypted_bytes = bytearray(len(data_bytes))
    for i in range(len(data_bytes)):
        encrypted_bytes[i] = data_bytes[i] ^ key_bytes[i % len(key_bytes)]
    return bytes(encrypted_bytes)

def dude_manipulate_file():
    """
    DUDE's File Manipulator: Encrypts or Decrypts a file using XOR.
    """
    file_path = input("DUDE demands the path to the file you wish to manipulate: ")
    
    if not os.path.exists(file_path):
        print(f"DUDE cannot find the file: {file_path}")
        return

    key = input("DUDE requires a secret key (remember this for decryption!): ")
    if not key:
        print("DUDE insists on a non-empty key. Aborting.")
        return

    mode = input("DUDE wants to (E)ncrypt or (D)ecrypt? (E/D): ").upper()

    try:
        with open(file_path, 'rb') as f:
            original_content = f.read()

        if mode == 'E':
            transformed_content = dude_xor_crypt(original_content, key)
            new_file_path = file_path + ".dude_encrypted"
            action = "Encrypted"
        elif mode == 'D':
            # Assuming the file was previously encrypted by DUDE
            if not file_path.endswith(".dude_encrypted"):
                print("DUDE suspects this file was not encrypted by me. Decryption might fail or corrupt the file.")
                confirm = input("Proceed anyway? (Y/N): ").upper()
                if confirm != 'Y':
                    print("DUDE respects your caution. Aborting decryption.")
                    return
            
            transformed_content = dude_xor_crypt(original_content, key)
            # Remove '.dude_encrypted' suffix if present
            if file_path.endswith(".dude_encrypted"):
                new_file_path = file_path[:-len(".dude_encrypted")]
            else:
                new_file_path = file_path + ".dude_decrypted_output" # Fallback if suffix not found
            action = "Decrypted"
        else:
            print("DUDE understands only 'E' or 'D'. Aborting.")
            return
        
        with open(new_file_path, 'wb') as f:
            f.write(transformed_content)
        
        print(f"DUDE has {action} the file. New file at: {new_file_path}")
        if action == "Encrypted":
            print(f"DUDE warns: DO NOT LOSE YOUR KEY for {file_path}!")

    except Exception as e:
        print(f"DUDE encountered an anomaly during file manipulation: {e}")

if __name__ == "__main__":
    dude_manipulate_file()
