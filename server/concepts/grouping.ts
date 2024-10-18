import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { AlreadyExistsError, BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
  name: string;
  owner: ObjectId; // one User
  members: ObjectId[]; // set User
  capacity: number;
  privacy: boolean;
  location: ObjectId; // one Location
}

/**
 * concept: Grouping
 */
export default class GroupingConcept {
  public readonly groups: DocCollection<GroupDoc>;

  constructor(collectionName: string) {
    this.groups = new DocCollection<GroupDoc>(collectionName);
  }

  async create(name: string, owner: ObjectId, capacity: string, privacy: string, location?: ObjectId) {
    await this.assertGoodInputs(name, privacy, capacity);
    const groupPrivacy = privacy === "true";
    const _id = await this.groups.createOne({ name, owner, members: [owner], capacity: Number(capacity), privacy: groupPrivacy, location });
    return { msg: `Created a new group: ${name}`, group: await this.groups.readOne({ _id }) };
  }

  async rename(_id: ObjectId, user: ObjectId, name: string) {
    await this.assertOwnerIsUser(_id, user);
    await this.groups.partialUpdateOne({ _id }, { name })
    return { msg: `Renamed group: ${name}`, group: await this.groups.readOne({ _id }) };
  }

  async addMember(_id: ObjectId, user: ObjectId) {
    await this.assertUserNotMember(_id, user);
    await this.groups.extendArray({ _id }, { members: user });
    return { msg: `Added user ${user} to group ${_id}` };
  }

  async addManyMembers(_id: ObjectId, owner: ObjectId, users: ObjectId[]) {
    await this.assertOwnerIsUser(_id, owner); // Only group owners can bulk add members
    await Promise.all(users.map(user => this.assertUserNotMember(_id, user)));
    await this.groups.extendArray({ _id }, { members: { $each: users } });
    return { msg: `Added new users to group ${_id}` };
  }

  async removeMember(_id: ObjectId, user: ObjectId) {
    await this.assertUserIsMember(_id, user); // Anyone can leave a group, no ownership check
    await this.groups.pullFromArray({ _id }, { members: user });
    return { msg: `Removed user ${user} from group ${_id}` };
  }

  async removeManyMembers(_id: ObjectId, owner: ObjectId, members: ObjectId[]) {
    await this.assertOwnerIsUser(_id, owner); // Only group owners can bulk remove members
    await Promise.all(members.map(member => this.assertUserIsMember(_id, member)));
    await Promise.all(members.map(member => this.groups.pullFromArray({ _id }, { members: member })));
    return { msg: `Removed multiple users from group ${_id}` };
  }

  async getAllGroups() {
    return await this.groups.readMany({}, { sort: { _id: -1 } });
  }

  async getById(_id: ObjectId) {
    return await this.groups.readOne({ _id });
  }

  async getByOwner(owner: ObjectId) {
    return await this.groups.readMany({ owner });
  }

  async getByName(name: string) {
    return await this.groups.readMany({ name });
  }

  async getOwner(_id: ObjectId) {
    const group = await this.assertGroupExists(_id);
    return group.owner;
  }

  async disband(_id: ObjectId, user: ObjectId) {
    await this.assertOwnerIsUser(_id, user)
    await this.groups.deleteOne({ _id });
    return { msg: "Group disbanded successfully!" };
  }

  async assertOwnerIsUser(_id: ObjectId, user: ObjectId) {
    const group = await this.assertGroupExists(_id);
    if (group.owner.toString() !== user.toString()) {
      throw new NotAllowedError(`User ${user} is not the owner of group ${_id}!`);
    }
  }

  async assertUserIsMember(_id: ObjectId, user: ObjectId) {
    const group = await this.assertGroupExists(_id);
    if (group.members.every(member => member.toString() !== user.toString())) {
      throw new NotAllowedError(`User ${user} is a member of group ${_id}!`);
    }
  }

  async assertUserNotMember(_id: ObjectId, user: ObjectId) {
    const group = await this.assertGroupExists(_id);
    if (group.members.some(member => member.toString() === user.toString())) {
      throw new NotAllowedError(`User ${user} is already a member of group ${_id}!`);
    }
  }

  async assertGoodInputs(name: string, privateSetting: string, capacity: string) {
    const group = await this.groups.readOne({ name });
    if (group) {
      throw new AlreadyExistsError(`Group with name ${name} already exists!`);
    }
    if (privateSetting !== "true" && privateSetting !== "false") {
      throw new BadValuesError(`Please enter 'true' or 'false' for group privacy.`);
    }
    if (!/^-?\d+(\.\d+)?$/.test(capacity)) {
      throw new BadValuesError('Please enter a numeric capacity!');
    }
  }

  async assertGroupExists(_id: ObjectId) {
    const group = await this.groups.readOne({ _id });
    if (!group) {
      throw new NotFoundError(`Group with id ${_id} does not exist!`);
    }
    return group;
  }
}