cd /home/blaze/GENERAL/gamble/frontend
npm run build
cd /home/blaze/GENERAL/gamble/
cp -r frontend/build frontendBuild/
pm2 restart gamble-front