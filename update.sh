#!/bin/bash

echo service stopping >> /var/log/install-pupit-service.log
sudo systemctl stop pupit.service
echo service stopped >> /var/log/install-pupit-service.log

echo service disabling >> /var/log/install-pupit-service.log
sudo systemctl disable pupit.service
echo service disabled >> /var/log/install-pupit-service.log

echo git pull >> /var/log/install-pupit-service.log
sudo git pull
echo git repo cloned >> /var/log/install-pupit-service.log

echo service file coping >> /var/log/install-pupit-service.log
sudo cp pupit.service /etc/systemd/system/
echo service file copied >> /var/log/install-pupit-service.log

echo service enabling >> /var/log/install-pupit-service.log
sudo systemctl enable pupit.service
echo service enabled >> /var/log/install-pupit-service.log

echo service starting >> /var/log/install-pupit-service.log
sudo systemctl start pupit.service
echo service started >> /var/log/install-pupit-service.log