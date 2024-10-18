import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface EventDoc extends BaseDoc {
  name: string;
  group: ObjectId; // one Group
  host: ObjectId; // one User
  attendees: ObjectId[]; // set User
  start: Date;
  end: Date;
  capacity: number;
  location: ObjectId; // one Location
}

/**
 * concept: Eventing
 */
export default class EventingConcept {
  public readonly events: DocCollection<EventDoc>;

  constructor(collectionName: string) {
    this.events = new DocCollection<EventDoc>(collectionName);
  }

  async create(name: string, group: ObjectId, host: ObjectId, capacity: number, location: ObjectId, start: Date, end: Date) {
    const _id = await this.events.createOne({ name, group, host, attendees: [host], capacity, location, start, end });
    return { msg: `Created a new event: ${name}`, event: await this.events.readOne({ _id }) };
  }

  async rename(_id: ObjectId, user: ObjectId, name: string) {
    await this.assertUserIsHost(_id, user);
    await this.events.partialUpdateOne({ _id }, { name });
    return { msg: `Renamed event: ${name}` };
  }

  async getEvents(filter?: string) {
    let dbFilter = {}
    if (filter) {
      dbFilter = (filter === "upcoming") ? { start: { $gte: new Date() } } : { end: { $lte: new Date() } };
    }
    return await this.events.readMany(dbFilter, { sort: { start: -1 } });
  }

  async getByName(name: string) {
    return await this.events.readMany({ name: { $regex: name, $options: "i" } });
  }

  async getHost(_id: ObjectId) {}

  async register(_id: ObjectId, attendee: ObjectId) {
    await this.assertEventUnderCapacity(_id);
    await this.assertNewAttendee(_id, attendee);
    await this.events.extendArray({ _id }, { attendees: attendee });
    return { msg: `Registered user ${attendee} to attend event ${_id}!` };
  }

  async registerMany(_id: ObjectId, attendees: ObjectId[]) {
    await this.assertEventUnderCapacity(_id);
    await Promise.all(attendees.map(attendee => this.assertNewAttendee(_id, attendee)));
    await this.events.extendArray({ _id }, { attendees: { $each: attendees }})
    return { msg: `Registered multiple users to attend event ${_id}` };
  }

  async unregister(_id: ObjectId, attendee: ObjectId) {
    await this.assertExistingAttendee(_id, attendee);
    await this.events.pullFromArray({ _id }, { attendees: attendee });
    return { msg: `User ${attendee} is no longer attending event ${_id}!` };
  }

  async unregisterMany(_id: ObjectId, attendees: ObjectId[]) {
    await Promise.all(attendees.map(attendee => this.assertExistingAttendee(_id, attendee)));
    await Promise.all(attendees.map(attendee => this.events.pullFromArray({ _id }, { attendees: attendee })));
    return { msg: `Multiple users are no longer attending event ${_id}!` };
  }

  async delete(_id: ObjectId, user: ObjectId) {
    await this.assertUserIsHost(_id, user);
    await this.events.deleteOne({ _id });
    return { msg: `Successfully removed event ${_id}` };
  }

  async assertEventUnderCapacity(_id: ObjectId) {
    const event = await this.events.readOne({ _id });
    if (!event) {
      throw new NotFoundError(`Event with id ${_id} not found!`);
    }
    if (event.attendees.length === event.capacity) {
      throw new EventMaxCapacityError(_id);
    }
  }

  async assertEventExists(_id: ObjectId) {
    const event = await this.events.readOne({ _id });
    if (!event) {
      throw new NotFoundError(`Event with id ${_id} not found!`);
    }
    return event;
  }

  async assertUserIsHost(_id: ObjectId, user: ObjectId) {
    const event = await this.assertEventExists(_id);
    if (event.host.toString() !== user.toString()) {
      throw new NotAllowedError(`User ${user} is not the host of event ${_id}!`);
    }
  }

  async assertNewAttendee(_id: ObjectId, user: ObjectId) {
    const event = await this.assertEventExists(_id);
    if (event.attendees.some(attendee => attendee.toString() === user.toString())) {
      throw new NotAllowedError(`User ${user} is already attending this event!`);
    }
  }

  async assertExistingAttendee(_id: ObjectId, user: ObjectId) {
    const event = await this.assertEventExists(_id);
    if (!event.attendees.some(attendee => attendee.toString() === user.toString())) {
      throw new NotAllowedError(`User ${user} is not attending this event.`);
    }
  }
}

export class EventMaxCapacityError extends NotAllowedError {
  constructor(
    public readonly _id: ObjectId,
  ) {
    super("Event {0} is at max capacity!", _id);
  }
}