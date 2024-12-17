import { BlCollectionName } from "@backend/collections/bl-collection";
import { ToSchema } from "@backend/helper/typescript-helpers";
import { Schema } from "mongoose";

const { ObjectId } = Schema.Types;

/** @see MatchBase */
const matchBaseSchema = {
  /** @see MatchVariant */
  _variant: {
    type: String,
    required: true,
  },
  meetingInfo: {
    location: { type: String, required: true },
    date: { type: Date, required: true },
  },
};

/** @see UserMatch */
const userMatchSchema = {
  sender: {
    type: ObjectId,
    ref: BlCollectionName.UserDetails,
    default: undefined,
  },
  receiver: {
    type: ObjectId,
    ref: BlCollectionName.UserDetails,
    default: undefined,
  },
  // items which are expected to be handed over from sender to receiver
  expectedItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
    default: undefined,
  },
  // unique items owned by sender which have been given to anyone. May differ from receivedBlIds
  // when a book is borrowed and handed over to someone other than the technical owner's match
  deliveredBlIds: {
    type: [String],
    default: undefined,
  },
  // unique items which have been received by the receiver from anyone
  receivedBlIds: {
    type: [String],
    default: undefined,
  },
  // if true, disallow handing the items out or in at a stand, only allow match exchange
  itemsLockedToMatch: {
    type: Boolean,
    default: undefined,
  },
  // if receiver items have overrides, the generated customer items will
  // get the deadline specified in the override instead of using the branch defined deadline
  deadlineOverrides: {
    type: Map,
    of: String,
  },
};

/** @see StandMatch */
const standMatchSchema = {
  customer: {
    type: ObjectId,
    ref: BlCollectionName.UserDetails,
    default: undefined,
  },
  // items the customer has received from stand
  receivedItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
    default: undefined,
  },
  // items the customer has handed off to stand
  deliveredItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
    default: undefined,
  },
  // items which are expected to be handed off to stand
  expectedHandoffItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
    default: undefined,
  },
  // items which are expected to be picked up from stand
  expectedPickupItems: {
    type: [ObjectId],
    ref: BlCollectionName.Items,
    default: undefined,
  },
};

/**
 * The schema for {@link Match}.
 *
 * Variants implemented using the union of all possible keys, with those present only in some variants optional and
 * default undefined. No key name may be used with different definitions in multiple variants.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const matchSchema = new Schema<ToSchema<Match>>({
  ...matchBaseSchema,
  ...standMatchSchema,
  ...userMatchSchema,
});
