import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { AlreadyExistsError, BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface RequestDoc extends BaseDoc {
  sender: ObjectId; // one User
  recipient: ObjectId; // one User
  resource: ObjectId; // one Group | Event | User
  category: "friend" | "group" | "event";
  status: "pending" | "declined" | "accepted";
  message?: string;
}

/**
 * concept: Requesting
 */
export default class RequestingConcept {
  public readonly requests: DocCollection<RequestDoc>;

  constructor(collectionName: string) {
    this.requests = new DocCollection<RequestDoc>(collectionName);
  }

  async open(sender: ObjectId, recipient: ObjectId, resource: ObjectId, category: 'friend' | 'group' | 'event', message?: string) {
    await this.assertNewRequest(sender, resource, category);
    const _id = await this.requests.createOne({ sender, recipient, resource, category, status: 'pending', message });
    return { msg: `Opened a new ${category} request!`, request: await this.requests.readOne({ _id }) };
  }

  async respond(_id: ObjectId, user: ObjectId, accept: boolean) {
    await this.assertUserIsRecipient(_id, user);
    await this.requests.partialUpdateOne({ _id }, { status: accept ? 'accepted' : 'declined' });
    return { msg: `Successfully ${accept ? 'accepted' : 'declined'} request!`, request: await this.requests.readOne({ _id }) };
  }

  async getRequests(user: ObjectId, category?: 'friend' | 'group' | 'event') {
    return await this.requests.readMany({ $or: [{sender: user}, {recipient: user}], category });
  }

  async getRequestsByResource(resource: ObjectId, category: "friend" | "group" | "event")  {
    return await this.requests.readMany({ resource, category });
  }

  async withdraw(_id: ObjectId, user: ObjectId)  {
    await this.assertUserIsSender(_id, user);
    await this.requests.deleteOne({ _id });
    return { msg: `Withdrew request ${_id}!`};
  }

  async deleteBySender(sender: ObjectId)  {
    await this.requests.deleteMany({ sender });
  }

  async deleteByRecipient(recipient: ObjectId)  {
    await this.requests.deleteMany({ recipient });
  }

  async deleteByType(resource: ObjectId, category: "friend" | "group" | "event")  {
    await this.requests.deleteMany({ resource, category });
  }

  async assertNewRequest(sender: ObjectId, resource: ObjectId, category: "friend" | "group" | "event") {
    const request = await this.requests.readOne({ sender, resource, category, status: "pending" });
    if (request) {
     throw new NotAllowedError(`A ${category} request from user ${sender} for resource ${resource} is already pending.`);
    }
  }

  async assertRequestExists(_id: ObjectId) {
    const request = await this.requests.readOne({ _id })
    if (!request) {
      throw new NotFoundError(`Request with id ${_id} does not exist!`);
    }
    return request;
  }

  async assertUserIsSender(_id: ObjectId, user: ObjectId) {
    const request = await this.assertRequestExists(_id);
    if (request.sender.toString() !== user.toString()) {
      throw new NotAllowedError(`User ${user} is not the sender of request ${_id}!`);
    }
  }

  async assertUserIsRecipient(_id: ObjectId, user: ObjectId) {
    const request = await this.assertRequestExists(_id);
    if (request.recipient.toString() !== user.toString()) {
      throw new NotAllowedError(`User ${user} is not the recipient of request ${_id}!`);
    }
  }
}