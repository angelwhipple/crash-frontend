import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface LocationDoc extends BaseDoc {
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
}

/**
 * concept: Locating
 */
export default class LocatingConcept {
  public readonly locations: DocCollection<LocationDoc>;

  constructor(collectionName: string) {
    this.locations = new DocCollection<LocationDoc>(collectionName);
  }

  async create(name: string, street: string, city: string, state: string, zipcode: string, latitude: number, longitude: number) {
    const _id = await this.locations.createOne({ name, street, city, state, zipcode, latitude, longitude });
    return { msg: `New location ${name} geo-tagged at (${latitude}, ${longitude})`, location: await this.locations.readOne({ _id }) };
  }

  async getLocations() {
    return await this.locations.readMany({}, { sort: { _id: -1 } });
  }

  async getByName(name: string) {
    return await this.locations.readOne({ name });
  }

  async getByState(state: string) {
    return await this.locations.readMany({ state });
  }

  async getByCity(city: string, state: string){
    return await this.locations.readMany({ city, state });
  }

  async getByZipcode(zipcode: string){
    return await this.locations.readMany({ zipcode });
  }

  async delete(_id: ObjectId) {
    await this.locations.deleteOne({ _id });
    return { msg: "Location removed successfully!" };
  }

  async assertLocationExists(_id: ObjectId) {
    const location = await this.locations.readOne({ _id });
    if (!location) {
      throw new NotFoundError(`Location with id ${_id} does not exist!`);
    }
  }
}