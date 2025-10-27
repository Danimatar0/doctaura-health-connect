/**
 * Pharmacy Data Service
 *
 * This service provides a unified interface for accessing pharmacy data.
 * It automatically toggles between mock data and API calls based on the
 * VITE_USE_MOCK_DATA environment variable.
 *
 * Usage:
 * - Set VITE_USE_MOCK_DATA=false in .env to use real API
 * - Set VITE_USE_MOCK_DATA=true (or omit) to use mock data
 */

import { env } from "@/config/env";
import { Pharmacy } from "@/types";
import { mockPharmacies } from "@/data/mockPharmacies";

// API endpoints
const API_ENDPOINTS = {
  pharmacies: `${env.api.baseUrl}/api/pharmacies`,
  pharmacyById: (id: string) => `${env.api.baseUrl}/api/pharmacies/${id}`,
  searchPharmacies: `${env.api.baseUrl}/api/pharmacies/search`,
};

// Mock data functions
const getMockPharmacies = async (): Promise<Pharmacy[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPharmacies;
};

const getMockPharmacyById = async (id: string): Promise<Pharmacy | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPharmacies.find(pharmacy => pharmacy.id === id);
};

// API data functions
const getApiPharmacies = async (): Promise<Pharmacy[]> => {
  const response = await fetch(API_ENDPOINTS.pharmacies, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pharmacies: ${response.statusText}`);
  }

  return response.json();
};

const getApiPharmacyById = async (id: string): Promise<Pharmacy | undefined> => {
  const response = await fetch(API_ENDPOINTS.pharmacyById(id), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error(`Failed to fetch pharmacy: ${response.statusText}`);
  }

  return response.json();
};

// Public API
export const pharmacyDataService = {
  /**
   * Get all pharmacies
   */
  getPharmacies: async (): Promise<Pharmacy[]> => {
    if (env.features.useMockData) {
      return getMockPharmacies();
    }
    return getApiPharmacies();
  },

  /**
   * Get a specific pharmacy by ID
   */
  getPharmacyById: async (id: string): Promise<Pharmacy | undefined> => {
    if (env.features.useMockData) {
      return getMockPharmacyById(id);
    }
    return getApiPharmacyById(id);
  },

  /**
   * Get pharmacies by location
   */
  getPharmaciesByLocation: async (location: string): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    if (location === "All Locations") return pharmacies;
    return pharmacies.filter(pharmacy => pharmacy.location === location);
  },

  /**
   * Get pharmacies that have a specific medication
   */
  getPharmaciesByMedication: async (medication: string): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    return pharmacies.filter(pharmacy =>
      pharmacy.medications.some(med =>
        med.toLowerCase().includes(medication.toLowerCase())
      )
    );
  },

  /**
   * Get pharmacies that are open 24 hours
   */
  get24HourPharmacies: async (): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    return pharmacies.filter(pharmacy => pharmacy.isOpen24Hours);
  },

  /**
   * Get pharmacies with delivery service
   */
  getPharmaciesWithDelivery: async (): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    return pharmacies.filter(pharmacy => pharmacy.deliveryAvailable);
  },

  /**
   * Get pharmacies that accept insurance
   */
  getPharmaciesAcceptingInsurance: async (): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    return pharmacies.filter(pharmacy => pharmacy.acceptsInsurance);
  },

  /**
   * Search pharmacies by name or service
   */
  searchPharmacies: async (query: string): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    const lowerQuery = query.toLowerCase();

    return pharmacies.filter(pharmacy =>
      pharmacy.name.toLowerCase().includes(lowerQuery) ||
      pharmacy.services.some(service => service.toLowerCase().includes(lowerQuery)) ||
      pharmacy.medications.some(med => med.toLowerCase().includes(lowerQuery))
    );
  },

  /**
   * Get unique locations
   */
  getLocations: async (): Promise<string[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    const locations = [...new Set(pharmacies.map(p => p.location))];
    return locations.sort();
  },

  /**
   * Get unique medications
   */
  getMedications: async (): Promise<string[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();
    const medications = new Set<string>();

    pharmacies.forEach(pharmacy => {
      pharmacy.medications.forEach(med => medications.add(med));
    });

    return Array.from(medications).sort();
  },

  /**
   * Find pharmacies with prescribed medications
   */
  findPharmaciesWithMedications: async (medications: string[]): Promise<Pharmacy[]> => {
    const pharmacies = await pharmacyDataService.getPharmacies();

    return pharmacies.filter(pharmacy =>
      medications.some(prescribedMed =>
        pharmacy.medications.some(pharmacyMed =>
          pharmacyMed.toLowerCase().includes(prescribedMed.toLowerCase()) ||
          prescribedMed.toLowerCase().includes(pharmacyMed.toLowerCase())
        )
      )
    );
  },
};

// Helper to check if using mock data
export const isUsingMockData = () => env.features.useMockData;
