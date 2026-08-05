#!/usr/bin/env python3
"""
macOS Sequoia Neofetch-style terminal login screen
by Nazky
"""

import os
import platform
import getpass
import hashlib
import time
from colorama import init, Fore, Style
import subprocess
import sys

init(autoreset=True)

USERNAME = "Nazky"
PASSWORD_HASH = hashlib.sha256("t94na52j444".encode()).hexdigest()

BLUE = "\033[38;5;75m"
RESET = "\033[0m"


def clear():
    os.system("cls" if os.name == "nt" else "clear")


def slow_print(text, delay=0.002):
    for c in text:
        print(c, end="", flush=True)
        time.sleep(delay)
    print()


def show_mac_screen():
    clear()

    apple_logo = BLUE + r"""
               ,:x0XNlNX0x:,             
           .oONWKOfffffffOKWNOo.         
       .lKWO:'              ':0WKl.      
     .xWK:                      :KWx.    
    lWK;                          :XNc   
   OMx       ;              ;       kMk  
  kMo        OXl         .oNk        dMx 
 cMO         OMWNl     .oWWMk         0M:
 KM,         OM::XNo..dWK::Mk         ;MO
 WW.         OM:  :NWWK:  :Mk         .MN
 WW.         OM: .dWX:    :Mk         .MN
 0M;         OMldWK:      :Mk         :MO
 :M0         OMMX:        :Mk         KM;
  xMx        OK:          :Q:        kMd 
   xMk       '                     .OMd  
    :NX:                          cNN:   
     .oWXl.                    .oNNo     
        cOWKd;.            .:dXWO:       
           .oONWKOxooooxOKWNOo.          
               ':x0XNNX0x:'              
""" + RESET

    info = (
        BLUE + Style.BRIGHT +
        "nazky@MacBook-Air\n" + RESET +
        Fore.WHITE + "--------------------------\n" +
        BLUE + "OS: " + Fore.WHITE + "macOS Sequoia 15.0 (24A335)\n" +
        BLUE + "Host: " + Fore.WHITE + "MacBook Air (M4, 2025)\n" +
        BLUE + "Kernel: " + Fore.WHITE + platform.release() + "\n" +
        BLUE + "Shell: " + Fore.WHITE + os.getenv("SHELL", "zsh") + "\n" +
        BLUE + "Resolution: " + Fore.WHITE + "2560x1664\n" +
        BLUE + "DE: " + Fore.WHITE + "Aqua\n" +
        BLUE + "WM: " + Fore.WHITE + "Quartz Compositor\n" +
        BLUE + "Theme: " + Fore.WHITE + "macOS Light (Default)\n" +
        BLUE + "Icons: " + Fore.WHITE + "SF Symbols / macOS\n" +
        BLUE + "Terminal: " + Fore.WHITE + "Apple Terminal\n" +
        BLUE + "CPU: " + Fore.WHITE + "Apple M4 (4P + 6E)\n" +
        BLUE + "GPU: " + Fore.WHITE + "Apple M4 GPU (10-core)\n" +
        BLUE + "Memory: " + Fore.WHITE + "16GB Unified Memory\n\n" +
        Fore.RED + "███" + Fore.YELLOW + "███" + Fore.GREEN + "███" +
        Fore.CYAN + "███" + Fore.BLUE + "███" + Fore.MAGENTA + "███"
    )

    apple_lines = apple_logo.split("\n")
    info_lines = info.split("\n")
    for i in range(max(len(apple_lines), len(info_lines))):
        left = apple_lines[i] if i < len(apple_lines) else ""
        right = info_lines[i] if i < len(info_lines) else ""
        print(f"{left:<40} {right}")

    print(RESET)


def close_terminal_app():
    """Close the macOS Terminal app entirely."""
    if platform.system() == "Darwin":
        # 🧠 This AppleScript command closes all terminal windows gracefully
        subprocess.call(["osascript", "-e", 'tell application "Terminal" to quit'])
    else:
        sys.exit(0)


