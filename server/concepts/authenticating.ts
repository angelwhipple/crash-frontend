import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface UserDoc extends BaseDoc {
  username: string;
  password: string;
  email: string
  groups: ObjectId[];
}

/**
 * concept: Authenticating
 */
export default class AuthenticatingConcept {
  public readonly users: DocCollection<UserDoc>;

  /**
   * Make an instance of Authenticating.
   */
  constructor(collectionName: string) {
    this.users = new DocCollection<UserDoc>(collectionName);

    // Create index on username to make search queries for it performant
    void this.users.collection.createIndex({ username: 1 });
  }

  async create(username: string, password: string, email: string) {
    await this.assertGoodCredentials(username, password, email);
    const _id = await this.users.createOne({ username, password, email });
    return { msg: "User created successfully!", user: await this.users.readOne({ _id }) };
  }

  private redactPassword(user: UserDoc): Omit<UserDoc, "password"> {
    // eslint-disable-next-line
    const { password, ...rest } = user;
    return rest;
  }

  async getUserById(_id: ObjectId) {
    const user = await this.users.readOne({ _id });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.redactPassword(user);
  }

  async getUserByUsername(username: string) {
    const user = await this.users.readOne({ username });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.redactPassword(user);
  }

  async getUserByEmail(email: string) {
    const user = await this.users.readOne({ email });
    if (user === null) {
      throw new NotFoundError(`User not found!`);
    }
    return this.redactPassword(user);
  }

  async idsToUsernames(ids: ObjectId[]) {
    const users = await this.users.readMany({ _id: { $in: ids } });

    // Store strings in Map because ObjectId comparison by reference is wrong
    const idToUser = new Map(users.map((user) => [user._id.toString(), user]));
    return ids.map((id) => idToUser.get(id.toString())?.username ?? "DELETED_USER");
  }

  async getUsers(username?: string) {
    // If username is undefined, return all users by applying empty filter
    const filter = username ? { username } : {};
    return (await this.users.readMany(filter)).map(this.redactPassword);
  }

  async authenticate(email: string, password: string) {
    const user = await this.users.readOne({ email, password });
    if (!user) {
      throw new NotAllowedError("Email or password is incorrect.");
    }
    return { msg: "Successfully authenticated.", _id: user._id };
  }

  async updateUsername(_id: ObjectId, username: string) {
    await this.assertUsernameUnique(username);
    await this.users.partialUpdateOne({ _id }, { username });
    return { msg: "Username updated successfully!" };
  }

  async updatePassword(_id: ObjectId, currentPassword: string, newPassword: string) {
    const user = await this.users.readOne({ _id });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.password !== currentPassword) {
      throw new NotAllowedError("The given current password is wrong!");
    }

    await this.users.partialUpdateOne({ _id }, { password: newPassword });
    return { msg: "Password updated successfully!" };
  }

  async subscribeToGroup(_id: ObjectId, group: ObjectId) {
    await this.assertUserExists(_id);
    await this.users.extendArray({ _id }, { groups: group });
    return { msg: `User ${_id} joined group ${group}` };
  }

  async unsubscribeFromGroup(_id: ObjectId, group: ObjectId) {
    await this.assertUserExists(_id);
    await this.users.pullFromArray({ _id }, { groups: group });
    return { msg: `User ${_id} joined group ${group}` };
  }

  async delete(_id: ObjectId) {
    await this.users.deleteOne({ _id });
    return { msg: "User deleted!" };
  }

  async assertUserExists(_id: ObjectId) {
    const maybeUser = await this.users.readOne({ _id });
    if (maybeUser === null) {
      throw new NotFoundError(`User not found!`);
    }
  }

  private async assertGoodCredentials(username: string, password: string, email: string) {
    if (!username || !password || !email) {
      throw new BadValuesError("Username, email, and password must be non-empty!");
    }
    await this.assertUsernameUnique(username);
    await this.assertValidEmail(email);
  }

  private async assertUsernameUnique(username: string) {
    if (await this.users.readOne({ username })) {
      throw new NotAllowedError(`User with username ${username} already exists!`);
    }
  }

  private async assertValidEmail(email: string) {
    const account = await this.users.readOne({ email });
    if (account) {
      throw new NotAllowedError(`User with email ${email} already exists!`);
    }

    const personalDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "aol.com"
    ];
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domain = email.split('@')[1];
    if (!regex.test(email) || personalDomains.includes(domain)) {
      throw new BadValuesError("Please provide a valid work/school email.");
    }
  }
}
