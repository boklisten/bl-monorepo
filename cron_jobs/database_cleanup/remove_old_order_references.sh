mongosh "${MONGO_URL}" --eval '
console.log("Removing old order references...")
db.userdetails.aggregate([
    {
        $lookup: {
            from: "orders",
            localField: "orders",
            foreignField: "_id",
            as: "matched_orders"
        }
    },
    {
        $addFields: {
            orders: {
                $filter: {
                    input: "$orders",
                    as: "order",
                    cond: { $in: ["$$order", "$matched_orders._id"] }
                }
            }
        }
    },
    {
       $project: {
           orders: 1,
       }
    },
    {
        $merge: {
            into: "userdetails",
            whenNotMatched: "discard"
        }
    }
])
'