def login():
    print()
    user = input(BLUE + "login as: " + RESET)
    pwd = getpass.getpass(BLUE + "Password: " + RESET)

    if user == USERNAME and hashlib.sha256(pwd.encode()).hexdigest() == PASSWORD_HASH:
        slow_print(Fore.GREEN + "\nAccess Granted ✅ Welcome, " + user + "!" + RESET)
        time.sleep(0.8)

        # Countdown before closing
        print(Fore.YELLOW + "\nPreparing..." + RESET)
        for i in range(3, 0, -1):
            print(Fore.YELLOW + f"Preparing in {i}..." + RESET)
            time.sleep(1)

        print(Fore.RED + "\nGoodbye 👋" + RESET)
        time.sleep(0.8)

        # 🧩 Run AppleScript to quit Terminal
        close_terminal_app()
    else:
        print(Fore.RED + "\nLogin incorrect.\n" + RESET)
        time.sleep(1.5)
        main_menu()


def dashboard():
    clear()
    print(BLUE + Style.BRIGHT + r"""
 __  ___           __        ___              ___       __  
/  |/  /___ ______/ /_____ _/ (_)___  ___    /   | ____/ /__
/ /|_/ / __ `/ ___/ __/ __ `/ / /_  / / _ \  / /| |/ __  / _ \
/ /  / / /_/ / /__/ /_/ /_/ / / / /_/ /  __/ / ___ / /_/ /  __/
/_/  /_/\__,_/\___/\__/\__,_/_/_/\__, /\___/ /_/  |_\__,_/\___/ 
                                 /____/                          
""" + RESET)
    print(BLUE + "\nWelcome to macOS Secure Terminal.\n" + RESET)
    print(BLUE + "User: " + Fore.WHITE + USERNAME)
    print(BLUE + "Device: " + Fore.WHITE + "MacBook Air M4")
    print(BLUE + "Status: " + Fore.GREEN + "Online ✅\n")
    input(Fore.YELLOW + "Press Enter to logout..." + RESET)
    main_menu()


def about():
    clear()
    print(BLUE + Style.BRIGHT + "\nAbout This Mac\n" + RESET)
    print(Fore.WHITE + "------------------------------")
    print(BLUE + "macOS Version: " + Fore.WHITE + "Sequoia 15.0 (24A335)")
    print(BLUE + "Mac Model: " + Fore.WHITE + "MacBook Air (M4, 2025)")
    print(BLUE + "Chip: " + Fore.WHITE + "Apple M4")
    print(BLUE + "Memory: " + Fore.WHITE + "16 GB Unified Memory")
    print(BLUE + "Storage: " + Fore.WHITE + "512 GB SSD")
    print(BLUE + "Graphics: " + Fore.WHITE + "Apple M4 GPU (10-core)")
    print(BLUE + "Display: " + Fore.WHITE + "13.6-inch (2560 x 1664)")
    print(BLUE + "Serial Number: " + Fore.WHITE + "F4KJ29M4A1")
    print()
    input(Fore.YELLOW + "Press Enter to return to menu..." + RESET)
    main_menu()


def main_menu():
    clear()
    show_mac_screen()
    print(BLUE + Style.BRIGHT + "\nmacOS Terminal Menu\n" + RESET)
    print(Fore.WHITE + "--------------------------")
    print(Fore.YELLOW + "[1]" + Fore.WHITE + " Login")
    print(Fore.YELLOW + "[2]" + Fore.WHITE + " About This Mac")
    print(Fore.YELLOW + "[3]" + Fore.WHITE + " Exit\n")

    choice = input(BLUE + "Select option: " + RESET)

    if choice == "1":
        login()
    elif choice == "2":
        about()
    elif choice == "3":
        slow_print(Fore.YELLOW + "\nPreparing... ")
        time.sleep(1)
        clear()
        slow_print(Fore.GREEN + "Goodbye, " + USERNAME + "! 👋")
        time.sleep(0.6)
        close_terminal_app()
    else:
        print(Fore.RED + "\nInvalid choice.\n" + RESET)
        time.sleep(1.5)
        main_menu()


if __name__ == "__main__":
    try:
        main_menu()
    except KeyboardInterrupt:
        print("\n" + Fore.YELLOW + "Session ended." + RESET)
