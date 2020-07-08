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
from PyQt5.QtCore import Qt, pyqtSlot, QThread
from PyQt5.QtGui import QMovie, QPainter, QPixmap
from PyQt5 import QtGui, QtCore, QtWidgets

from platform import platform
import sys
import os
import requests
import tempfile
import zipfile
import time
import shutil

is64bits = sys.maxsize > 2 ** 32

null = None
true = True
false = False

if "win" in platform().lower() and not "darwin" in platform().lower():
    installDirectoryParent = os.environ["LOCALAPPDATA"]
else:
    installDirectoryParent = os.environ["HOME"]
    if "darwin" in platform().lower():
        installDirectoryParent = os.path.join(installDirectoryParent, "Applications")


class Contants:
    ########### Text
    welcomeLabel = "Welcome to Ct.js!"
    instructionsLabel = "You're almost there! Press this big button to open a door to a wonderful world of game development: "
    installButtonLabel = "Install ct.js"
    bottomRowTextLabel_1 = "Installing at "
    changeAbortLabel_1 = "Change..."

    installInfoLabel_1 = "Get release info"
    installInfoLabel_2 = "Download the app"
    installInfoLabel_3 = "Unpack and install ct.js"
    installInfoLabel_4 = "Create shortcuts and file rules"
    etaLabel_1 = "This will take about "
    etaLabel_2 = " seconds."
    bottomRowTextLabel_2 = "Pro tip: use the same installer to update ct.js!"
    changeAbortLabel_2 = "Abort"

    ########### Path
    defaultInstallDir = os.path.join(installDirectoryParent)
    downloadedFileName = "ctjs-installer-download.zip"
    downloadedFilePath = os.path.join(
        tempfile.gettempdir(), "ct.js", downloadedFileName
    )

    ########### Other
    githubUrl = "https://api.github.com/repos/ct-js/ct-js/releases/latest"


print("Default installation directory location: " + Contants.defaultInstallDir)
print(
    "Default installation directory location exists: "
    + os.path.exists(Contants.defaultInstallDir).__str__()
)


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


def getAsset(name):
    return os.path.join(os.path.dirname(os.path.realpath(__file__)), "assets", name,)


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


platformStuff = PlatformStuff()


class InstallThread(QThread):
    def __init__(self, location, parent):
        QThread.__init__(self)

        self.location = location
        self.app: Installer = parent

    def __del__(self):
        self.wait()

    def run(self):
        getRelease(platformStuff.channel)
        zipFolderName = platformStuff.channel

        with zipfile.ZipFile(Contants.downloadedFilePath, "r") as zip_ref:
            try:
                zipFolderName = os.path.dirname(zip_ref.namelist()[0])
            except:
                pass
            zip_ref.extractall(self.location)

        time.sleep(0.5)
        os.rename(
            os.path.join(self.location, zipFolderName),
            os.path.join(self.location, "ct.js"),
        )

        self.app.installingLabel.setText("Done installing!")
        self.app.setWindowTitle("Done installing ct.js!")


