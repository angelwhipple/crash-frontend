import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Posting, Sessioning, Grouping, Locating, Requesting, Eventing } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";
import session from "express-session";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  /**
   * USERS
   */

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:id")
  @Router.validate(z.object({ id: z.string().min(1) }))
  async getUser(id: string) {
    const oid = new ObjectId(id);
    return await Authing.getUserById(oid);
  }

  @Router.get("/users/validate/:email")
  @Router.validate(z.object({ email: z.string().min(1) }))
  async getUserByEmail(email: string) {
    return await Authing.getUserByEmail(email);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string, email: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password, email);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    await Requesting.deleteBySender(user);
    await Requesting.deleteByRecipient(user);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, email: string, password: string) {
    const u = await Authing.authenticate(email, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  /**
   * POSTS
   */

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const created = await Posting.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  /**
   * FRIENDS
   */

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friends/requests")
  async getFriendRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.Requests(await Requesting.getRequests(user, "friend"));
  }

  /**
   * GROUPS
   */

  @Router.get("/groups")
  async getGroups() {
    return await Grouping.getAllGroups();
  }

  @Router.get("/groups/:id")
  async getGroupById(id: string) {
    const oid = new ObjectId(id);
    return await Grouping.getById(oid);
  }

  @Router.post("/groups")
  async createGroup(session: SessionDoc, name: string, category: "community" | "roommate", capacity: string, privacy: string, location?: string)  {
    const user = Sessioning.getUser(session);
    const locationId = undefined;
    if (location) {
      const locationId = new ObjectId(location);
      await Locating.assertLocationExists(locationId);
    }
    const response = await Grouping.create(name, category, user, capacity, privacy, locationId);
    await Authing.subscribeToGroup(user, response.group!._id);
    return response;
  }

  @Router.put("/groups/:id")
  async renameGroup(session: SessionDoc, id: string, name: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    return await Grouping.rename(oid, user, name);
  }

  @Router.put("/groups/members/add/:id")
  async addGroupMember(id: string, user: string) {
    const groupId = new ObjectId(id);
    const newMemberId = new ObjectId(user);
    await Authing.subscribeToGroup(newMemberId, groupId);
    return await Grouping.addMember(groupId, newMemberId);

  }

  @Router.put("/groups/members/remove/:id")
  async removeGroupMember(id: string, member: string) {
    const groupId = new ObjectId(id);
    const memberId = new ObjectId(member);
    await Authing.unsubscribeFromGroup(memberId, groupId);
    return await Grouping.removeMember(groupId, memberId);
  }

  @Router.delete("/groups/:id")
  async disbandGroup(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const groupId = new ObjectId(id);
    const response = await Grouping.disband(groupId, user);
    await Authing.unsubscribeFromGroup(user, groupId);
    await Requesting.deleteByType(groupId, "group");
    return response
  }

  /**
   * LOCATIONS
   */

  @Router.get("/locations")
  @Router.validate(z.object({ city: z.string().optional(), state: z.string().optional() }))
  async getLocations(city?: string,state?: string) {
    if (city && state) {
      return await Locating.getByCity(city, state);
    } else if (state) {
      return await Locating.getByState(state);
    } else if (city) {
      return await Locating.getByState(city);
    }
    return await Locating.getLocations();
  }

  @Router.post("/locations")
  @Router.validate(
    z.object({
      name: z.string().min(1),
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipcode: z.string().min(1),
      latitude: z.string().min(1),
      longitude: z.string().min(1)
    }))
  async createLocation(name: string, street: string, city: string, state: string, zipcode: string, latitude: string, longitude: string) {
    return await Locating.create(name, street, city, state, zipcode, Number(latitude), Number(longitude));
  }

  @Router.delete("/locations/:id")
  async deleteLocation(id: string) {
    const oid = new ObjectId(id);
    return await Locating.delete(oid);
  }

  /**
   * REQUESTS
   */

  @Router.post("/requests/:category/:id")
  async openRequest(session: SessionDoc, category: "friend" | "group" | "event", id: string, message?: string) {
    const resourceId = new ObjectId(id);
    const sender = Sessioning.getUser(session);
    let recipient;
    switch (category) {
      case "friend":
        recipient = resourceId;
        await Friending.assertNotFriends(sender, recipient);
        break;
      case "group": recipient = await Grouping.getOwner(resourceId); break;
      case "event": recipient = await Eventing.getHost(resourceId); break;
    }
    return await Requesting.open(sender, recipient!, resourceId, category, message);
  }

  @Router.get("/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Requesting.getRequests(user);
  }

  @Router.get(`/requests/:category/:id`)
  async getRequestsByResource(id: string, category: 'group' | 'event' | 'friend') {
    const oid = new ObjectId(id);
    return await Requesting.getRequestsByResource(oid, category);
  }

  @Router.put("/requests/accept/:requestId")
  async acceptRequest(session: SessionDoc, requestId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(requestId);
    const response =  await Requesting.respond(oid, user, true)
    switch (response.request!.category) {
      case "friend": return await Friending.addFriend(response.request!.sender, response.request!.recipient);
      case "group":
        await Authing.subscribeToGroup(user, response.request!.resource);
        return await Grouping.addMember(response.request!.resource, response.request!.sender);
      case "event": return await Eventing.register(response.request!.resource, response.request!.sender);
    }
  }

  @Router.put("/requests/decline/:requestId")
  async declineRequest(session: SessionDoc, requestId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(requestId);
    return await Requesting.respond(oid, user, false)
  }

  @Router.delete("/requests/:requestId")
  async withdrawRequest(session: SessionDoc, requestId: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(requestId);
    return await Requesting.withdraw(oid, user);
  }

  /**
   * EVENTS
   */

  @Router.post("/events")
  async createEvent(session: SessionDoc, name: string, group: string, start: string, end: string, capacity: string, location: string) {
    const user = Sessioning.getUser(session);
    const userId = new ObjectId(user);
    const groupId = new ObjectId(group);
    const locationId = new ObjectId(location);
    await Grouping.assertGroupExists(groupId);
    await Locating.assertLocationExists(locationId);
    return await Eventing.create(name, groupId, userId, Number(capacity), locationId, new Date(start), new Date(end));
  }

  @Router.get("/events")
  async getEvents() {
    return await Eventing.getEvents();
  }

  @Router.get("/events/name")
  async filterEventsByName(name: string) {
    return await Eventing.getByName(name);
  }

  @Router.get("/events/:filter")
  async filterEventsByTime(filter: string) {
    return await Eventing.getEvents(filter);
  }

  @Router.put("/events/:id")
  async renameEvent(session: SessionDoc, id: string, name: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    return await Eventing.rename(oid, user, name);
  }

  @Router.put("/events/register/:id")
  async registerForEvent(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    return await Eventing.register(oid, user);
  }

  @Router.put("/events/unregister/:id")
  async unregisterFromEvent(session: SessionDoc, id: string ) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    return await Eventing.unregister(oid, user);
  }

  @Router.delete("/events")
  async deleteEvent(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    const response = await Eventing.delete(oid, user);
    await Requesting.deleteByType(oid, "event");
    return response;
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
