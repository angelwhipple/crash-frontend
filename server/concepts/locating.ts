import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface LocationDoc extends BaseDoc {
  name: string;
  lat: number;
  lng: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

/**
 * concept: Locating
 */
export default class LocatingConcept {
  public readonly locations: DocCollection<LocationDoc>;

  constructor(collectionName: string) {
    this.locations = new DocCollection<LocationDoc>(collectionName);
  }

  async create(name: string, lat: number, lng: number, street?: string, city?: string, state?: string, country?: string, postal_code?: string) {
    const _id = await this.locations.createOne({ name, street, city, state, country, postal_code, lat, lng });
    return await this.locations.readOne({ _id });
  }

  async getLocations() {
    return await this.locations.readMany({}, { sort: { _id: -1 } });
  }

  async getById(_id: ObjectId) {
    return { msg: `Fetched location`, location: await this.locations.readOne({ _id }) };
  }

  async getByName(name: string) {
    return await this.locations.readMany({ name });
  }

  async getByState(state: string) {
    return await this.locations.readMany({ state });
  }

  async getByCity(city: string, state: string){
    return await this.locations.readMany({ city, state });
  }

  async getByPostalCode(postal_code: string){
    return await this.locations.readMany({ postal_code });
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