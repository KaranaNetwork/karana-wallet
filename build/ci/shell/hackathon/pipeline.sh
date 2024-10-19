DIR=$(dirname "$0")
export WORK_DIR=$DIR/../../../..
cd $WORK_DIR

rm src/lib/config/config.ts && cp -f src/lib/config/config.hackathon.ts src/lib/config/config.ts && npm run build && rsync -avz dist/ ubuntu@13.57.183.152:/home/frontend/hackathon/dist/