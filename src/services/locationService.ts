/**
 * Location Service
 * Fetches location data (countries, governorates, districts, localities)
 */

import { customInstance } from "@/api/mutator/customInstance";

// ============================================================================
// Types
// ============================================================================

export interface Country {
  id: number;
  code: string;
  name: string;
  phoneCode: string;
}

export interface Location {
  id: number;
  name: string;
  type: string;
  parentId: number;
  parentName: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get location by ID (any type)
 */
export const getLocationById = async (id: number): Promise<Location> => {
  return customInstance<Location>(`/Locations/${id}`);
};

/**
 * Get all countries
 */
export const getCountries = async (): Promise<Country[]> => {
  return customInstance<Country[]>('/Locations/countries');
};

/**
 * Get all governorates
 */
export const getGovernorates = async (): Promise<Location[]> => {
  return customInstance<Location[]>('/Locations/governorates');
};

/**
 * Get districts by governorate ID
 */
export const getDistrictsByGovernorate = async (governorateId: number): Promise<Location[]> => {
  return customInstance<Location[]>(`/Locations/governorates/${governorateId}/districts`);
};

/**
 * Get localities by district ID
 */
export const getLocalitiesByDistrict = async (districtId: number): Promise<Location[]> => {
  return customInstance<Location[]>(`/Locations/districts/${districtId}/localities`);
};

// ============================================================================
// Service Object
// ============================================================================

export const locationService = {
  getLocationById,
  getCountries,
  getGovernorates,
  getDistrictsByGovernorate,
  getLocalitiesByDistrict,
};
