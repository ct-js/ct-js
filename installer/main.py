from PyQt5.QtWidgets import QApplication, QLabel, QDialog, QGridLayout

null = None
true = True
false = False


class Installer(QDialog):
    def __init__(self, parent=null):
        super(Installer, self).__init__(parent)
        
        self.left = 10
        self.top = 10
        self.width = 640
        self.height = 480
        self.setGeometry(self.left, self.top, self.width, self.height)

        self.setWindowTitle("ct.js Installer")

        QLabel("test", parent=self)


if __name__ == "__main__":
    print("Opening application...")

    app = QApplication([])
    app.setStyle("Fusion")

    installer = Installer()
    installer.show()

    app.setActiveWindow(installer)

    app.exec_()

    print("Application closed")
