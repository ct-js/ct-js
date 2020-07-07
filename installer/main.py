from PyQt5.QtWidgets import (
    QDialog,
    QLabel,
    QGridLayout,
    QApplication,
    QInputDialog,
    QLineEdit,
    QPushButton,
    QMessageBox,
)
from PyQt5.QtCore import Qt, pyqtSlot
from PyQt5 import QtGui

from platform import platform
import sys
import os
import requests
import tempfile
import zipfile

is64bits = sys.maxsize > 2 ** 32

null = None
true = True
false = False

if "win" in platform().lower() and not "darwin" in platform().lower():
    installDirectoryParent = os.environ["LOCALAPPDATA"]
else:
    installDirectoryParent = os.environ["HOME"]
    if "darwin" in platform().lower():
        installDirectoryParent = os.path.join(
            installDirectoryParent, "Library", "Application Support"
        )


class Contants:
    ########### Text
    instructions = "Hello! This installer will install ct.js at the desired location. You can also use it to update ct.js."
    location = "Enter the installation location here (leave this unchanged it you're not an advanced user):"
    install = "Install ct.js"
    linuxUntested = "**If your OS is related to/based on Linux, ct.js should run.**\n\nct.js is not tested on this operating system. It may not run correctly. Use at your own risk."

    ########### Path
    defaultInstallDir = os.path.join(installDirectoryParent, "ct.js")
    downloadedFileName = "ctjs-installer-download.zip"
    downloadedFilePath = os.path.join(
        tempfile.gettempdir(), "ct.js", downloadedFileName
    )

    ########### Other
    githubUrl = "https://api.github.com/repos/ct-js/ct-js/releases/latest"
    testedLinuxDistros = ["linux"]


print("Default installation directory location: " + Contants.defaultInstallDir)
print(
    "Default installation directory location exists: "
    + os.path.exists(Contants.defaultInstallDir).__str__()
)


def platformIsTestedDistroLinux():
    for i in Contants.testedLinuxDistros:
        if i in platform().lower():
            return true
    return false


githubData = requests.get(Contants.githubUrl).json()


# https://stackoverflow.com/questions/9419162/download-returned-zip-file-from-url#14260592
def download_url(url, save_path=Contants.downloadedFilePath, chunk_size=128):
    r = requests.get(url, stream=True)
    print("Downloading " + url + " to " + save_path)
    try:
        os.mkdir(os.path.dirname(save_path))
    except:
        pass
    with open(save_path, "wb") as fd:
        for chunk in r.iter_content(chunk_size=chunk_size):
            fd.write(chunk)
    print("Finished downloading " + url + " to " + save_path)


def getRelease(channel):
    # https://stackoverflow.com/questions/9542738/python-find-in-list#9542768
    release = [x for x in githubData["assets"] if channel in x["name"]][0]
    url = release["browser_download_url"]
    download_url(url)


class PlatformStuff:
    def __init__(self):
        print("Platform: " + platform())
        if "darwin" in platform().lower():
            # Mac
            self.channel = "osx64"
        elif "win" in platform().lower():
            # Windows
            self.channel = "win32"
            if is64bits:
                self.channel = "win64"
        else:
            # Assume linux
            self.channel = "linux32"
            if is64bits:
                self.channel = "linux64"

    def __get_url(self):
        pass


platformStuff = PlatformStuff()


class Installer(QDialog):
    def __init__(self, parent=null):
        # TODO: redo gui, move them without using the GridLayout

        super(Installer, self).__init__(parent)

        self.setWindowTitle("ct.js Installer")
        self.left = 30
        self.top = 30
        self.width = 600
        self.height = 325
        self.setGeometry(self.left, self.top, self.width, self.height)

        self.instructionsLabel = QLabel(Contants.instructions, parent=self)
        self.instructionsLabel.setFont(self.getFont(18))
        self.instructionsLabel.setWordWrap(true)

        self.locationBox = QLineEdit(self)
        self.locationBox.resize(280, 40)
        self.locationBox.setText(Contants.defaultInstallDir)

        self.locationLabel = QLabel(Contants.location, parent=self)
        self.locationLabel.setFont(self.getFont(16))
        self.locationLabel.setWordWrap(true)
        self.locationLabel.move(0, 20)

        self.installButton = QPushButton(Contants.install, self)
        self.installButton.setFont(self.getFont(16))
        self.installButton.move(0, 20)
        self.installButton.clicked.connect(self.on_click)

        self.layout = QGridLayout()
        self.layout.addWidget(
            self.instructionsLabel, 1, 1, Qt.AlignTop | Qt.AlignCenter
        )
        self.layout.addWidget(self.locationBox, 2, 1, Qt.AlignTop | Qt.AlignCenter)
        self.layout.addWidget(self.locationLabel, 1, 1, Qt.AlignCenter)
        self.layout.addWidget(self.installButton, 2, 1, Qt.AlignCenter)

        self.setLayout(self.layout)

    def getFont(self, size: int):
        return QtGui.QFont("GothamBold", size, QtGui.QFont.Bold)

    @pyqtSlot()
    def on_click(self):
        location = self.locationBox.text()


if __name__ == "__main__":
    print("Opening application...")

    app = QApplication([])
    app.setStyle("Fusion")

    """
    if not platformIsTestedDistroLinux() and "linux" in platformStuff.channel:
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Warning)
        msg.setText("Warning")
        msg.setInformativeText(Contants.linuxUntested)
        msg.setWindowTitle("Warning")
        msg.show()
    """

    installer = Installer()
    installer.show()

    app.setActiveWindow(installer)

    app.exec_()

    print("Application closed")
