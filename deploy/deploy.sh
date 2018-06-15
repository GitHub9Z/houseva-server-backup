#!/bin/bash
# 重新部署脚本
echo '1.cp upload/app.zip to server dir'
cp /home/admin/upload/app.zip  /home/admin/project/houseva-server/
echo '2.cd project dir'
cd /home/admin/project/houseva-server
echo '3.remove old app dir'
rm -rf ./app
echo '4.unzip app.zip'
unzip app.zip
echo '5.restart nodejs server'
sudo forever restartall
