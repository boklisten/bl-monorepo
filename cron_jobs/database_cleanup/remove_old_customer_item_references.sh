mongosh "${MONGO_URL}" --eval '
console.log("Removing old customer item references...")
db.userdetails.aggregate([
    {
        $lookup: {
            from: "customeritems",
            localField: "customerItems",
            foreignField: "_id",
            as: "matched_customerItems"
        }
    },
    {
        $addFields: {
            customerItems: {
                $filter: {
                    input: "$customerItems",
                    as: "customerItem",
                    cond: { $in: ["$$customerItem", "$matched_customerItems._id"] }
                }
            }
        }
    },
    {
       $project: {
           customerItems: 1,
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
