import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface FriendshipDoc extends BaseDoc {
  user1: ObjectId;
  user2: ObjectId;
}

/**
 * concept: Friending [User]
 */
export default class FriendingConcept {
  public readonly friends: DocCollection<FriendshipDoc>;

  /**
   * Make an instance of Friending.
   */
  constructor(collectionName: string) {
    this.friends = new DocCollection<FriendshipDoc>(collectionName);
  }

  async removeFriend(user: ObjectId, friend: ObjectId) {
    const friendship = await this.friends.popOne({
      $or: [
        { user1: user, user2: friend },
        { user1: friend, user2: user },
      ],
    });
    if (friendship === null) {
      throw new FriendNotFoundError(user, friend);
    }
    return { msg: "Unfriended!" };
  }

  async getFriends(user: ObjectId) {
    const friendships = await this.friends.readMany({
      $or: [{ user1: user }, { user2: user }],
    });
    // Making sure to compare ObjectId using toString()
    return friendships.map((friendship) => (friendship.user1.toString() === user.toString() ? friendship.user2 : friendship.user1));
  }

  async addFriend(user1: ObjectId, user2: ObjectId) {
    await this.assertNotFriends(user1, user2)
    void this.friends.createOne({ user1, user2 });
  }

  public async assertNotFriends(u1: ObjectId, u2: ObjectId) {
    const friendship = await this.friends.readOne({
      $or: [
        { user1: u1, user2: u2 },
        { user1: u2, user2: u1 },
      ],
    });
    if (friendship !== null || u1.toString() === u2.toString()) {
      throw new AlreadyFriendsError(u1, u2);
    }
  }
}

export class FriendNotFoundError extends NotFoundError {
  constructor(
    public readonly user1: ObjectId,
    public readonly user2: ObjectId,
  ) {
    super("Friendship between {0} and {1} does not exist!", user1, user2);
  }
}

export class AlreadyFriendsError extends NotAllowedError {
  constructor(
    public readonly user1: ObjectId,
    public readonly user2: ObjectId,
  ) {
    super("{0} and {1} are already friends!", user1, user2);
  }
}
