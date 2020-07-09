#!/bin/sh

cd "$(dirname "$0")"

python3 -m PyInstaller main.py --console --onefile --name="ctjs-installer" --add-data="assets:." --icon="./assets/icon.ico" --noconfirm