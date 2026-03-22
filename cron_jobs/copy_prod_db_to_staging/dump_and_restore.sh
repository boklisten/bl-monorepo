mongodump --uri="${FROM_MONGODB_URI}"
rm -r dump/admin
rm dump/prelude.json
mongorestore --drop --uri="${TO_MONGODB_URI}" --nsFrom="production.*" --nsTo="staging.*" dump/
