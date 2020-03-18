#!/bin/bash

echo navigating to /srv >> /var/log/install-pupit-service.log
cd /srv
echo navigated to /srv >> /var/log/install-pupit-service.log

echo chrome installing >> /var/log/install-pupit-service.log
curl https://intoli.com/install-google-chrome.sh | bash
ln -s /usr/bin/google-chrome-stable /usr/bin/google-chrome
echo chrome installed >> /var/log/install-pupit-service.log

echo nodejs installing >> /var/log/install-pupit-service.log
curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
yum -y install nodejs
echo nodejs installed >> /var/log/install-pupit-service.log

echo git installing >> /var/log/install-pupit-service.log
yum -y install git
echo git installed >> /var/log/install-pupit-service.log

echo git repo cloning >> /var/log/install-pupit-service.log
git clone https://github.com/dimasorokin1987/pupit.git
echo git repo cloned >> /var/log/install-pupit-service.log

echo navigating to /srv/pupit >> /var/log/install-pupit-service.log
cd pupit
echo navigated to /srv/pupit >> /var/log/install-pupit-service.log

echo express installing >> /var/log/install-pupit-service.log
npm install express
echo express installed >> /var/log/install-pupit-service.log

echo pupiter installing >> /var/log/install-pupit-service.log
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm install puppeteer
echo pupiter installed >> /var/log/install-pupit-service.log

echo service file coping >> /var/log/install-pupit-service.log
cp pupit.service /etc/systemd/system/
echo service file copied >> /var/log/install-pupit-service.log

echo service enabling >> /var/log/install-pupit-service.log
systemctl enable pupit.service
echo service enabled >> /var/log/install-pupit-service.log

echo service starting >> /var/log/install-pupit-service.log
systemctl start pupit.service
echo service started >> /var/log/install-pupit-service.log