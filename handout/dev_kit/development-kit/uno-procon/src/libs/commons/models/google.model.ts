import { Utils } from '../utils';

export interface GoogleModel {
  kind: string;
  etag: string;
  gender: string;
  emails: [
    {
      value: string;
      type: string;
    },
  ];
  objectType: string;
  id: string;
  displayName: string;
  name: {
    familyName: string;
    giveName: string;
  };
  url: string;
  image: {
    url: string;
  };
}

export interface GeoLocation {
  results: {
    address_components: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    formatted_address: string;
    geometry: {
      bounds: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    place_id: string;
    types: string[];
  }[];
  status: string;
}

//

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface GeoLocationMap {
  results: {
    addressComponents: AddressComponent[];
    formattedAddress: string;
    geometry: {
      bounds: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
      location: {
        lat: number;
        lng: number;
      };
      locationType: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    placeId: string;
    types: string[];
  }[];
  status: string;
}

export function mapGeoLocation(geoLocation: any): GeoLocationMap {
  return Utils.objects.camelCase(geoLocation);
}
