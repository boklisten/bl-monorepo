mongosh "${MONGO_URL}" --eval '
console.log("Removing unplaced orders...")
const output = db.orders.deleteMany({
  placed: false,
  lastUpdated: {
    $lt: new Date(
      new Date().setFullYear(
        new Date().getFullYear() - 1
      )
    )
  }
})
console.log("db.orders.deleteMany(...) ", output)
'