class Installer(QDialog):
    def __init__(self, parent=null):
        super(Installer, self).__init__(parent)

        try:
            self.setWindowIcon(QtGui.QIcon(getAsset("icon.ico")))
        except:
            pass
        self.setWindowIconText("ct.js Installer")
        self.setWindowTitle("ct.js Installer")
        self.left = 30
        self.top = 30
        self.width = 506
        self.height = 318
        self.setGeometry(self.left, self.top, self.width, self.height)
        self.setFixedSize(self.width, self.height)

        self.installing = false

        # Border and bottom row

        # First page

        self.welcomeLabel = QLabel(Contants.welcomeLabel, parent=self)
        self.welcomeLabel.move(20, 14)
        self.welcomeLabel.setFont(QtGui.QFont("Open Sans", 32, QtGui.QFont.Light))
        self.setStyleName("welcomeLabel")

        self.instructionsLabel = QLabel(Contants.instructionsLabel, parent=self)
        self.instructionsLabel.move(23, 69)
        self.instructionsLabel.resize(245, 57)
        self.instructionsLabel.setWordWrap(true)
        self.setStyleName("instructionsLabel")

        self.installButtonLabel = QPushButton(Contants.installButtonLabel, self)
        self.installButtonLabel.move(23, 148)
        self.installButtonLabel.resize(185, 60)
        self.installButtonLabel.clicked.connect(self.install)
        self.setStyleName("installButtonLabel")

        self.bottomRowTextLabel = QLabel(
            Contants.bottomRowTextLabel_1 + Contants.defaultInstallDir, parent=self
        )
        self.bottomRowTextLabel.move(21, 281)
        self.bottomRowTextLabel.resize(300, 19)
        self.bottomRowTextLabel.setWordWrap(true)
        self.setStyleName("bottomRowTextLabel")

        self.changeAbortLabel = QPushButton(Contants.changeAbortLabel_1, self)
        self.changeAbortLabel.move(369, 275)
        self.changeAbortLabel.resize(113, 32)
        self.changeAbortLabel.clicked.connect(self.change_location)
        self.setStyleName("changeAbortLabel")

        self.hammerCatImage = QLabel(parent=self)
        image = QPixmap(getAsset("HammerCat.svg"))
        self.hammerCatImage.setPixmap(image)
        self.hammerCatImage.resize(image.width(), image.height())
        self.hammerCatImage.move(481 - image.width(), 34)

    def getFont(self, size: int):
        return QtGui.QFont("GothamBold", size, QtGui.QFont.Bold)

    # @pyqtSlot()
    def install(self):
        self.installing = true

        self.setWindowTitle("Installing ct.js...")

        self.welcomeLabel.hide()
        self.locationBox.hide()
        self.locationLabel.hide()
        self.installButton.hide()

        self.installingLabel = QLabel(Contants.installing, parent=self)
        self.installingLabel.setFont(self.getFont(18))
        self.installingLabel.setWordWrap(true)

        # self.gif = QMovie(getAsset("partycarrot.gif"))
        # self.gif.frameChanged.connect(self.repaint)
        # self.gif.start()

        self.layout.addWidget(self.installingLabel, 1, 1, Qt.AlignTop | Qt.AlignCenter)

        # self.installThread = InstallThread(self.locationBox.text(), self)
        # self.installThread.start()

    def change_location(self):
        pass

    def paintEvent(self, event):
        # Border
        qp = QtGui.QPainter(self)
        br = QtGui.QBrush(QtGui.QColor(255, 255, 255, 100))
        pen = QtGui.QPen()
        pen.setColor(QtGui.QColor(200, 205, 209, 200))
        pen.setWidth(1.5)
        qp.setPen(pen)
        qp.setBrush(br)
        qp.drawRect(QtCore.QRect(0, 0, self.width, self.height))

        # Bottom row
        br2 = QtGui.QBrush(QtGui.QColor(255, 255, 255, 100))
        pen2 = QtGui.QPen()
        pen2.setColor(QtGui.QColor(200, 205, 209, 200))
        pen2.setWidth(1.5)
        qp.setPen(pen2)
        qp.setBrush(br2)
        qp.drawRect(QtCore.QRect(0, 264, self.width, self.height))

        try:
            currentFrame = self.gif.currentPixmap()
            frameRect = currentFrame.rect()
            frameRect.moveCenter(self.rect().center())
            if frameRect.intersects(event.rect()):
                painter = QPainter(self)
                painter.drawPixmap(frameRect.left(), frameRect.top(), currentFrame)
        except:
            pass

    def setStyleName(self, name: str):
        return self.__dict__[name].setObjectName(name)


if __name__ == "__main__":
    print("Opening application...")

    app = QApplication([])
    app.setStyle("Fusion")
    with open(getAsset("stylesheet.qtstyle"), "r") as f:
        app.setStyleSheet(f.read())

    installer = Installer()
    installer.show()

    app.setActiveWindow(installer)

    app.exec_()

    print("Application closed")
