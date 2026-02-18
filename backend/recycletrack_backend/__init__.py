import pymysql

# 1. Spoof the version so Django thinks it's mysqlclient
pymysql.version_info = (1, 4, 3, "final", 0)

# 2. Initialize the driver
pymysql.install_as_MySQLdb()